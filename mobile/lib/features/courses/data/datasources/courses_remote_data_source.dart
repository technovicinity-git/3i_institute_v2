import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/course_details.dart';
import '../models/course_model.dart';

class CoursesRemoteDataSource {
  CoursesRemoteDataSource(this._apiClient);
  final ApiClient _apiClient;
  Dio get _dio => _apiClient.dio;

  Future<CoursePage> getCourses(Map<String, String> filters) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/courses',
      queryParameters: filters,
    );
    final body = response.data ?? const <String, dynamic>{};
    final courses = asJsonList(body['data'])
        .map((item) => CourseModel.fromJson(asJsonMap(item)))
        .toList(growable: false);
    final pagination = asJsonMap(body['pagination']);
    final total = intValue(pagination['total'], courses.length);
    final limit = intValue(pagination['limit'], 12);
    return CoursePage(
      courses: courses,
      total: total,
      totalPages: intValue(pagination['totalPages'], (total / limit).ceil()),
    );
  }

  Future<CourseDetails> getCourseDetails(String courseId, {String? learnerProfileId}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/courses/$courseId/details',
      queryParameters: {
        if (learnerProfileId != null && learnerProfileId.isNotEmpty)
          'learnerProfileId': learnerProfileId,
      },
    );
    return CourseDetailsModel.fromJson(asJsonMap(response.data?['data']));
  }

  Future<List<CourseCategory>> getCategories() async {
    final response = await _dio.get<Map<String, dynamic>>('/categories');
    return asJsonList(response.data?['data']).map((item) {
      final category = asJsonMap(item);
      return CourseCategory(
        id: stringValue(category['id']),
        name: stringValue(category['name']),
        courseCount: intValue(category['courseCount']),
      );
    }).toList(growable: false);
  }

  Future<Set<String>> getWishlistedCourseIds(String learnerProfileId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/wishlist',
      queryParameters: {'learnerProfileId': learnerProfileId},
    );
    return asJsonList(response.data?['data'])
        .map((item) => stringValue(asJsonMap(asJsonMap(item)['course'])['id']))
        .where((id) => id.isNotEmpty)
        .toSet();
  }

  Future<void> toggleWishlist({required String learnerProfileId, required String courseId, required bool add}) async {
    if (add) {
      await _dio.post<void>('/wishlist', data: {'learnerProfileId': learnerProfileId, 'courseId': courseId});
    } else {
      await _dio.delete<void>('/wishlist', data: {'learnerProfileId': learnerProfileId, 'courseId': courseId});
    }
  }

  Future<bool> enrol({required String learnerProfileId, required String courseId, String? batchId}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/enrolments',
      data: {
        'learnerProfileId': learnerProfileId,
        'courseId': courseId,
        if (batchId != null) 'batchId': batchId,
      },
    );
    return boolValue(asJsonMap(response.data?['data'])['waitlisted']);
  }
}
