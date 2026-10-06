class InstructorCourseStudents {
  const InstructorCourseStudents({
    required this.courseTitle,
    required this.total,
    required this.students,
  });
  final String courseTitle;
  final int total;
  final List<InstructorStudent> students;
}

class InstructorStudent {
  const InstructorStudent({
    required this.id,
    required this.displayName,
    required this.dateOfBirth,
    required this.avatarUrl,
    required this.batchName,
    required this.enrolledAt,
    required this.progress,
    required this.examAverage,
    required this.examAttempts,
  });
  final String id, displayName;
  final DateTime? dateOfBirth, enrolledAt;
  final String? avatarUrl, batchName;
  final int progress, examAttempts;
  final num? examAverage;
}
