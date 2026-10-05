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

  Future<ExamTakeData> getExamQuestions(String examId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/exams/$examId/questions',
    );
    return ExamTakeData.fromJson(_data(response.data));
  }

  Future<ExamAttempt> submitExam({
    required String examId,
    required String profileId,
    required Map<String, Object> answers,
    required DateTime startedAt,
    required List<ExamQuestion> questions,
  }) async {
    final response = await _api.dio.post<Map<String, dynamic>>(
      '/exams/submit',
      data: {
        'examId': examId,
        'learnerProfileId': profileId,
        'answers': answers,
        'startedAt': startedAt.toUtc().toIso8601String(),
        'questionSet': questions.map((q) => {'questionId': q.id}).toList(),
      },
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
