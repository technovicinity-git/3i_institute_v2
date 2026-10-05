import '../../../core/network/api_client.dart';
import '../domain/wishlist_item.dart';

class WishlistRepository {
  const WishlistRepository(this._api);
  final ApiClient _api;

  Future<WishlistData> getWishlist(String profileId) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/wishlist',
      queryParameters: {'learnerProfileId': profileId},
    );
    final data = response.data?['data'];
    return WishlistData.fromJson(
      data is Map ? Map<String, dynamic>.from(data) : const {},
    );
  }

  Future<void> remove({
    required String profileId,
    required String courseId,
  }) async {
    await _api.dio.delete<void>(
      '/wishlist',
      data: {'learnerProfileId': profileId, 'courseId': courseId},
    );
  }
}
