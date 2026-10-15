import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import 'learner_profiles_providers.dart';

double _double(Object? value) => value is num ? value.toDouble() : 0;
String _string(Object? value, [String fallback = '']) =>
    value is String ? value : fallback;
String? _nullable(Object? value) =>
    value is String && value.isNotEmpty ? value : null;
DateTime? _date(Object? value) =>
    value is String ? DateTime.tryParse(value)?.toLocal() : null;
Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};
List<Map<String, dynamic>> _list(Object? value) => value is List
    ? value.whereType<Map<String, dynamic>>().toList(growable: false)
    : const [];

String initialsOf(String name) => name
    .trim()
    .split(RegExp(r'\s+'))
    .where((part) => part.isNotEmpty)
    .take(2)
    .map((part) => part[0])
    .join()
    .toUpperCase();

String formatMoney(double amount, String currency) =>
    '$currency ${amount.toStringAsFixed(2)}';

/// Price after a waiver discount (matches the server's rounding).
double discountedPrice(double price, int discountPercent) =>
    (price * (100 - discountPercent)).roundToDouble() / 100;

/// An account the admin accepts payments into (bank or mobile banking).
class PaymentAccount {
  const PaymentAccount({
    required this.id,
    required this.type,
    required this.label,
    required this.accountName,
    required this.accountNumber,
    required this.details,
  });

  final String id;

  /// BANK, MOBILE_BANKING or OTHER.
  final String type;
  final String label;
  final String accountName;
  final String accountNumber;
  final String details;

  String get typeLabel => switch (type) {
    'BANK' => 'Bank transfer',
    'MOBILE_BANKING' => 'Mobile banking',
    _ => 'Other',
  };

  factory PaymentAccount.fromJson(Map<String, dynamic> json) => PaymentAccount(
    id: _string(json['id']),
    type: _string(json['type'], 'BANK'),
    label: _string(json['label']),
    accountName: _string(json['accountName']),
    accountNumber: _string(json['accountNumber']),
    details: _string(json['details']),
  );
}

class PaymentSettings {
  const PaymentSettings({
    required this.monthlyPrice,
    required this.currency,
    required this.instructions,
    required this.accounts,
  });

  final double monthlyPrice;
  final String currency;
  final String instructions;
  final List<PaymentAccount> accounts;

  factory PaymentSettings.fromJson(Map<String, dynamic> json) =>
      PaymentSettings(
        monthlyPrice: _double(json['monthlyPrice']),
        currency: _string(json['currency'], 'USD'),
        instructions: _string(json['instructions']),
        accounts: _list(
          json['accounts'],
        ).map(PaymentAccount.fromJson).toList(growable: false),
      );
}

/// One learner profile's subscription status.
class ProfileSubscription {
  const ProfileSubscription({
    required this.id,
    required this.displayName,
    required this.avatarUrl,
    required this.age,
    required this.subscribedUntil,
    required this.pendingRequestId,
    required this.lastRejectionReason,
    required this.lastRejected,
    required this.waiverPercent,
    required this.waiverExpiresAt,
    required this.waiverPending,
    required this.waiverRejectionReason,
    required this.waiverApplicationsLeft,
    required this.nextWaiverApplicationAt,
  });

  final String id;
  final String displayName;
  final String? avatarUrl;
  final int age;
  final DateTime? subscribedUntil;
  final String? pendingRequestId;
  final String? lastRejectionReason;
  final bool lastRejected;

  /// Percent of an approved, unused waiver (applied to the next request).
  final int? waiverPercent;
  final DateTime? waiverExpiresAt;
  final bool waiverPending;
  final String? waiverRejectionReason;
  final int waiverApplicationsLeft;
  final DateTime? nextWaiverApplicationAt;

  bool get hasUsableWaiver => waiverPercent != null;

  bool get isSubscribed => subscribedUntil != null;
  bool get isPending => pendingRequestId != null;
  String get initials => initialsOf(displayName);

  factory ProfileSubscription.fromJson(Map<String, dynamic> json) {
    final rejection = json['lastRejection'];
    final waiver = _map(json['waiver']);
    final usable = waiver['usable'];
    return ProfileSubscription(
      id: _string(json['id']),
      displayName: _string(json['displayName'], 'Learner'),
      avatarUrl: _nullable(json['avatarUrl']),
      age: (json['age'] as num?)?.toInt() ?? 0,
      subscribedUntil: json['isSubscribed'] == true
          ? _date(json['subscribedUntil'])
          : null,
      pendingRequestId: _nullable(json['pendingRequestId']),
      lastRejected: rejection is Map,
      lastRejectionReason: rejection is Map
          ? _nullable(rejection['reason'])
          : null,
      waiverPercent: usable is Map
          ? (usable['percent'] as num?)?.toInt()
          : null,
      waiverExpiresAt: usable is Map ? _date(usable['expiresAt']) : null,
      waiverPending: waiver['pending'] == true,
      waiverRejectionReason: _nullable(waiver['lastRejectionReason']),
      waiverApplicationsLeft:
          (waiver['applicationsLeft'] as num?)?.toInt() ?? 0,
      nextWaiverApplicationAt: _date(waiver['nextApplicationAt']),
    );
  }
}

/// A fee waiver request for one learner profile.
class WaiverItem {
  const WaiverItem({
    required this.id,
    required this.status,
    required this.profileName,
    required this.percent,
    required this.createdAt,
    required this.expiresAt,
    required this.usedAt,
    required this.reason,
  });

  final String id;

  /// PENDING, APPROVED, REJECTED, REVOKED, USED or EXPIRED.
  final String status;
  final String profileName;
  final int? percent;
  final DateTime? createdAt;
  final DateTime? expiresAt;
  final DateTime? usedAt;

  /// Rejection or withdrawal reason.
  final String? reason;

  factory WaiverItem.fromJson(Map<String, dynamic> json) => WaiverItem(
    id: _string(json['id']),
    status: _string(json['status'], 'PENDING'),
    profileName: _string(
      _map(json['learnerProfile'])['displayName'],
      'Learner',
    ),
    percent: (json['percent'] as num?)?.toInt(),
    createdAt: _date(json['createdAt']),
    expiresAt: _date(json['expiresAt']),
    usedAt: _date(json['usedAt']),
    reason:
        _nullable(json['rejectionReason']) ?? _nullable(json['revokeReason']),
  );
}

/// A submitted payment waiting for (or after) admin review.
class SubscriptionRequest {
  const SubscriptionRequest({
    required this.id,
    required this.status,
    required this.profileName,
    required this.paymentMethod,
    required this.amount,
    required this.currency,
    required this.transactionId,
    required this.createdAt,
    required this.periodEnd,
    required this.rejectionReason,
    required this.discountPercent,
  });

  final String id;

  /// PENDING, APPROVED, REJECTED or CANCELLED.
  final String status;
  final String profileName;
  final String paymentMethod;
  final double amount;
  final String currency;

  /// Null when a 100% waiver covered the price.
  final String? transactionId;
  final DateTime? createdAt;
  final DateTime? periodEnd;
  final String? rejectionReason;
  final int discountPercent;

  factory SubscriptionRequest.fromJson(Map<String, dynamic> json) =>
      SubscriptionRequest(
        id: _string(json['id']),
        status: _string(json['status'], 'PENDING'),
        profileName: _string(
          _map(json['learnerProfile'])['displayName'],
          'Learner',
        ),
        paymentMethod: _string(json['paymentMethod']),
        amount: _double(json['amount']),
        currency: _string(json['currency']),
        transactionId: _nullable(json['transactionId']),
        createdAt: _date(json['createdAt']),
        periodEnd: _date(json['periodEnd']),
        rejectionReason: _nullable(json['rejectionReason']),
        discountPercent: (json['discountPercent'] as num?)?.toInt() ?? 0,
      );
}

class SubscriptionOverview {
  const SubscriptionOverview({
    required this.payment,
    required this.profiles,
    required this.requests,
    required this.waivers,
  });

  final PaymentSettings payment;
  final List<ProfileSubscription> profiles;
  final List<SubscriptionRequest> requests;
  final List<WaiverItem> waivers;

  int get subscribedCount =>
      profiles.where((profile) => profile.isSubscribed).length;

  factory SubscriptionOverview.fromJson(Map<String, dynamic> json) =>
      SubscriptionOverview(
        payment: PaymentSettings.fromJson(_map(json['payment'])),
        profiles: _list(
          json['profiles'],
        ).map(ProfileSubscription.fromJson).toList(growable: false),
        requests: _list(
          json['requests'],
        ).map(SubscriptionRequest.fromJson).toList(growable: false),
        waivers: _list(
          json['waivers'],
        ).map(WaiverItem.fromJson).toList(growable: false),
      );
}

final subscriptionOverviewProvider =
    FutureProvider.autoDispose<SubscriptionOverview>((ref) async {
      final response = await ref
          .watch(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/subscriptions/overview');
      return SubscriptionOverview.fromJson(_map(response.data?['data']));
    });

/// The active profile is held in memory; keeps its status current after the
/// overview loads (an admin may have approved, or the month may have ended).
void syncActiveProfileSubscription(WidgetRef ref, SubscriptionOverview data) {
  final active = ref.read(activeLearnerProfileProvider);
  if (active == null) return;
  for (final profile in data.profiles) {
    if (profile.id == active.id && profile.isSubscribed != active.isActive) {
      ref
          .read(activeLearnerProfileProvider.notifier)
          .select(
            active.copyWith(
              isActive: profile.isSubscribed,
              hasSeat: profile.isSubscribed,
            ),
          );
    }
  }
}

final subscriptionActionsProvider = Provider<SubscriptionActions>(
  SubscriptionActions.new,
);

class SubscriptionActions {
  SubscriptionActions(this._ref);
  final Ref _ref;

  Dio get _dio => _ref.read(apiClientProvider).dio;

  /// Uploads a payment screenshot and returns its URL.
  Future<String> uploadProof(
    List<int> bytes,
    String filename,
    String? mimeType,
  ) async {
    final form = FormData.fromMap({
      'image': MultipartFile.fromBytes(
        bytes,
        filename: filename,
        contentType: DioMediaType.parse(mimeType ?? _mimeFor(filename)),
      ),
    });
    final response = await _dio.post<Map<String, dynamic>>(
      '/uploads/payment-proof',
      data: form,
    );
    final url = _map(response.data?['data'])['url'];
    if (url is! String || url.isEmpty) {
      throw Exception('Upload failed');
    }
    return url;
  }

  /// Payment fields are left out when a 100% waiver covers the price.
  Future<void> apply({
    required String learnerProfileId,
    String? paymentMethod,
    double? amount,
    String? transactionId,
    DateTime? paidAt,
    String? senderAccount,
    String? note,
    String? proofImageUrl,
  }) async {
    await _dio.post<void>(
      '/subscriptions/requests',
      data: {
        'learnerProfileId': learnerProfileId,
        'paymentMethod': ?paymentMethod,
        'amount': ?amount,
        'transactionId': ?transactionId,
        if (paidAt != null) 'paidAt': paidAt.toUtc().toIso8601String(),
        if (senderAccount != null && senderAccount.isNotEmpty)
          'senderAccount': senderAccount,
        if (note != null && note.isNotEmpty) 'note': note,
        'proofImageUrl': ?proofImageUrl,
      },
    );
    _ref.invalidate(subscriptionOverviewProvider);
  }

  Future<void> applyWaiver({
    required String learnerProfileId,
    required String explanation,
    required List<String> evidenceFiles,
  }) async {
    await _dio.post<void>(
      '/waivers',
      data: {
        'learnerProfileId': learnerProfileId,
        'explanation': explanation,
        'evidenceFiles': evidenceFiles,
      },
    );
    _ref.invalidate(subscriptionOverviewProvider);
  }

  Future<void> cancel(String requestId) async {
    await _dio.post<void>('/subscriptions/requests/$requestId/cancel');
    _ref.invalidate(subscriptionOverviewProvider);
  }

  static String _mimeFor(String filename) {
    final extension = filename.split('.').last.toLowerCase();
    return switch (extension) {
      'png' => 'image/png',
      'webp' => 'image/webp',
      'gif' => 'image/gif',
      _ => 'image/jpeg',
    };
  }
}
