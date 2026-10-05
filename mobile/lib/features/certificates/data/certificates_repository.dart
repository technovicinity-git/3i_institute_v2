import '../../../core/network/api_client.dart';
import '../domain/certificate.dart';

class CertificatesRepository {
  const CertificatesRepository(this._api);
  final ApiClient _api;

  Future<List<LearnerCertificate>> getForLearner(String profileId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/certificates/learner/$profileId',
    );
    final data = response.data?['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map(
          (item) =>
              LearnerCertificate.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }
}
