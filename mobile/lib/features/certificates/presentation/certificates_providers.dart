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
