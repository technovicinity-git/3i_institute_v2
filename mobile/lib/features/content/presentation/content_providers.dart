import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/content_repository.dart';

final contentRepositoryProvider = Provider(
  (ref) => ContentRepository(ref.watch(apiClientProvider)),
);

final publishedPagesProvider = FutureProvider<List<SitePageLink>>(
  (ref) => ref.watch(contentRepositoryProvider).getPublishedPages(),
);

final sitePageProvider = FutureProvider.family<SitePageContent, String>(
  (ref, slug) => ref.watch(contentRepositoryProvider).getPage(slug),
);

final faqProvider = FutureProvider<List<FaqEntry>>(
  (ref) => ref.watch(contentRepositoryProvider).getFaq(),
);

final contactInfoProvider = FutureProvider<SiteContactInfo>(
  (ref) => ref.watch(contentRepositoryProvider).getContactInfo(),
);
