import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/instructor_courses_repository.dart';
import '../../domain/entities/instructor_course.dart';
import '../../domain/entities/instructor_batch.dart';
import '../../domain/entities/instructor_exam.dart';
import '../../domain/entities/instructor_material.dart';
import '../../domain/entities/instructor_question.dart';
import '../../domain/entities/instructor_student.dart';

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
final instructorCourseBatchesProvider =
    FutureProvider.family<List<InstructorBatch>, String>(
      (ref, id) => ref
          .watch(instructorCoursesRepositoryProvider)
          .getBatchesForCourse(id),
    );
final instructorBatchProvider = FutureProvider.family<InstructorBatch, String>(
  (ref, id) => ref.watch(instructorCoursesRepositoryProvider).getBatch(id),
);
final instructorExistingSessionsProvider = FutureProvider(
  (ref) =>
      ref.watch(instructorCoursesRepositoryProvider).getInstructorSessions(),
);
final instructorMaterialsProvider =
    FutureProvider.family<List<InstructorMaterial>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getMaterials(id),
    );
final instructorQuestionsProvider =
    FutureProvider.family<List<InstructorQuestion>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getQuestions(id),
    );
final instructorQuestionProvider = FutureProvider.autoDispose
    .family<InstructorQuestion, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getQuestion(id),
    );
final instructorExamsProvider =
    FutureProvider.family<List<InstructorExam>, String>(
      (ref, id) => ref.watch(instructorCoursesRepositoryProvider).getExams(id),
    );
final instructorExamAttemptsProvider =
    FutureProvider.family<List<InstructorExamAttempt>, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getExamAttempts(id),
    );
final instructorAttemptDetailsProvider = FutureProvider.autoDispose
    .family<InstructorExamAttempt, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getAttemptDetails(id),
    );
final instructorCourseStudentsProvider =
    FutureProvider.family<InstructorCourseStudents, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getCourseStudents(id),
    );
