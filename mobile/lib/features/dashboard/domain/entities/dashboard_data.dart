class DashboardData {
  const DashboardData({
    required this.stats,
    required this.continueLearning,
    required this.liveClasses,
    required this.deadlines,
    required this.notes,
    required this.recommended,
    required this.weeklyProgress,
  });

  final DashboardStats stats;
  final List<ContinueLearningCourse> continueLearning;
  final List<UpcomingLiveClass> liveClasses;
  final List<DashboardDeadline> deadlines;
  final List<DashboardNote> notes;
  final List<RecommendedCourse> recommended;
  final List<WeeklyStudyProgress> weeklyProgress;
}

class DashboardStats {
  const DashboardStats({
    required this.coursesInProgress,
    required this.hoursLearned,
    required this.certificatesEarned,
    required this.currentStreak,
    required this.coursesInProgressDelta,
    required this.hoursLearnedDelta,
    required this.certificatesPending,
    required this.streakRecord,
  });

  final int coursesInProgress;
  final double hoursLearned;
  final int certificatesEarned;
  final int currentStreak;
  final int coursesInProgressDelta;
  final int hoursLearnedDelta;
  final int certificatesPending;
  final int streakRecord;
}

class ContinueLearningCourse {
  const ContinueLearningCourse({
    required this.id,
    required this.title,
    required this.thumbnailUrl,
    required this.moduleInfo,
    required this.progress,
  });

  final String id;
  final String title;
  final String? thumbnailUrl;
  final String moduleInfo;
  final int progress;
}

class UpcomingLiveClass {
  const UpcomingLiveClass({
    required this.id,
    required this.sessionId,
    required this.date,
    required this.month,
    required this.title,
    required this.instructor,
    required this.time,
    required this.meetingLink,
  });

  final String id;
  final String sessionId;
  final String date;
  final String month;
  final String title;
  final String instructor;
  final String time;
  final String meetingLink;
}

class DashboardDeadline {
  const DashboardDeadline({
    required this.id,
    required this.title,
    required this.dueDate,
    required this.urgent,
    required this.daysRemaining,
  });

  final String id;
  final String title;
  final DateTime? dueDate;
  final bool urgent;
  final int daysRemaining;
}

class DashboardNote {
  const DashboardNote({
    required this.id,
    required this.subject,
    required this.timeAgo,
    required this.text,
  });

  final String id;
  final String subject;
  final String timeAgo;
  final String text;
}

class RecommendedCourse {
  const RecommendedCourse({
    required this.id,
    required this.title,
    required this.thumbnailUrl,
    required this.instructor,
    required this.level,
    required this.rating,
  });

  final String id;
  final String title;
  final String? thumbnailUrl;
  final String instructor;
  final String level;
  final double rating;
}

class WeeklyStudyProgress {
  const WeeklyStudyProgress({required this.week, required this.hours});
  final int week;
  final double hours;
}
