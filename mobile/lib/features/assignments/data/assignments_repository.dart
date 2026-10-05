import '../../../core/network/api_client.dart';
import '../domain/assignment.dart';

class AssignmentsRepository {
  const AssignmentsRepository(this._api);
  final ApiClient _api;

  Future<List<LearnerAssignment>> getCourseAssignments(
    String courseId,
    String profileId,
  ) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/assignments/course/$courseId',
      queryParameters: {'learnerProfileId': profileId},
    );
    final data = response.data?['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((e) => LearnerAssignment.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  Future<void> submit({
    required String assignmentId,
    required String profileId,
    required String content,
  }) async {
    await _api.dio.post<void>(
      '/assignments/submit',
      data: {
        'assignmentId': assignmentId,
        'learnerProfileId': profileId,
        'content': content,
      },
    );
  }
}
