import '../../../core/network/api_client.dart';
import '../domain/learning_models.dart';

class LearningRepository {
  const LearningRepository(this._api);
  final ApiClient _api;

  Future<List<EnrolledCourse>> getEnrolledCourses(String profileId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/enrolments/learner/courses',
      queryParameters: {'learnerProfileId': profileId},
    );
    final data = response.data?['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(EnrolledCourse.fromJson)
        .toList(growable: false);
  }

  Future<CourseLearningContent> getCourseContent(
    String courseId,
    String profileId,
  ) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/materials/course/$courseId/content',
      queryParameters: {'learnerProfileId': profileId},
    );
    return CourseLearningContent.fromJson(_data(response.data));
  }

  Future<SignedLessonUrl> getSignedUrl(String lessonId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/materials/$lessonId/signed-url',
    );
    return SignedLessonUrl.fromJson(_data(response.data));
  }

  Future<LessonProgress> getProgress(String profileId, String lessonId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/progress/material',
      queryParameters: {'learnerProfileId': profileId, 'materialId': lessonId},
    );
    return LessonProgress.fromJson(_data(response.data));
  }

  Future<String> getNote(String profileId, String lessonId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/notes',
      queryParameters: {'learnerProfileId': profileId, 'materialId': lessonId},
    );
    final data = _data(response.data);
    final details = data['details'];
    return details is Map
        ? details['content'] as String? ?? ''
        : data['content'] as String? ?? '';
  }

  Future<LiveSession?> getNextSession(String batchId) async {
    if (batchId.isEmpty) return null;
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/batches/$batchId/next-session',
    );
    final data = response.data?['data'];
    return data is Map<String, dynamic> ? LiveSession.fromJson(data) : null;
  }

  Future<void> saveNote(
    String profileId,
    String lessonId,
    String content,
  ) async {
    await _api.dio.post<Map<String, dynamic>>(
      '/notes',
      data: {
        'learnerProfileId': profileId,
        'materialId': lessonId,
        'content': content,
      },
    );
  }

  Future<void> updateProgress(
    String profileId,
    String lessonId, {
    required int watchedSeconds,
    required int lastPosition,
    bool completed = false,
  }) async {
    await _api.dio.post<Map<String, dynamic>>(
      '/progress',
      data: {
        'learnerProfileId': profileId,
        'materialId': lessonId,
        'watchedSeconds': watchedSeconds,
        'lastPosition': lastPosition,
        'completed': completed,
      },
    );
  }

  Map<String, dynamic> _data(Map<String, dynamic>? response) =>
      response?['data'] is Map<String, dynamic>
      ? response!['data'] as Map<String, dynamic>
      : const {};
}
