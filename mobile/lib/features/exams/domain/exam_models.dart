class LearnerExam {
  const LearnerExam({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.title,
    required this.type,
    required this.duration,
    required this.passMark,
    required this.totalMarks,
    required this.maxAttempts,
    required this.cooldownHours,
    required this.openDate,
    required this.closeDate,
    required this.questions,
    required this.attemptCount,
    required this.lastAttemptAt,
    required this.bestScore,
    required this.passed,
  });

  final String id, courseId, courseTitle, title, type;
  final int duration, passMark, totalMarks, cooldownHours, attemptCount;
  final int? maxAttempts;
  final String? openDate, closeDate, lastAttemptAt;
  final double? bestScore;
  final bool? passed;

  factory LearnerExam.fromJson(Map<String, dynamic> json) => LearnerExam(
    id: json['id'] as String? ?? '',
    courseId: json['courseId'] as String? ?? '',
    courseTitle: json['courseTitle'] as String? ?? '',
    title: json['title'] as String? ?? 'Exam',
    type: json['type'] as String? ?? 'practice',
    duration: _int(json['duration']),
    passMark: _int(json['passMark']),
    totalMarks: _int(json['totalMarks']),
    maxAttempts: json['maxAttempts'] == null ? null : _int(json['maxAttempts']),
    cooldownHours: _int(json['cooldownHours']),
    openDate: json['openDate'] as String?,
    closeDate: json['closeDate'] as String?,
    questions: ((json['questions'] as List?) ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false),
    attemptCount: _int(json['attemptCount']),
    lastAttemptAt: json['lastAttemptAt'] as String?,
    bestScore: (json['bestScore'] as num?)?.toDouble(),
    passed: json['passed'] as bool?,
  );

  final List<Map<String, dynamic>> questions;
}

class ExamTakeData {
  const ExamTakeData({required this.exam, required this.questions});
  final ExamTakeInfo exam;
  final List<ExamQuestion> questions;

  factory ExamTakeData.fromJson(Map<String, dynamic> json) => ExamTakeData(
    exam: ExamTakeInfo.fromJson(
      json['exam'] is Map
          ? Map<String, dynamic>.from(json['exam'] as Map)
          : const {},
    ),
    questions: ((json['questions'] as List?) ?? const [])
        .whereType<Map>()
        .map((item) => ExamQuestion.fromJson(Map<String, dynamic>.from(item)))
        .toList(growable: false),
  );
}

class ExamTakeInfo {
  const ExamTakeInfo({
    required this.id,
    required this.title,
    required this.type,
    required this.duration,
    required this.passMark,
    required this.totalMarks,
    required this.maxAttempts,
    required this.openDate,
    required this.closeDate,
  });
  final String id, title, type;
  final int duration, passMark, totalMarks, maxAttempts;
  final String? openDate, closeDate;
  factory ExamTakeInfo.fromJson(Map<String, dynamic> j) => ExamTakeInfo(
    id: j['id'] as String? ?? '',
    title: j['title'] as String? ?? 'Exam',
    type: j['type'] as String? ?? 'practice',
    duration: _int(j['duration']),
    passMark: _int(j['passMark']),
    totalMarks: _int(j['totalMarks']),
    maxAttempts: _int(j['maxAttempts']),
    openDate: j['openDate'] as String?,
    closeDate: j['closeDate'] as String?,
  );
}

class ExamQuestion {
  const ExamQuestion({
    required this.id,
    required this.type,
    required this.question,
    required this.options,
    required this.marks,
  });
  final String id, type, question;
  final List<String> options;
  final int marks;
  factory ExamQuestion.fromJson(Map<String, dynamic> j) => ExamQuestion(
    id: j['id'] as String? ?? '',
    type: j['type'] as String? ?? 'mcq',
    question: j['question'] as String? ?? '',
    options: ((j['options'] as List?) ?? const []).map((e) => '$e').toList(),
    marks: _int(j['marks']),
  );
}

class ExamResultData {
  const ExamResultData({
    required this.exam,
    required this.attempts,
    required this.bestAttempt,
    required this.questionResults,
  });
  final ExamResultInfo exam;
  final List<ExamAttempt> attempts;
  final ExamAttempt? bestAttempt;
  final List<ExamQuestionResult> questionResults;
  factory ExamResultData.fromJson(Map<String, dynamic> j) {
    final attemptJson = ((j['attempts'] as List?) ?? const [])
        .whereType<Map>()
        .map((e) => ExamAttempt.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
    final best = j['bestAttempt'];
    return ExamResultData(
      exam: ExamResultInfo.fromJson(
        j['exam'] is Map
            ? Map<String, dynamic>.from(j['exam'] as Map)
            : const {},
      ),
      attempts: attemptJson,
      bestAttempt: best is Map
          ? ExamAttempt.fromJson(Map<String, dynamic>.from(best))
          : null,
      questionResults: ((j['questionResults'] as List?) ?? const [])
          .whereType<Map>()
          .map((e) => ExamQuestionResult.fromJson(Map<String, dynamic>.from(e)))
          .toList(growable: false),
    );
  }
}

class ExamResultInfo {
  const ExamResultInfo({
    required this.id,
    required this.title,
    required this.passMark,
    required this.totalMarks,
    required this.duration,
    required this.openDate,
  });
  final String id, title;
  final int passMark, totalMarks, duration;
  final String? openDate;
  factory ExamResultInfo.fromJson(Map<String, dynamic> j) => ExamResultInfo(
    id: j['id'] as String? ?? '',
    title: j['title'] as String? ?? 'Exam',
    passMark: _int(j['passMark']),
    totalMarks: _int(j['totalMarks']),
    duration: _int(j['duration']),
    openDate: j['openDate'] as String?,
  );
}

class ExamAttempt {
  const ExamAttempt({
    required this.id,
    required this.attemptNumber,
    required this.score,
    required this.totalMarks,
    required this.passed,
    required this.graded,
    required this.startedAt,
    required this.submittedAt,
  });
  final String id;
  final int attemptNumber, totalMarks;
  final double? score;
  final bool? passed;
  final bool graded;
  final String? startedAt, submittedAt;
  factory ExamAttempt.fromJson(Map<String, dynamic> j) => ExamAttempt(
    id: j['id'] as String? ?? '',
    attemptNumber: _int(j['attemptNumber']),
    score: (j['score'] as num?)?.toDouble(),
    totalMarks: _int(j['totalMarks']),
    passed: j['passed'] as bool?,
    graded: j['graded'] as bool? ?? false,
    startedAt: j['startedAt'] as String?,
    submittedAt: j['submittedAt'] as String?,
  );
}

class ExamQuestionResult {
  const ExamQuestionResult({
    required this.questionId,
    required this.question,
    required this.type,
    required this.options,
    required this.correctAnswer,
    required this.myAnswer,
    required this.marks,
    required this.marksAwarded,
    required this.explanation,
    required this.suggestedAnswer,
  });
  final String questionId, question, type;
  final List<String> options;
  final Object? correctAnswer, myAnswer;
  final int marks;
  final double? marksAwarded;
  final String? explanation, suggestedAnswer;
  factory ExamQuestionResult.fromJson(Map<String, dynamic> j) =>
      ExamQuestionResult(
        questionId: j['questionId'] as String? ?? '',
        question: j['question'] as String? ?? '',
        type: j['type'] as String? ?? 'mcq',
        options: ((j['options'] as List?) ?? const [])
            .map((e) => '$e')
            .toList(),
        correctAnswer: j['correctAnswer'],
        myAnswer: j['myAnswer'],
        marks: _int(j['marks']),
        marksAwarded: (j['marksAwarded'] as num?)?.toDouble(),
        explanation: j['explanation'] as String?,
        suggestedAnswer: j['suggestedAnswer'] as String?,
      );
}

int _int(dynamic value) =>
    value is num ? value.round() : int.tryParse('$value') ?? 0;
