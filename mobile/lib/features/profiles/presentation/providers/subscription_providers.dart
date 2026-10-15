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
  });

  final String id;
  final String displayName;
  final String? avatarUrl;
  final int age;
  final DateTime? subscribedUntil;
  final String? pendingRequestId;
  final String? lastRejectionReason;
  final bool lastRejected;

  bool get isSubscribed => subscribedUntil != null;
  bool get isPending => pendingRequestId != null;
  String get initials => initialsOf(displayName);

  factory ProfileSubscription.fromJson(Map<String, dynamic> json) {
    final rejection = json['lastRejection'];
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
    );
  }
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
  });

  final String id;

  /// PENDING, APPROVED, REJECTED or CANCELLED.
  final String status;
  final String profileName;
  final String paymentMethod;
  final double amount;
  final String currency;
  final String transactionId;
  final DateTime? createdAt;
  final DateTime? periodEnd;
  final String? rejectionReason;

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
        transactionId: _string(json['transactionId']),
        createdAt: _date(json['createdAt']),
        periodEnd: _date(json['periodEnd']),
        rejectionReason: _nullable(json['rejectionReason']),
      );
}

class SubscriptionOverview {
  const SubscriptionOverview({
    required this.payment,
    required this.profiles,
    required this.requests,
  });

  final PaymentSettings payment;
  final List<ProfileSubscription> profiles;
  final List<SubscriptionRequest> requests;

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

  Future<void> apply({
    required String learnerProfileId,
    required String paymentMethod,
    required double amount,
    required String transactionId,
    required DateTime paidAt,
    String? senderAccount,
    String? note,
    String? proofImageUrl,
  }) async {
    await _dio.post<void>(
      '/subscriptions/requests',
      data: {
        'learnerProfileId': learnerProfileId,
        'paymentMethod': paymentMethod,
        'amount': amount,
        'transactionId': transactionId,
        'paidAt': paidAt.toUtc().toIso8601String(),
        if (senderAccount != null && senderAccount.isNotEmpty)
          'senderAccount': senderAccount,
        if (note != null && note.isNotEmpty) 'note': note,
        'proofImageUrl': ?proofImageUrl,
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
