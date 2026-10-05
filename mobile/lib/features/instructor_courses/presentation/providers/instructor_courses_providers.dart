import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/instructor_courses_repository.dart';
import '../../domain/entities/instructor_course.dart';

final instructorCoursesRepositoryProvider = Provider(
  (ref) => InstructorCoursesRepository(ref.watch(apiClientProvider)),
);
final instructorCoursesProvider = FutureProvider<List<InstructorCourse>>(
  (ref) => ref.watch(instructorCoursesRepositoryProvider).getCourses(),
);
final instructorCategoriesProvider = FutureProvider(
  (ref) => ref.watch(instructorCoursesRepositoryProvider).getCategories(),
);
final instructorAssignmentsProvider =
    FutureProvider.family<List<InstructorAssignment>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getAssignments(id),
    );
final instructorBatchesProvider =
    FutureProvider.family<List<InstructorBatchOption>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getBatches(id),
    );
final instructorSubmissionsProvider =
    FutureProvider.family<List<InstructorSubmission>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getSubmissions(id),
    );
