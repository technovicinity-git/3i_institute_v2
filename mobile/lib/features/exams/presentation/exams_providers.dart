import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/exam_session_store.dart';
import '../data/exams_repository.dart';
import '../domain/exam_models.dart';

final examsRepositoryProvider = Provider(
  (ref) => ExamsRepository(ref.watch(apiClientProvider)),
);

final examSessionStoreProvider = Provider((ref) => const ExamSessionStore());

final courseExamsProvider = FutureProvider.family<List<LearnerExam>, String>((
  ref,
  key,
) {
  final parts = key.split('|');
  return ref.watch(examsRepositoryProvider).getCourseExams(parts[0], parts[1]);
});

// Auto-dispose: REGULAR exams return a fresh random question set per fetch,
// so a retake must not reuse the previous attempt's cached set.
final examIntroProvider = FutureProvider.autoDispose
    .family<ExamIntroData, String>(
      (ref, examId) => ref.watch(examsRepositoryProvider).getExamIntro(examId),
    );

/// examId → deadline of attempts in progress on this device, keyed by profile.
final activeExamSessionsProvider = FutureProvider.autoDispose
    .family<Map<String, DateTime>, String>(
      (ref, profileId) =>
          ref.watch(examSessionStoreProvider).deadlines(profileId),
    );

final examResultProvider = FutureProvider.family<ExamResultData, String>((
  ref,
  key,
) {
  final parts = key.split('|');
  return ref.watch(examsRepositoryProvider).getExamResult(parts[0], parts[1]);
});
