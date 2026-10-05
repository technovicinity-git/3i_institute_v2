import '../entities/instructor_dashboard_data.dart';

abstract interface class InstructorDashboardRepository {
  Future<InstructorDashboardData> getDashboard();
}
