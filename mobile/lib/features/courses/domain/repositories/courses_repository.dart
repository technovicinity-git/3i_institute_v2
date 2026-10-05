import '../entities/course.dart';
import '../entities/course_details.dart';

abstract interface class CoursesRepository {
  Future<CoursePage> getCourses(Map<String, String> filters);
  Future<CourseDetails> getCourseDetails(String courseId, {String? learnerProfileId});
  Future<List<CourseCategory>> getCategories();
  Future<Set<String>> getWishlistedCourseIds(String learnerProfileId);
  Future<void> toggleWishlist({required String learnerProfileId, required String courseId, required bool add});
  Future<bool> enrol({required String learnerProfileId, required String courseId, String? batchId});
}
