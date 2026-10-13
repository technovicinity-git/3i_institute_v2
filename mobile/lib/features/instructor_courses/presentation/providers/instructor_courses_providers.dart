import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../instructor_dashboard/domain/entities/instructor_dashboard_data.dart';
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

/// Questions across all of the instructor's courses (question bank).
final instructorAllQuestionsProvider = FutureProvider<List<InstructorQuestion>>(
  (ref) => ref.watch(instructorCoursesRepositoryProvider).getQuestions(),
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

/// Every attempt waiting for grading. Shared by the grading queue, sidebar
/// badge, exam list badges and "grade next".
final instructorPendingAttemptsProvider =
    FutureProvider<List<InstructorPendingAttempt>>(
      (ref) =>
          ref.watch(instructorCoursesRepositoryProvider).getPendingAttempts(),
    );
final instructorAttemptDetailsProvider = FutureProvider.autoDispose
    .family<InstructorExamAttempt, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getAttemptDetails(id),
    );

/// Students across all of the instructor's courses (Students tab).
final instructorAllStudentsProvider =
    FutureProvider<List<InstructorEnrolledStudent>>(
      (ref) => ref.watch(instructorCoursesRepositoryProvider).getAllStudents(),
    );
final instructorCourseStudentsProvider =
    FutureProvider.family<InstructorCourseStudents, String>(
      (ref, id) =>
          ref.watch(instructorCoursesRepositoryProvider).getCourseStudents(id),
    );
final instructorBatchCountProvider = FutureProvider(
  (ref) =>
      ref.watch(instructorCoursesRepositoryProvider).getInstructorBatchCount(),
);
