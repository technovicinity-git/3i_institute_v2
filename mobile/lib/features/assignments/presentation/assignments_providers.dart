import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/assignments_repository.dart';
import '../domain/assignment.dart';

final assignmentsRepositoryProvider = Provider(
  (ref) => AssignmentsRepository(ref.watch(apiClientProvider)),
);

final courseAssignmentsProvider =
    FutureProvider.family<List<LearnerAssignment>, String>((ref, key) {
      final parts = key.split('|');
      return ref
          .watch(assignmentsRepositoryProvider)
          .getCourseAssignments(parts[0], parts[1]);
    });
