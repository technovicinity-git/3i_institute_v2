import '../../../core/network/api_client.dart';
import '../domain/exam_models.dart';

class ExamsRepository {
  const ExamsRepository(this._api);
  final ApiClient _api;

  Future<List<LearnerExam>> getCourseExams(
    String courseId,
    String profileId,
  ) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/exams/course/$courseId',
      queryParameters: {'learnerProfileId': profileId},
    );
    final data = response.data?['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((e) => LearnerExam.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  Future<ExamIntroData> getExamIntro(String examId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/exams/$examId/intro',
    );
    return ExamIntroData.fromJson(_data(response.data));
  }

  /// Starts the attempt on the server, or resumes the one already running.
  Future<ExamStartData> startExam(String examId, String profileId) async {
    final response = await _api.dio.post<Map<String, dynamic>>(
      '/exams/$examId/start',
      data: {'learnerProfileId': profileId},
    );
    return ExamStartData.fromJson(_data(response.data));
  }

  /// The question set, start time and deadline belong to the server
  /// session, so only the answers are sent.
  Future<ExamAttempt> submitExam({
    required String sessionId,
    required Map<String, Object> answers,
  }) async {
    final response = await _api.dio.post<Map<String, dynamic>>(
      '/exams/submit',
      data: {'sessionId': sessionId, 'answers': answers},
    );
    return ExamAttempt.fromJson(_data(response.data));
  }

  Future<ExamResultData> getExamResult(String examId, String profileId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/exams/result',
      queryParameters: {'examId': examId, 'learnerProfileId': profileId},
    );
    return ExamResultData.fromJson(_data(response.data));
  }

  Map<String, dynamic> _data(Map<String, dynamic>? response) =>
      response?['data'] is Map
      ? Map<String, dynamic>.from(response!['data'] as Map)
      : const {};
}
