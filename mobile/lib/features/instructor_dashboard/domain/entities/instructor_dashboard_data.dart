class InstructorDashboardData {
  const InstructorDashboardData({
    required this.stats,
    required this.recentCourses,
    required this.upcomingClasses,
    required this.recentEnrolments,
  });

  final InstructorDashboardStats stats;
  final List<InstructorCourseSummary> recentCourses;
  final List<InstructorClassSummary> upcomingClasses;
  final List<InstructorEnrolmentSummary> recentEnrolments;
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
