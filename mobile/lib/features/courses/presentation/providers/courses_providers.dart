import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/courses_remote_data_source.dart';
import '../../data/repositories/courses_repository_impl.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/course_details.dart';
import '../../domain/repositories/courses_repository.dart';

final coursesRepositoryProvider = Provider<CoursesRepository>(
  (ref) => CoursesRepositoryImpl(CoursesRemoteDataSource(ref.watch(apiClientProvider))),
);

final courseCategoriesProvider = FutureProvider<List<CourseCategory>>(
  (ref) => ref.watch(coursesRepositoryProvider).getCategories(),
);

final coursesProvider = FutureProvider.family<CoursePage, String>((ref, query) {
  return ref.watch(coursesRepositoryProvider).getCourses(Uri.splitQueryString(query));
});

/// Key format is `courseId|learnerProfileId`; an empty profile ID is allowed.
final courseDetailsProvider = FutureProvider.family<CourseDetails, String>((ref, key) {
  final parts = key.split('|');
  final profileId = parts.length > 1 && parts[1].isNotEmpty ? parts[1] : null;
  return ref.watch(coursesRepositoryProvider).getCourseDetails(parts.first, learnerProfileId: profileId);
});

final wishlistedCourseIdsProvider = FutureProvider.family<Set<String>, String>(
  (ref, profileId) => profileId.isEmpty
      ? Future.value(const <String>{})
      : ref.watch(coursesRepositoryProvider).getWishlistedCourseIds(profileId),
);
