class InstructorDashboardData {
  const InstructorDashboardData({
    required this.stats,
    required this.recentCourses,
    required this.upcomingClasses,
    required this.recentEnrolments,
    this.pendingAttempts = const [],
  });

  final InstructorDashboardStats stats;
  final List<InstructorCourseSummary> recentCourses;
  final List<InstructorClassSummary> upcomingClasses;
  final List<InstructorEnrolmentSummary> recentEnrolments;
  final List<InstructorPendingAttempt> pendingAttempts;
}

class InstructorDashboardStats {
  const InstructorDashboardStats({
    required this.totalCourses,
    required this.totalStudents,
    required this.upcomingSessions,
    required this.totalCertificates,
    required this.pendingGrading,
  });
  final int totalCourses,
      totalStudents,
      upcomingSessions,
      totalCertificates,
      pendingGrading;
}

class InstructorCourseSummary {
  const InstructorCourseSummary({
    required this.id,
    required this.title,
    required this.thumbnailUrl,
    required this.enrolmentCount,
    required this.averageRating,
  });
  final String id, title;
  final String? thumbnailUrl;
  final int enrolmentCount;
  final double? averageRating;
}

class InstructorClassSummary {
  const InstructorClassSummary({
    required this.sessionId,
    required this.title,
    required this.scheduledAt,
    required this.meetingLink,
  });
  final String sessionId, title, scheduledAt;
  final String? meetingLink;
}

class InstructorEnrolmentSummary {
  const InstructorEnrolmentSummary({
    required this.id,
    required this.learnerName,
    required this.courseTitle,
    required this.enrolledAt,
  });
  final String id, learnerName, courseTitle, enrolledAt;
}

class InstructorPendingAttempt {
  const InstructorPendingAttempt({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.courseId,
    required this.courseTitle,
    required this.learnerName,
    required this.attemptNumber,
    required this.submittedAt,
  });
  final String id, examId, examTitle, courseId, courseTitle, learnerName;
  final String submittedAt;
  final int attemptNumber;

  factory InstructorPendingAttempt.fromJson(Map<String, dynamic> item) =>
      InstructorPendingAttempt(
        id: '${item['id'] ?? ''}',
        examId: '${item['examId'] ?? ''}',
        examTitle: '${item['examTitle'] ?? 'Exam'}',
        courseId: '${item['courseId'] ?? ''}',
        courseTitle: '${item['courseTitle'] ?? 'Course'}',
        learnerName: '${item['learnerName'] ?? 'Learner'}',
        attemptNumber: item['attemptNumber'] is num
            ? (item['attemptNumber'] as num).toInt()
            : 1,
        submittedAt: '${item['submittedAt'] ?? ''}',
      );
}
