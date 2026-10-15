import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../courses/presentation/providers/courses_providers.dart';
import 'learner_profiles_providers.dart';

/// Subscription status of one learner profile. Only subscribed profiles can
/// enrol in courses.
class ProfileSubscription {
  const ProfileSubscription({
    required this.id,
    required this.displayName,
    required this.avatarUrl,
    required this.age,
    required this.isSubscribed,
    required this.subscribedAt,
  });

  final String id;
  final String displayName;
  final String? avatarUrl;
  final int age;
  final bool isSubscribed;
  final DateTime? subscribedAt;

  String get initials => displayName
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .take(2)
      .map((part) => part[0])
      .join()
      .toUpperCase();

  factory ProfileSubscription.fromJson(Map<String, dynamic> json) =>
      ProfileSubscription(
        id: json['id'] as String? ?? '',
        displayName: json['displayName'] as String? ?? 'Learner',
        avatarUrl: json['avatarUrl'] as String?,
        age: (json['age'] as num?)?.toInt() ?? 0,
        isSubscribed: json['isSubscribed'] as bool? ?? false,
        subscribedAt: DateTime.tryParse(json['subscribedAt'] as String? ?? ''),
      );
}

class SubscriptionOverview {
  const SubscriptionOverview({
    required this.manualSubscriptionsEnabled,
    required this.pricePerProfile,
    required this.profiles,
  });

  /// False once a payment gateway replaces the manual buttons.
  final bool manualSubscriptionsEnabled;
  final double pricePerProfile;
  final List<ProfileSubscription> profiles;

  int get subscribedCount =>
      profiles.where((profile) => profile.isSubscribed).length;

  factory SubscriptionOverview.fromJson(Map<String, dynamic> json) =>
      SubscriptionOverview(
        manualSubscriptionsEnabled:
            json['manualSubscriptionsEnabled'] as bool? ?? false,
        pricePerProfile: (json['pricePerProfile'] as num?)?.toDouble() ?? 0,
        profiles: (json['profiles'] as List? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(ProfileSubscription.fromJson)
            .toList(growable: false),
      );
}

final subscriptionOverviewProvider =
    FutureProvider.autoDispose<SubscriptionOverview>((ref) async {
      final response = await ref
          .watch(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/seats/subscriptions');
      final data = response.data?['data'];
      return SubscriptionOverview.fromJson(
        data is Map<String, dynamic> ? data : const {},
      );
    });

final subscriptionActionsProvider = Provider<SubscriptionActions>(
  SubscriptionActions.new,
);

/// Manual subscribe / unsubscribe (no payment gateway yet).
class SubscriptionActions {
  SubscriptionActions(this._ref);
  final Ref _ref;

  Dio get _dio => _ref.read(apiClientProvider).dio;

  Future<void> subscribe(String learnerProfileId) async {
    await _dio.post<void>(
      '/seats/subscribe',
      data: {'learnerProfileId': learnerProfileId},
    );
    _sync(learnerProfileId, subscribed: true);
  }

  Future<void> unsubscribe(String learnerProfileId) async {
    await _dio.post<void>(
      '/seats/unsubscribe',
      data: {'learnerProfileId': learnerProfileId},
    );
    _sync(learnerProfileId, subscribed: false);
  }

  /// Refreshes everything that depends on a profile's subscription.
  void _sync(String learnerProfileId, {required bool subscribed}) {
    _ref.invalidate(subscriptionOverviewProvider);
    _ref.invalidate(learnerProfilesProvider);
    _ref.invalidate(courseDetailsProvider);
    final active = _ref.read(activeLearnerProfileProvider);
    if (active?.id == learnerProfileId) {
      _ref
          .read(activeLearnerProfileProvider.notifier)
          .select(active!.copyWith(isActive: subscribed, hasSeat: subscribed));
    }
  }
}
