import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/learning_repository.dart';
import '../domain/learning_models.dart';

final learningRepositoryProvider = Provider(
  (ref) => LearningRepository(ref.watch(apiClientProvider)),
);
final enrolledCoursesProvider =
    FutureProvider.family<List<EnrolledCourse>, String>(
      (ref, profileId) =>
          ref.watch(learningRepositoryProvider).getEnrolledCourses(profileId),
    );
final courseLearningContentProvider =
    FutureProvider.family<CourseLearningContent, String>((ref, key) {
      final parts = key.split('|');
      return ref
          .watch(learningRepositoryProvider)
          .getCourseContent(parts[0], parts[1]);
    });
final signedLessonUrlProvider = FutureProvider.family<SignedLessonUrl, String>(
  (ref, lessonId) =>
      ref.watch(learningRepositoryProvider).getSignedUrl(lessonId),
);
final lessonProgressProvider = FutureProvider.family<LessonProgress, String>((
  ref,
  key,
) {
  final parts = key.split('|');
  return ref.watch(learningRepositoryProvider).getProgress(parts[0], parts[1]);
});
final lessonNoteProvider = FutureProvider.family<String, String>((ref, key) {
  final parts = key.split('|');
  return ref.watch(learningRepositoryProvider).getNote(parts[0], parts[1]);
});
final nextLiveSessionProvider = FutureProvider.family<LiveSession?, String>(
  (ref, batchId) =>
      ref.watch(learningRepositoryProvider).getNextSession(batchId),
);
