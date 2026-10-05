import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/wishlist_repository.dart';
import '../domain/wishlist_item.dart';

final wishlistRepositoryProvider = Provider(
  (ref) => WishlistRepository(ref.watch(apiClientProvider)),
);

final wishlistProvider = FutureProvider.autoDispose
    .family<WishlistData, String>(
      (ref, profileId) =>
          ref.watch(wishlistRepositoryProvider).getWishlist(profileId),
    );
