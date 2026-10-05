import '../../domain/entities/dashboard_data.dart';

Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};
List<Object?> _list(Object? value) =>
    value is List ? value.cast<Object?>() : const [];
String _string(Object? value, [String fallback = '']) =>
    value is String ? value : fallback;
int _int(Object? value) => value is num ? value.toInt() : 0;
double _double(Object? value) => value is num ? value.toDouble() : 0;
bool _bool(Object? value) => value is bool && value;

class DashboardDataModel extends DashboardData {
  const DashboardDataModel({
    required super.stats,
    required super.continueLearning,
    required super.liveClasses,
    required super.deadlines,
    required super.notes,
    required super.recommended,
    required super.weeklyProgress,
  });

  factory DashboardDataModel.fromJson(Map<String, dynamic> json) {
    final stats = _map(json['stats']);
    return DashboardDataModel(
      stats: DashboardStats(
        coursesInProgress: _int(stats['coursesInProgress']),
        hoursLearned: _double(stats['hoursLearned']),
        certificatesEarned: _int(stats['certificatesEarned']),
        currentStreak: _int(stats['currentStreak']),
        coursesInProgressDelta: _int(stats['coursesInProgressDelta']),
        hoursLearnedDelta: _int(stats['hoursLearnedDelta']),
        certificatesPending: _int(stats['certificatesPending']),
        streakRecord: _int(stats['streakRecord']),
      ),
      continueLearning: _list(json['continueLearning'])
          .map((value) {
            final course = _map(value);
            return ContinueLearningCourse(
              id: _string(course['id']),
              title: _string(course['title'], 'Course'),
              thumbnailUrl: course['thumbnailUrl'] as String?,
              moduleInfo: _string(course['moduleInfo']),
              progress: _int(course['progress']).clamp(0, 100),
            );
          })
          .toList(growable: false),
      liveClasses: _list(json['liveClasses'])
          .map((value) {
            final liveClass = _map(value);
            return UpcomingLiveClass(
              id: _string(liveClass['id']),
              sessionId: _string(liveClass['sessionId']),
              date: _string(liveClass['date']),
              month: _string(liveClass['month']),
              title: _string(liveClass['title'], 'Live class'),
              instructor: _string(liveClass['instructor']),
              time: _string(liveClass['time']),
              meetingLink: _string(liveClass['meetingLink']),
            );
          })
          .toList(growable: false),
      deadlines: _list(json['deadlines'])
          .map((value) {
            final deadline = _map(value);
            return DashboardDeadline(
              id: _string(deadline['id']),
              title: _string(deadline['title'], 'Upcoming deadline'),
              dueDate: DateTime.tryParse(_string(deadline['dueDate'])),
              urgent: _bool(deadline['urgent']),
              daysRemaining: _int(deadline['daysRemaining']),
            );
          })
          .toList(growable: false),
      notes: _list(json['notes'])
          .map((value) {
            final note = _map(value);
            return DashboardNote(
              id: _string(note['id']),
              subject: _string(note['subject'], 'Note'),
              timeAgo: _string(note['timeAgo']),
              text: _string(note['text']),
            );
          })
          .toList(growable: false),
      recommended: _list(json['recommended'])
          .map((value) {
            final course = _map(value);
            return RecommendedCourse(
              id: _string(course['id']),
              title: _string(course['title'], 'Course'),
              thumbnailUrl: course['thumbnailUrl'] as String?,
              instructor: _string(course['instructor']),
              level: _string(course['level']),
              rating: _double(course['rating']),
            );
          })
          .toList(growable: false),
      weeklyProgress: _list(json['weeklyProgress'])
          .map((value) {
            final week = _map(value);
            return WeeklyStudyProgress(
              week: _int(week['week']),
              hours: _double(week['hours']),
            );
          })
          .toList(growable: false),
    );
  }
}
