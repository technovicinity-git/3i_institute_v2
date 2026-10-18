import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../domain/exam_models.dart';

/// An exam attempt in progress, saved on the device so closing the app or a
/// crash keeps the learner's answers and place. The timer and question set
/// come from the server (POST /exams/:examId/start), which also enforces the
/// deadline; this copy is only for display and resuming.
class ExamSession {
  ExamSession({
    required this.sessionId,
    required this.examId,
    required this.profileId,
    required this.title,
    required this.startedAt,
    required this.deadline,
    required this.durationMinutes,
    required this.questions,
    Map<String, Object>? answers,
    Set<String>? flagged,
    this.current = 0,
  }) : answers = answers ?? {},
       flagged = flagged ?? {};

  /// Builds the session from the server's start response. The device clock
  /// may be wrong, so server times are shifted by the difference between the
  /// server's "now" and the device's (network delay ignored — it only makes
  /// the timer end slightly early, and submit has a grace period).
  factory ExamSession.fromStart(ExamStartData start, String profileId) {
    final offset = start.serverNow.difference(DateTime.now());
    return ExamSession(
      sessionId: start.sessionId,
      examId: start.exam.id,
      profileId: profileId,
      title: start.exam.title,
      startedAt: start.startedAt.subtract(offset),
      deadline: start.deadline.subtract(offset),
      durationMinutes: start.exam.duration,
      questions: start.questions,
    );
  }

  /// Server session id, sent back on submit.
  final String sessionId;
  final String examId, profileId, title;

  /// When the attempt started on the server, on the device clock.
  final DateTime startedAt;

  /// When time runs out (server deadline, already capped at the exam's close
  /// date), on the device clock.
  final DateTime deadline;

  /// Duration frozen at start so a later edit can't shift it.
  final int durationMinutes;

  /// The exact questions served (random set for REGULAR dynamic exams).
  final List<ExamQuestion> questions;
  final Map<String, Object> answers;
  final Set<String> flagged;
  int current;

  int get answeredCount =>
      questions.where((q) => isExamAnswered(answers[q.id])).length;

  Map<String, dynamic> toJson() => {
    'version': 2,
    'sessionId': sessionId,
    'examId': examId,
    'profileId': profileId,
    'title': title,
    'startedAt': startedAt.toUtc().toIso8601String(),
    'deadline': deadline.toUtc().toIso8601String(),
    'durationMinutes': durationMinutes,
    'questions': questions.map((q) => q.toJson()).toList(),
    'answers': answers,
    'flagged': flagged.toList(),
    'current': current,
  };

  static ExamSession? tryParse(String raw) {
    try {
      final json = jsonDecode(raw);
      // Version 1 sessions were timed by the device only; they're dropped
      // and the learner resumes through the server (same deadline).
      if (json is! Map || json['version'] != 2) return null;
      final sessionId = json['sessionId'];
      final startedAt = DateTime.tryParse('${json['startedAt']}')?.toLocal();
      final deadline = DateTime.tryParse('${json['deadline']}')?.toLocal();
      final questions = ((json['questions'] as List?) ?? const [])
          .whereType<Map>()
          .map((q) => ExamQuestion.fromJson(Map<String, dynamic>.from(q)))
          .toList(growable: false);
      if (sessionId is! String ||
          startedAt == null ||
          deadline == null ||
          questions.isEmpty) {
        return null;
      }
      final answers = <String, Object>{};
      final rawAnswers = json['answers'];
      if (rawAnswers is Map) {
        rawAnswers.forEach((key, value) {
          if (value is String) answers['$key'] = value;
          if (value is List) answers['$key'] = value.map((e) => '$e').toList();
        });
      }
      final current = (json['current'] as num?)?.toInt() ?? 0;
      return ExamSession(
        sessionId: sessionId,
        examId: '${json['examId']}',
        profileId: '${json['profileId']}',
        title: json['title'] as String? ?? 'Exam',
        startedAt: startedAt,
        deadline: deadline,
        durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 0,
        questions: questions,
        answers: answers,
        flagged: ((json['flagged'] as List?) ?? const [])
            .map((e) => '$e')
            .toSet(),
        current: current.clamp(0, questions.length - 1),
      );
    } catch (_) {
      return null;
    }
  }
}

bool isExamAnswered(Object? answer) {
  if (answer is String) return answer.trim().isNotEmpty;
  if (answer is List) return answer.isNotEmpty;
  return false;
}

class ExamSessionStore {
  const ExamSessionStore();

  static const _prefix = 'exam-session:';

  String _key(String profileId, String examId) => '$_prefix$profileId:$examId';

  Future<ExamSession?> load(String profileId, String examId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key(profileId, examId));
    if (raw == null) return null;
    final session = ExamSession.tryParse(raw);
    if (session == null) await prefs.remove(_key(profileId, examId));
    return session;
  }

  Future<void> save(ExamSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key(session.profileId, session.examId),
      jsonEncode(session.toJson()),
    );
  }

  Future<void> clear(String profileId, String examId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key(profileId, examId));
  }

  /// examId → deadline of every attempt the profile has in progress.
  Future<Map<String, DateTime>> deadlines(String profileId) async {
    final prefs = await SharedPreferences.getInstance();
    final prefix = '$_prefix$profileId:';
    final result = <String, DateTime>{};
    for (final key in prefs.getKeys().where((k) => k.startsWith(prefix))) {
      final raw = prefs.getString(key);
      final session = raw == null ? null : ExamSession.tryParse(raw);
      if (session != null) result[session.examId] = session.deadline;
    }
    return result;
  }
}
