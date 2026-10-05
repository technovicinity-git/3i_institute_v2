import '../../../../core/network/api_client.dart';
import '../models/dashboard_data_model.dart';

class DashboardRemoteDataSource {
  const DashboardRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<DashboardDataModel> getDashboard(String learnerProfileId) async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>(
      '/dashboard',
      queryParameters: {'learnerProfileId': learnerProfileId},
    );
    final data = response.data?['data'];
    return DashboardDataModel.fromJson(
      data is Map<String, dynamic> ? data : const {},
    );
  }
}
