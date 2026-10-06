import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/instructor_dashboard_remote_data_source.dart';
import '../../data/repositories/instructor_dashboard_repository_impl.dart';
import '../../domain/entities/instructor_dashboard_data.dart';
import '../../domain/repositories/instructor_dashboard_repository.dart';

final instructorDashboardRepositoryProvider =
    Provider<InstructorDashboardRepository>(
      (ref) => InstructorDashboardRepositoryImpl(
        InstructorDashboardRemoteDataSource(ref.watch(apiClientProvider)),
      ),
    );

final instructorDashboardProvider = FutureProvider<InstructorDashboardData>(
  (ref) => ref.watch(instructorDashboardRepositoryProvider).getDashboard(),
);
