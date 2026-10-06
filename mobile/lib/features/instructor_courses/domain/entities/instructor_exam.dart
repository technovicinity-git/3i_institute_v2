import 'instructor_question.dart';

class InstructorExam {
  const InstructorExam({
    required this.id,
    required this.title,
    required this.type,
    required this.duration,
    required this.passMark,
    required this.totalMarks,
    required this.maxAttempts,
    required this.cooldownHours,
    required this.openDate,
    required this.randomizeQuestions,
    required this.randomizeOptions,
    required this.questions,
  });
  final String id, title, type;
  final int duration, passMark, totalMarks, maxAttempts, cooldownHours;
  final DateTime? openDate;
  final bool randomizeQuestions, randomizeOptions;

  /// Fixed question list (online classes). Empty for regular-course exams,
  /// which draw random questions from the bank on every attempt.
  final List<({String questionId, int marks})> questions;
}

class InstructorExamAttempt {
  const InstructorExamAttempt({
    required this.id,
    required this.learnerName,
    required this.attemptNumber,
    required this.submittedAt,
    required this.score,
    required this.totalMarks,
    required this.passed,
    required this.graded,
    this.answers = const {},
    this.questions = const [],
  });
  final String id, learnerName;
  final int attemptNumber;
  final DateTime? submittedAt;
  final num? score;
  final int totalMarks;
  final bool? passed;
  final bool graded;

  /// Keyed by question id; awarded written marks are stored as `<id>_marks`.
  /// Only populated by the attempt-details endpoint.
  final Map<String, dynamic> answers;
  final List<InstructorQuestion> questions;
}

class CertificateIssueResult {
  const CertificateIssueResult({
    required this.issued,
    required this.alreadyIssued,
    required this.notPassed,
  });
  final int issued, alreadyIssued, notPassed;
}
