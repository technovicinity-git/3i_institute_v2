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

/// One enrolment in the instructor's all-students list (a learner appears
/// once per course they are enrolled in).
class InstructorEnrolledStudent {
  const InstructorEnrolledStudent({
    required this.id,
    required this.learnerProfileId,
    required this.displayName,
    required this.avatarUrl,
    required this.dateOfBirth,
    required this.courseId,
    required this.courseTitle,
    required this.courseType,
    required this.enrolledAt,
    required this.progress,
    required this.attendanceRate,
  });
  final String id, learnerProfileId, displayName, courseId, courseTitle;

  /// REGULAR | ONLINE_CLASS | MIXED
  final String courseType;
  final String? avatarUrl;
  final DateTime? dateOfBirth, enrolledAt;
  final int progress, attendanceRate;
}
