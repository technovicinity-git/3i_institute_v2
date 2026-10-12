class DashboardData {
  const DashboardData({
    required this.learnerName,
    required this.stats,
    required this.continueLearning,
    required this.liveClasses,
    required this.deadlines,
    required this.recentResults,
    required this.notes,
    required this.weeklyActivity,
    required this.recommended,
  });

  final String learnerName;
  final DashboardStats stats;
  final List<ContinueLearningCourse> continueLearning;
  final List<UpcomingLiveClass> liveClasses;
  final List<DashboardDeadline> deadlines;
  final List<DashboardResult> recentResults;
  final List<DashboardNote> notes;
  final List<WeeklyActivity> weeklyActivity;
  final List<RecommendedCourse> recommended;
}

class DashboardStats {
  const DashboardStats({
    required this.coursesInProgress,
    required this.coursesCompleted,
    required this.lessonsCompleted,
    required this.lessonsThisWeek,
    required this.certificatesEarned,
    required this.currentStreak,
    required this.longestStreak,
    required this.studiedToday,
  });

  final int coursesInProgress;
  final int coursesCompleted;
  final int lessonsCompleted;
  final int lessonsThisWeek;
  final int certificatesEarned;
  final int currentStreak;
  final int longestStreak;
  final bool studiedToday;
}

class ContinueLearningCourse {
  const ContinueLearningCourse({
    required this.id,
    required this.title,
    required this.thumbnailUrl,
    required this.type,
    required this.batchId,
    required this.progress,
    required this.completedLessons,
    required this.totalLessons,
    required this.nextLessonId,
    required this.nextLessonTitle,
  });

  final String id;
  final String title;
  final String? thumbnailUrl;
  final String type;
  final String? batchId;
  final int progress;
  final int completedLessons;
  final int totalLessons;
  final String? nextLessonId;
  final String? nextLessonTitle;

  bool get isOnlineClass => type == 'ONLINE_CLASS';
}

class UpcomingLiveClass {
  const UpcomingLiveClass({
    required this.id,
    required this.batchId,
    required this.title,
    required this.courseTitle,
    required this.instructor,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.meetingLink,
  });

  final String id;
  final String batchId;
  final String title;
  final String courseTitle;
  final String instructor;
  final DateTime? scheduledAt;
  final int durationMinutes;
  final String? meetingLink;
}

class DashboardDeadline {
  const DashboardDeadline({
    required this.id,
    required this.isExam,
    required this.title,
    required this.courseId,
    required this.courseTitle,
    required this.dueDate,
    required this.daysRemaining,
  });

  final String id;
  final bool isExam;
  final String title;
  final String courseId;
  final String courseTitle;
  final DateTime? dueDate;
  final int daysRemaining;
}

/// PASSED, FAILED, GRADED (assignment) or AWAITING_GRADE.
class DashboardResult {
  const DashboardResult({
    required this.id,
    required this.isExam,
    required this.title,
    required this.courseId,
    required this.courseTitle,
    required this.examId,
    required this.status,
    required this.score,
    required this.totalMarks,
    required this.submittedAt,
  });

  final String id;
  final bool isExam;
  final String title;
  final String courseId;
  final String courseTitle;
  final String? examId;
  final String status;
  final num? score;
  final int totalMarks;
  final DateTime? submittedAt;
}

class DashboardNote {
  const DashboardNote({
    required this.id,
    required this.lessonId,
    required this.lessonTitle,
    required this.courseId,
    required this.courseTitle,
    required this.text,
    required this.createdAt,
  });

  final String id;
  final String lessonId;
  final String lessonTitle;
  final String courseId;
  final String courseTitle;
  final String text;
  final DateTime? createdAt;
}

class WeeklyActivity {
  const WeeklyActivity({
    required this.weekStart,
    required this.lessonsCompleted,
  });

  /// Monday of the week in the learner's local time.
  final DateTime? weekStart;
  final int lessonsCompleted;
}

class RecommendedCourse {
  const RecommendedCourse({
    required this.id,
    required this.title,
    required this.thumbnailUrl,
    required this.instructor,
    required this.level,
    required this.type,
    required this.rating,
    required this.ratingCount,
  });

  final String id;
  final String title;
  final String? thumbnailUrl;
  final String instructor;
  final String level;
  final String type;
  final double? rating;
  final int ratingCount;
}
