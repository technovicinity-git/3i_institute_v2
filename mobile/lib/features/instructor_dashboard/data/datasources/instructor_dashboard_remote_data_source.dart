import '../../../../core/network/api_client.dart';
import '../../domain/entities/instructor_dashboard_data.dart';

class InstructorDashboardRemoteDataSource {
  const InstructorDashboardRemoteDataSource(this._apiClient);
  final ApiClient _apiClient;

  Future<InstructorDashboardData> getDashboard() async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>(
      '/instructors/dashboard',
    );
    final raw = response.data?['data'];
    final data = raw is Map<String, dynamic> ? raw : const <String, dynamic>{};
    final stats = _map(data['stats']);
    return InstructorDashboardData(
      stats: InstructorDashboardStats(
        totalCourses: _int(stats['totalCourses']),
        totalStudents: _int(stats['totalStudents']),
        upcomingSessions: _int(stats['upcomingSessions']),
        totalCertificates: _int(stats['totalCertificates']),
        pendingGrading: _int(stats['pendingGrading']),
      ),
      recentCourses: _list(data['recentCourses'])
          .map(
            (item) => InstructorCourseSummary(
              id: '${item['id'] ?? ''}',
              title: '${item['title'] ?? 'Untitled course'}',
              thumbnailUrl: _string(item['thumbnailUrl']),
              enrolmentCount: _int(item['enrolmentCount']),
              averageRating: _double(item['averageRating']),
            ),
          )
          .toList(),
      upcomingClasses: _list(data['upcomingClasses'])
          .map(
            (item) => InstructorClassSummary(
              sessionId: '${item['sessionId'] ?? item['id'] ?? ''}',
              title: '${item['title'] ?? 'Live class'}',
              scheduledAt: '${item['scheduledAt'] ?? ''}',
              meetingLink: _string(item['meetingLink']),
            ),
          )
          .toList(),
      recentEnrolments: _list(data['recentEnrolments'])
          .map(
            (item) => InstructorEnrolmentSummary(
              id: '${item['id'] ?? ''}',
              learnerName: '${item['learnerName'] ?? 'Learner'}',
              courseTitle: '${item['courseTitle'] ?? 'Course'}',
              enrolledAt: '${item['enrolledAt'] ?? ''}',
            ),
          )
          .toList(),
    );
  }
}

Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};
List<Map<String, dynamic>> _list(Object? value) =>
    value is List ? value.whereType<Map<String, dynamic>>().toList() : const [];
String? _string(Object? value) =>
    value is String && value.isNotEmpty ? value : null;
int _int(Object? value) =>
    value is num ? value.toInt() : int.tryParse('$value') ?? 0;
double? _double(Object? value) =>
    value is num ? value.toDouble() : double.tryParse('$value');
