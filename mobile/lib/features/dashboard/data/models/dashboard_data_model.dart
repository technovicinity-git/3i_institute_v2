import '../../domain/entities/dashboard_data.dart';

Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};
List<Map<String, dynamic>> _list(Object? value) => value is List
    ? value.whereType<Map<String, dynamic>>().toList(growable: false)
    : const [];
String _string(Object? value, [String fallback = '']) =>
    value is String ? value : fallback;
String? _nullableString(Object? value) =>
    value is String && value.isNotEmpty ? value : null;
int _int(Object? value) => value is num ? value.toInt() : 0;
bool _bool(Object? value) => value is bool && value;
DateTime? _date(Object? value) =>
    value is String ? DateTime.tryParse(value)?.toLocal() : null;

class DashboardDataModel extends DashboardData {
  const DashboardDataModel({
    required super.learnerName,
    required super.stats,
    required super.continueLearning,
    required super.liveClasses,
    required super.deadlines,
    required super.recentResults,
    required super.notes,
    required super.weeklyActivity,
    required super.recommended,
  });

  factory DashboardDataModel.fromJson(Map<String, dynamic> json) {
    final stats = _map(json['stats']);
    return DashboardDataModel(
      learnerName: _string(_map(json['learner'])['displayName'], 'Learner'),
      stats: DashboardStats(
        coursesInProgress: _int(stats['coursesInProgress']),
        coursesCompleted: _int(stats['coursesCompleted']),
        lessonsCompleted: _int(stats['lessonsCompleted']),
        lessonsThisWeek: _int(stats['lessonsThisWeek']),
        certificatesEarned: _int(stats['certificatesEarned']),
        currentStreak: _int(stats['currentStreak']),
        longestStreak: _int(stats['longestStreak']),
        studiedToday: _bool(stats['studiedToday']),
      ),
      continueLearning: _list(json['continueLearning'])
          .map(
            (c) => ContinueLearningCourse(
              id: _string(c['id']),
              title: _string(c['title'], 'Course'),
              thumbnailUrl: _nullableString(c['thumbnailUrl']),
              type: _string(c['type']),
              batchId: _nullableString(c['batchId']),
              progress: _int(c['progress']).clamp(0, 100),
              completedLessons: _int(c['completedLessons']),
              totalLessons: _int(c['totalLessons']),
              nextLessonId: _nullableString(c['nextLessonId']),
              nextLessonTitle: _nullableString(c['nextLessonTitle']),
            ),
          )
          .toList(growable: false),
      liveClasses: _list(json['liveClasses'])
          .map(
            (c) => UpcomingLiveClass(
              id: _string(c['id']),
              batchId: _string(c['batchId']),
              title: _string(c['title'], 'Live class'),
              courseTitle: _string(c['courseTitle']),
              instructor: _string(c['instructor']),
              scheduledAt: _date(c['scheduledAt']),
              durationMinutes: _int(c['durationMinutes']),
              meetingLink: _nullableString(c['meetingLink']),
            ),
          )
          .toList(growable: false),
      deadlines: _list(json['deadlines'])
          .map(
            (d) => DashboardDeadline(
              id: _string(d['id']),
              isExam: d['kind'] == 'EXAM',
              title: _string(d['title'], 'Upcoming deadline'),
              courseId: _string(d['courseId']),
              courseTitle: _string(d['courseTitle']),
              dueDate: _date(d['dueDate']),
              daysRemaining: _int(d['daysRemaining']),
            ),
          )
          .toList(growable: false),
      recentResults: _list(json['recentResults'])
          .map(
            (r) => DashboardResult(
              id: _string(r['id']),
              isExam: r['kind'] == 'EXAM',
              title: _string(r['title'], 'Result'),
              courseId: _string(r['courseId']),
              courseTitle: _string(r['courseTitle']),
              examId: _nullableString(r['examId']),
              status: _string(r['status'], 'AWAITING_GRADE'),
              score: r['score'] is num ? r['score'] as num : null,
              totalMarks: _int(r['totalMarks']),
              submittedAt: _date(r['submittedAt']),
            ),
          )
          .toList(growable: false),
      notes: _list(json['notes'])
          .map(
            (n) => DashboardNote(
              id: _string(n['id']),
              lessonId: _string(n['lessonId']),
              lessonTitle: _string(n['lessonTitle'], 'Lesson'),
              courseId: _string(n['courseId']),
              courseTitle: _string(n['courseTitle']),
              text: _string(n['text']),
              createdAt: _date(n['createdAt']),
            ),
          )
          .toList(growable: false),
      weeklyActivity: _list(json['weeklyActivity'])
          .map(
            (w) => WeeklyActivity(
              weekStart: DateTime.tryParse(_string(w['weekStart'])),
              lessonsCompleted: _int(w['lessonsCompleted']),
            ),
          )
          .toList(growable: false),
      recommended: _list(json['recommended'])
          .map(
            (c) => RecommendedCourse(
              id: _string(c['id']),
              title: _string(c['title'], 'Course'),
              thumbnailUrl: _nullableString(c['thumbnailUrl']),
              instructor: _string(c['instructor']),
              level: _string(c['level']),
              type: _string(c['type']),
              rating: c['rating'] is num
                  ? (c['rating'] as num).toDouble()
                  : null,
              ratingCount: _int(c['ratingCount']),
            ),
          )
          .toList(growable: false),
    );
  }
}
