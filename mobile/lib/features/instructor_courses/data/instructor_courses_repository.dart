import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../domain/entities/instructor_course.dart';

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
