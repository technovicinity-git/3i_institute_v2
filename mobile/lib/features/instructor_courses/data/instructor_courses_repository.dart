import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../domain/entities/instructor_course.dart';
import '../domain/entities/instructor_batch.dart';
import '../domain/entities/instructor_material.dart';
import '../domain/entities/instructor_question.dart';

class InstructorCoursesRepository {
  InstructorCoursesRepository(this._client);
  final ApiClient _client;
  Dio get _dio => _client.dio;

  Future<List<InstructorCourse>> getCourses() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/courses/my-courses',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(_course)
        .toList();
  }

  Future<List<InstructorCategory>> getCategories() async {
    final response = await _dio.get<Map<String, dynamic>>('/categories');
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorCategory(
            id: '${item['id'] ?? ''}',
            name: '${item['name'] ?? ''}',
          ),
        )
        .toList();
  }

  Future<List<InstructorBatchOption>> getBatches(String courseId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/batches/course/$courseId',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorBatchOption(
            id: '${item['id'] ?? ''}',
            name: '${item['name'] ?? 'Batch'}',
          ),
        )
        .toList();
  }

  Future<InstructorCourse> createCourse(Map<String, dynamic> input) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/courses',
      data: input,
    );
    return _course(_map(response.data?['data']));
  }

  Future<void> updateCourse(String id, Map<String, dynamic> input) async =>
      _dio.patch<void>('/courses/$id', data: input);

  Future<void> uploadThumbnail(
    String courseId,
    List<int> bytes,
    String filename,
  ) async {
    final form = FormData.fromMap({
      'courseId': courseId,
      'image': MultipartFile.fromBytes(bytes, filename: filename),
    });
    await _dio.post<void>('/uploads/course-thumbnail', data: form);
  }

  Future<List<InstructorAssignment>> getAssignments(String courseId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructors/assignments',
      queryParameters: {'courseId': courseId},
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorAssignment(
            id: '${item['id'] ?? ''}',
            title: '${item['title'] ?? 'Assignment'}',
            dueDate: _nullable(item['dueDate']),
            status: '${item['status'] ?? 'DRAFT'}',
            submissionCount: _int(item['submissionCount']),
            totalMarks: _int(item['totalMarks']),
            batchName: _nullable(item['batchName']),
          ),
        )
        .toList();
  }

  Future<void> createAssignment(Map<String, dynamic> input) async =>
      _dio.post<void>('/instructors/assignments', data: input);

  Future<List<InstructorSubmission>> getSubmissions(String assignmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructors/assignments/$assignmentId/submissions',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorSubmission(
            id: '${item['id'] ?? ''}',
            learnerName: '${item['learnerName'] ?? 'Learner'}',
            submittedAt: '${item['submittedAt'] ?? ''}',
            content: '${item['content'] ?? ''}',
            fileUrl: _nullable(item['fileUrl']),
            marksAwarded: item['marksAwarded'] as num?,
            feedback: _nullable(item['feedback']),
            graded: item['graded'] == true,
          ),
        )
        .toList();
  }

  Future<void> gradeSubmission(String id, num marks, String feedback) async =>
      _dio.post<void>(
        '/instructors/assignments/submissions/$id/grade',
        data: {'marksAwarded': marks, 'feedback': feedback},
      );

  Future<List<InstructorBatch>> getBatchesForCourse(String courseId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/batches/course/$courseId',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => _batch({...item, 'courseId': item['courseId'] ?? courseId}),
        )
        .toList();
  }

  Future<InstructorBatch> getBatch(String batchId) async {
    final response = await _dio.get<Map<String, dynamic>>('/batches/$batchId');
    return _batch(_map(response.data?['data']));
  }

  Future<List<InstructorExistingSession>> getInstructorSessions() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/batches/instructor/sessions',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorExistingSession(
            id: '${item['id'] ?? ''}',
            title: '${item['title'] ?? ''}',
            scheduledAt: '${item['scheduledAt'] ?? ''}',
            durationMinutes: _int(item['durationMinutes']),
            batchName: '${item['batchName'] ?? ''}',
            courseTitle: '${item['courseTitle'] ?? ''}',
          ),
        )
        .toList();
  }

  Future<void> createBatch({
    required String courseId,
    required String name,
    required int capacity,
    required List<Map<String, dynamic>> sessions,
  }) async => _dio.post<void>(
    '/batches',
    data: {
      'courseId': courseId,
      'name': name,
      'capacity': capacity,
      'sessions': sessions,
    },
  );
  Future<void> updateBatch(
    String batchId, {
    required String name,
    required int capacity,
  }) async => _dio.patch<void>(
    '/batches/$batchId',
    data: {'name': name, 'capacity': capacity},
  );
  Future<void> closeBatch(String batchId) async =>
      _dio.post<void>('/batches/$batchId/close');
  Future<void> addSession(String batchId, Map<String, dynamic> input) async =>
      _dio.post<void>('/batches/$batchId/sessions', data: input);
  Future<void> updateSession(
    String sessionId,
    Map<String, dynamic> input,
  ) async => _dio.patch<void>('/batches/sessions/$sessionId', data: input);
  Future<void> deleteSession(String sessionId) async =>
      _dio.delete<void>('/batches/sessions/$sessionId');

  Future<List<InstructorMaterial>> getMaterials(String courseId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/materials/course/$courseId',
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => InstructorMaterial(
            id: '${item['id'] ?? ''}',
            title: '${item['title'] ?? 'Material'}',
            description: _nullable(item['description']),
            type: '${item['type'] ?? 'document'}',
            duration: item['duration'] is num
                ? (item['duration'] as num).toInt()
                : null,
            order: _int(item['order']),
          ),
        )
        .toList();
  }

  Future<void> uploadVideo({
    required String courseId,
    required String title,
    required String description,
    required int order,
    required int? duration,
    required MaterialUploadFile video,
    MaterialUploadFile? captions,
    void Function(int sent, int total)? onProgress,
  }) async {
    final form = FormData.fromMap({
      'courseId': courseId,
      'title': title,
      'description': description,
      'order': '$order',
      'duration': ?duration?.toString(),
      'video': _multipart(video),
      'captions': ?(captions == null ? null : _multipart(captions)),
    });
    await _dio.post<void>(
      '/materials/upload-video',
      data: form,
      onSendProgress: onProgress,
      options: Options(
        sendTimeout: const Duration(hours: 3),
        receiveTimeout: const Duration(minutes: 30),
      ),
    );
  }

  Future<void> uploadDocument({
    required String courseId,
    required String title,
    required String description,
    required int order,
    required MaterialUploadFile document,
    void Function(int sent, int total)? onProgress,
  }) async {
    final form = FormData.fromMap({
      'courseId': courseId,
      'title': title,
      'description': description,
      'order': '$order',
      'document': _multipart(document),
    });
    await _dio.post<void>(
      '/materials/upload-document',
      data: form,
      onSendProgress: onProgress,
      options: Options(
        sendTimeout: const Duration(minutes: 30),
        receiveTimeout: const Duration(minutes: 5),
      ),
    );
  }

  Future<void> updateMaterial(String id, Map<String, dynamic> input) async =>
      _dio.patch<void>('/materials/$id', data: input);
  Future<void> deleteMaterial(String id) async =>
      _dio.delete<void>('/materials/$id');

  Future<InstructorMaterialMedia> getMaterialMedia(String id) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/materials/$id/signed-url',
    );
    final data = _map(response.data?['data']);
    return InstructorMaterialMedia(
      url: '${data['url'] ?? ''}',
      contentType: '${data['contentType'] ?? ''}',
      mimeType: _nullable(data['mimeType']),
      referer: _nullable(data['referer']),
    );
  }

  MultipartFile _multipart(MaterialUploadFile file) => MultipartFile.fromStream(
    file.openRead,
    file.length,
    filename: file.name,
    contentType: DioMediaType.parse(file.mimeType),
  );

  Future<List<InstructorQuestion>> getQuestions(String courseId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/exams/questions',
      queryParameters: {'courseId': courseId},
    );
    final data = response.data?['data'];
    return (data is List ? data : const [])
        .whereType<Map<String, dynamic>>()
        .map(_question)
        .toList();
  }

  Future<InstructorQuestion> getQuestion(String id) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/exams/questions/$id',
    );
    return _question(_map(response.data?['data']));
  }

  Future<void> createQuestion(Map<String, dynamic> input) async =>
      _dio.post<void>('/exams/questions', data: input);
  Future<void> updateQuestion(String id, Map<String, dynamic> input) async =>
      _dio.patch<void>('/exams/questions/$id', data: input);
  Future<void> deleteQuestion(String id) async =>
      _dio.delete<void>('/exams/questions/$id');

  Future<QuestionImportResult> importQuestions(
    String courseId,
    List<int> bytes,
    String filename,
  ) async {
    final form = FormData.fromMap({
      'courseId': courseId,
      'file': MultipartFile.fromBytes(
        bytes,
        filename: filename,
        contentType: DioMediaType('text', 'csv'),
      ),
    });
    final response = await _dio.post<Map<String, dynamic>>(
      '/exams/questions/bulk-import',
      data: form,
      options: Options(receiveTimeout: const Duration(minutes: 2)),
    );
    final data = _map(response.data?['data']);
    final errors = data['errors'];
    return QuestionImportResult(
      total: _int(data['total']),
      imported: _int(data['imported']),
      failed: _int(data['failed']),
      errors: (errors is List ? errors : const [])
          .whereType<Map<String, dynamic>>()
          .map((e) => (row: _int(e['row']), message: '${e['message'] ?? ''}'))
          .toList(),
    );
  }

  InstructorQuestion _question(Map<String, dynamic> item) {
    final correct = item['correctAnswer'];
    return InstructorQuestion(
      id: '${item['id'] ?? ''}',
      type: '${item['type'] ?? 'mcq'}',
      question: '${item['question'] ?? ''}',
      options: _strings(item['options']),
      correctAnswers: correct is String
          ? [correct]
          : correct is List
          ? correct.map((e) => '$e').toList()
          : const [],
      suggestedAnswer: _nullable(item['suggestedAnswer']),
      marks: _int(item['marks'], 1),
      negativeMarks: _int(item['negativeMarks']),
      difficulty: '${item['difficulty'] ?? 'medium'}',
      explanation: _nullable(item['explanation']),
    );
  }

  InstructorBatch _batch(Map<String, dynamic> item) {
    final course = _map(item['course']);
    final rawSessions = item['sessions'];
    final sessions = (rawSessions is List ? rawSessions : const [])
        .whereType<Map<String, dynamic>>()
        .map(
          (session) => InstructorBatchSession(
            id: '${session['id'] ?? ''}',
            title: '${session['title'] ?? 'Session'}',
            scheduledAt: '${session['scheduledAt'] ?? ''}',
            durationMinutes: _int(session['durationMinutes']),
            meetingLink: _nullable(session['meetingLink']),
            notes: _nullable(session['notes']),
          ),
        )
        .toList();
    final enrollments = item['enrolments'];
    final enrolmentCount =
        item['enrolmentCount'] ??
        (enrollments is List ? enrollments.length : null);
    return InstructorBatch(
      id: '${item['id'] ?? ''}',
      courseId: '${item['courseId'] ?? course['id'] ?? ''}',
      courseTitle: '${item['courseTitle'] ?? course['title'] ?? 'Course'}',
      name: '${item['name'] ?? 'Batch'}',
      capacity: _int(item['capacity']),
      status: '${item['status'] ?? 'UPCOMING'}',
      enrolmentCount: _int(enrolmentCount),
      sessions: sessions,
    );
  }

  InstructorCourse _course(Map<String, dynamic> item) {
    final category = _map(item['category']);
    final count = _map(item['_count']);
    return InstructorCourse(
      id: '${item['id'] ?? ''}',
      title: '${item['title'] ?? ''}',
      summary: '${item['summary'] ?? ''}',
      description: '${item['description'] ?? ''}',
      thumbnailUrl: _nullable(item['thumbnailUrl']),
      categoryId: _nullable(item['categoryId']) ?? _nullable(category['id']),
      categoryName: _nullable(category['name']),
      type: '${item['type'] ?? 'REGULAR'}',
      level: '${item['level'] ?? '1'}',
      language: '${item['language'] ?? 'en'}',
      minimumAge: _int(item['minimumAge'], 5),
      maximumAge: item['maximumAge'] == null ? null : _int(item['maximumAge']),
      status: '${item['status'] ?? 'DRAFT'}',
      isDraft: item['isDraft'] == true || item['status'] == 'DRAFT',
      totalLessons: _int(item['totalLessons']),
      studentCount: _int(count['enrolments']),
      learningOutcomes: _strings(item['learningOutcomes']),
      requirements: _strings(item['requirements']),
    );
  }
}

Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};
String? _nullable(Object? value) =>
    value is String && value.isNotEmpty ? value : null;
int _int(Object? value, [int fallback = 0]) =>
    value is num ? value.toInt() : int.tryParse('$value') ?? fallback;
List<String> _strings(Object? value) =>
    value is List ? value.whereType<String>().toList() : const [];
