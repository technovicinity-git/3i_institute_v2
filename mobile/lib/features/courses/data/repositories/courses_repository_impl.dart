import '../../domain/entities/course.dart';
import '../../domain/entities/course_details.dart';
import '../../domain/repositories/courses_repository.dart';
import '../datasources/courses_remote_data_source.dart';

class CoursesRepositoryImpl implements CoursesRepository {
  CoursesRepositoryImpl(this._remoteDataSource);
  final CoursesRemoteDataSource _remoteDataSource;

  @override
  Future<CoursePage> getCourses(Map<String, String> filters) => _remoteDataSource.getCourses(filters);

  @override
  Future<CourseDetails> getCourseDetails(String courseId, {String? learnerProfileId}) =>
      _remoteDataSource.getCourseDetails(courseId, learnerProfileId: learnerProfileId);

  @override
  Future<List<CourseCategory>> getCategories() => _remoteDataSource.getCategories();

  @override
  Future<Set<String>> getWishlistedCourseIds(String learnerProfileId) =>
      _remoteDataSource.getWishlistedCourseIds(learnerProfileId);

  @override
  Future<void> toggleWishlist({required String learnerProfileId, required String courseId, required bool add}) =>
      _remoteDataSource.toggleWishlist(learnerProfileId: learnerProfileId, courseId: courseId, add: add);

  @override
  Future<bool> enrol({required String learnerProfileId, required String courseId, String? batchId}) =>
      _remoteDataSource.enrol(learnerProfileId: learnerProfileId, courseId: courseId, batchId: batchId);
}
