import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/exams_repository.dart';
import '../domain/exam_models.dart';

final examsRepositoryProvider = Provider(
  (ref) => ExamsRepository(ref.watch(apiClientProvider)),
);

final courseExamsProvider = FutureProvider.family<List<LearnerExam>, String>((
  ref,
  key,
) {
  final parts = key.split('|');
  return ref.watch(examsRepositoryProvider).getCourseExams(parts[0], parts[1]);
});

final examQuestionsProvider = FutureProvider.family<ExamTakeData, String>(
  (ref, examId) => ref.watch(examsRepositoryProvider).getExamQuestions(examId),
);

final examResultProvider = FutureProvider.family<ExamResultData, String>((
  ref,
  key,
) {
  final parts = key.split('|');
  return ref.watch(examsRepositoryProvider).getExamResult(parts[0], parts[1]);
});
