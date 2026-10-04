import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../data/datasources/dashboard_remote_data_source.dart';
import '../../data/repositories/dashboard_repository_impl.dart';
import '../../domain/entities/dashboard_data.dart';
import '../../domain/repositories/dashboard_repository.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>(
  (ref) => DashboardRepositoryImpl(
    DashboardRemoteDataSource(ref.watch(apiClientProvider)),
  ),
);

final learnerDashboardProvider = FutureProvider.family<DashboardData, String>(
  (ref, learnerProfileId) =>
      ref.watch(dashboardRepositoryProvider).getDashboard(learnerProfileId),
);

final activeLearnerDashboardProvider = Provider<AsyncValue<DashboardData>>((
  ref,
) {
  final profileId = ref.watch(activeLearnerProfileProvider)?.id;
  if (profileId == null || profileId.isEmpty) {
    return const AsyncValue<DashboardData>.loading();
  }
  return ref.watch(learnerDashboardProvider(profileId));
});
