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

  /// The learner's one-time exam certificate for a REGULAR course, if issued.
  Future<LearnerCertificate?> getExamCertificate(
    String profileId,
    String courseId,
  ) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/certificates/exam',
      queryParameters: {'learnerProfileId': profileId, 'courseId': courseId},
    );
    final data = response.data?['data'];
    return data is Map
        ? LearnerCertificate.fromJson(Map<String, dynamic>.from(data))
        : null;
  }

  /// Issues the exam certificate (allowed once, after an exam attempt).
  Future<LearnerCertificate> issueExamCertificate(
    String profileId,
    String courseId,
  ) async {
    final response = await _api.dio.post<Map<String, dynamic>>(
      '/certificates/issue/exam',
      data: {'learnerProfileId': profileId, 'courseId': courseId},
    );
    final data = response.data?['data'];
    if (data is! Map) {
      throw const FormatException('The server did not return a certificate.');
    }
    return LearnerCertificate.fromJson(Map<String, dynamic>.from(data));
  }
}
