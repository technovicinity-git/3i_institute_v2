class InstructorQuestion {
  const InstructorQuestion({
    required this.id,
    required this.type,
    required this.question,
    required this.options,
    required this.correctAnswers,
    required this.suggestedAnswer,
    required this.marks,
    required this.negativeMarks,
    required this.difficulty,
    required this.explanation,
  });
  final String id, type, question, difficulty;
  final List<String> options;

  /// A single answer for mcq/true_false, several for multi_select.
  final List<String> correctAnswers;
  final String? suggestedAnswer, explanation;
  final int marks, negativeMarks;
}

class QuestionImportResult {
  const QuestionImportResult({
    required this.total,
    required this.imported,
    required this.failed,
    required this.errors,
  });
  final int total, imported, failed;
  final List<({int row, String message})> errors;
}
