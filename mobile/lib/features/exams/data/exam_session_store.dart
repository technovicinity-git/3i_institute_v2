import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../domain/exam_models.dart';

// Submit a little before a hard close date so the request lands in time.
const _closeDateBuffer = Duration(seconds: 10);

/// An exam attempt in progress, persisted on the device so closing the app,
/// a crash or navigating away does not reset the timer, reshuffle a random
/// question set or lose the learner's answers.
class ExamSession {
  ExamSession({
    required this.examId,
    required this.profileId,
    required this.title,
    required this.closeDate,
    required this.startedAt,
    required this.durationMinutes,
    required this.questions,
    Map<String, Object>? answers,
    Set<String>? flagged,
    this.current = 0,
  }) : answers = answers ?? {},
       flagged = flagged ?? {};

  final String examId, profileId, title;

  /// Hard close date of the exam, if any — the server rejects later submits.
  final DateTime? closeDate;

  /// When the learner pressed "Start exam". Anchors the timer.
  final DateTime startedAt;

  /// Duration frozen at start so a later edit can't shift it.
  final int durationMinutes;

  /// The exact questions shown (random set for REGULAR dynamic exams).
  final List<ExamQuestion> questions;
  final Map<String, Object> answers;
  final Set<String> flagged;
  int current;

  /// When time runs out: end of the duration, or just before the close date.
  DateTime get deadline {
    final durationEnd = startedAt.add(Duration(minutes: durationMinutes));
    final close = closeDate?.subtract(_closeDateBuffer);
    return close != null && close.isBefore(durationEnd) ? close : durationEnd;
  }

  int get answeredCount =>
      questions.where((q) => isExamAnswered(answers[q.id])).length;

  Map<String, dynamic> toJson() => {
    'version': 1,
    'examId': examId,
    'profileId': profileId,
    'title': title,
    'closeDate': closeDate?.toUtc().toIso8601String(),
    'startedAt': startedAt.toUtc().toIso8601String(),
    'durationMinutes': durationMinutes,
    'questions': questions.map((q) => q.toJson()).toList(),
    'answers': answers,
    'flagged': flagged.toList(),
    'current': current,
  };

  static ExamSession? tryParse(String raw) {
    try {
      final json = jsonDecode(raw);
      if (json is! Map || json['version'] != 1) return null;
      final startedAt = DateTime.tryParse('${json['startedAt']}')?.toLocal();
      final questions = ((json['questions'] as List?) ?? const [])
          .whereType<Map>()
          .map((q) => ExamQuestion.fromJson(Map<String, dynamic>.from(q)))
          .toList(growable: false);
      if (startedAt == null || questions.isEmpty) return null;
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
        examId: '${json['examId']}',
        profileId: '${json['profileId']}',
        title: json['title'] as String? ?? 'Exam',
        closeDate: json['closeDate'] == null
            ? null
            : DateTime.tryParse('${json['closeDate']}')?.toLocal(),
        startedAt: startedAt,
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
