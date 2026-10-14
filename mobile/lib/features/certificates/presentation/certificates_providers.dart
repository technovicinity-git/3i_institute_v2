import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/certificates_repository.dart';
import '../domain/certificate.dart';

final certificatesRepositoryProvider = Provider(
  (ref) => CertificatesRepository(ref.watch(apiClientProvider)),
);

final learnerCertificatesProvider =
    FutureProvider.family<List<LearnerCertificate>, String>(
      (ref, profileId) =>
          ref.watch(certificatesRepositoryProvider).getForLearner(profileId),
    );

/// Key: `profileId|courseId`.
final examCertificateProvider = FutureProvider.autoDispose
    .family<LearnerCertificate?, String>((ref, key) {
      final parts = key.split('|');
      return ref
          .watch(certificatesRepositoryProvider)
          .getExamCertificate(parts[0], parts[1]);
    });
