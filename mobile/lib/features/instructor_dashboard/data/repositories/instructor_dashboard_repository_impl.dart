import '../../domain/entities/instructor_dashboard_data.dart';
import '../../domain/repositories/instructor_dashboard_repository.dart';
import '../datasources/instructor_dashboard_remote_data_source.dart';

class InstructorDashboardRepositoryImpl
    implements InstructorDashboardRepository {
  const InstructorDashboardRepositoryImpl(this._remote);
  final InstructorDashboardRemoteDataSource _remote;
  @override
  Future<InstructorDashboardData> getDashboard() => _remote.getDashboard();
}
