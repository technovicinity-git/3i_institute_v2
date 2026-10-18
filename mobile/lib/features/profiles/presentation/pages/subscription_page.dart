import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/subscription_providers.dart';
import '../widgets/apply_subscription_sheet.dart';
import '../widgets/waiver_request_sheet.dart';
import '../widgets/learner_avatar.dart';
import '../../../../core/l10n/l10n.dart';

const _navy = Color(0xff12304e);
const _ink = Color(0xff0c1f33);
const _muted = Color(0xff475569);
const _green = Color(0xff22a146);
const _gold = Color(0xffb8912f);
const _blue = Color(0xff2d6cdf);
const _border = Color(0xffe3e8ef);

String _dateTime(DateTime date) => DateFormat.yMMMd().add_jm().format(date);

class SubscriptionPage extends ConsumerWidget {
  const SubscriptionPage({super.key});

  Future<void> _apply(
    BuildContext context,
    ProfileSubscription profile,
    PaymentSettings payment,
  ) async {
    final submitted = await showApplySubscriptionSheet(
      context,
      profile: profile,
      payment: payment,
    );
    if (submitted && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.l10n.subSubmittedPayment(profile.displayName),
          ),
        ),
      );
    }
  }

  Future<void> _requestWaiver(
    BuildContext context,
    ProfileSubscription profile,
  ) async {
    final sent = await showWaiverRequestSheet(context, profile: profile);
    if (sent && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.l10n.subWaiverSent,
          ),
        ),
      );
    }
  }

  Future<void> _cancel(
    BuildContext context,
    WidgetRef ref,
    ProfileSubscription profile,
  ) async {
    final requestId = profile.pendingRequestId;
    if (requestId == null) return;
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.l10n.subCancelTitle),
        content: Text(
          context.l10n.subCancelBody(profile.displayName),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(context.l10n.subKeepIt),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.deepOrange),
            child: Text(context.l10n.subCancelRequest),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(subscriptionActionsProvider).cancel(requestId);
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.subCancelled)),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(error, fallback: l10n.subCancelFailed),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(subscriptionOverviewProvider, (_, next) {
      final data = next.asData?.value;
      if (data != null) syncActiveProfileSubscription(ref, data);
    });
    final overview = ref.watch(subscriptionOverviewProvider);

    return Scaffold(
      backgroundColor: const Color(0xfffbf9f4),
      body: overview.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(context.l10n.subLoadFailed),
              TextButton(
                onPressed: () => ref.invalidate(subscriptionOverviewProvider),
                child: Text(context.l10n.commonTryAgain),
              ),
            ],
          ),
        ),
        data: (data) {
          final pending = data.profiles.where((p) => p.isPending).length;
          return RefreshIndicator(
            onRefresh: () => ref.refresh(subscriptionOverviewProvider.future),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  context.l10n.subTitle,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontFamily: 'serif',
                    color: _navy,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  context.l10n.subIntro,
                  style: TextStyle(color: _muted),
                ),
                const SizedBox(height: 18),
                _PaymentDetails(payment: data.payment),
                const SizedBox(height: 22),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        context.l10n.subLearnerProfiles,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontFamily: 'serif', color: _ink),
                      ),
                    ),
                    Text(
                      context.l10n.subSubscribedCount(data.subscribedCount, data.profiles.length) +
                      (pending > 0 ? ' · ${context.l10n.subUnderReviewCount(pending)}' : ''),
                      style: const TextStyle(fontSize: 12, color: _muted),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (data.profiles.isEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Text(
                            context.l10n.subAddProfileToSubscribe,
                            style: TextStyle(color: _muted),
                          ),
                          const SizedBox(height: 12),
                          FilledButton.icon(
                            onPressed: () => context.push('/profiles/add'),
                            icon: const Icon(Icons.person_add_alt_1_outlined),
                            label: Text(context.l10n.familyAddProfile),
                          ),
                        ],
                      ),
                    ),
                  ),
                for (final profile in data.profiles)
                  _ProfileCard(
                    profile: profile,
                    canApply: data.payment.accounts.isNotEmpty,
                    onApply: () => _apply(context, profile, data.payment),
                    onCancel: () => _cancel(context, ref, profile),
                    onRequestWaiver: () => _requestWaiver(context, profile),
                  ),
                if (data.requests.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  Text(
                    context.l10n.subPaymentHistory,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontFamily: 'serif',
                      color: _ink,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Card(
                    child: Column(
                      children: [
                        for (final (index, request)
                            in data.requests.indexed) ...[
                          if (index > 0) const Divider(height: 1),
                          _RequestTile(request: request),
                        ],
                      ],
                    ),
                  ),
                ],
                if (data.waivers.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  Text(
                    context.l10n.subFeeWaivers,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontFamily: 'serif',
                      color: _ink,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Card(
                    child: Column(
                      children: [
                        for (final (index, waiver) in data.waivers.indexed) ...[
                          if (index > 0) const Divider(height: 1),
                          _WaiverTile(waiver: waiver),
                        ],
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _PaymentDetails extends StatelessWidget {
  const _PaymentDetails({required this.payment});
  final PaymentSettings payment;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: _border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                context.l10n.subHowToPay,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 19,
                  color: _ink,
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatMoney(payment.monthlyPrice, payment.currency),
                  style: const TextStyle(
                    fontFamily: 'serif',
                    fontSize: 20,
                    color: _ink,
                  ),
                ),
                Text(
                  context.l10n.subPerProfileMonth,
                  style: TextStyle(fontSize: 11, color: _muted),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          context.l10n.subHowToPayBody,
          style: TextStyle(fontSize: 13, color: _muted),
        ),
        if (payment.instructions.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _gold.withValues(alpha: .1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _gold.withValues(alpha: .3)),
            ),
            child: Text(
              payment.instructions,
              style: const TextStyle(fontSize: 13, color: _ink),
            ),
          ),
        ],
        const SizedBox(height: 12),
        if (payment.accounts.isEmpty)
          Text(
            context.l10n.subNoPaymentDetails,
            style: TextStyle(fontSize: 13, color: _muted),
          ),
        for (final account in payment.accounts) _AccountTile(account: account),
      ],
    ),
  );
}

class _AccountTile extends StatelessWidget {
  const _AccountTile({required this.account});
  final PaymentAccount account;

  IconData get _icon => switch (account.type) {
    'BANK' => Icons.account_balance_outlined,
    'MOBILE_BANKING' => Icons.phone_android_outlined,
    _ => Icons.account_balance_wallet_outlined,
  };

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 10),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: _border),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: const Color(0xfff9f6f0),
          child: Icon(_icon, size: 18, color: _gold),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                account.typeLabel(context.l10n).toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: .6,
                  color: _gold,
                ),
              ),
              Text(
                account.label,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              if (account.accountName.isNotEmpty)
                Text(
                  account.accountName,
                  style: const TextStyle(fontSize: 13, color: _muted),
                ),
              Row(
                children: [
                  Flexible(
                    child: SelectableText(
                      account.accountNumber,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 14,
                        color: _ink,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: context.l10n.subCopyAccountNumber,
                    visualDensity: VisualDensity.compact,
                    iconSize: 16,
                    onPressed: () async {
                      await Clipboard.setData(
                        ClipboardData(text: account.accountNumber),
                      );
                      if (context.mounted) {
                        ScaffoldMessenger.of(
                          context,
                        ).showSnackBar(SnackBar(content: Text(context.l10n.commonCopied)));
                      }
                    },
                    icon: const Icon(Icons.copy, color: _muted),
                  ),
                ],
              ),
              if (account.details.isNotEmpty)
                Text(
                  account.details,
                  style: const TextStyle(fontSize: 12, color: _muted),
                ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.profile,
    required this.canApply,
    required this.onApply,
    required this.onCancel,
    required this.onRequestWaiver,
  });

  final ProfileSubscription profile;
  final bool canApply;
  final VoidCallback onApply;
  final VoidCallback onCancel;
  final VoidCallback onRequestWaiver;

  Widget _waiverLine(AppLocalizations l10n) {
    final expires = profile.waiverExpiresAt;
    if (profile.hasUsableWaiver) {
      return _IconLine(
        icon: Icons.discount_outlined,
        color: const Color(0xff157a34),
        text: expires != null
            ? l10n.subWaiverReadyUseBy(profile.waiverPercent ?? 0, DateFormat.yMMMd().format(expires))
            : l10n.subWaiverReady(profile.waiverPercent ?? 0),
      );
    }
    if (profile.waiverPending) {
      return _IconLine(
        icon: Icons.discount_outlined,
        color: _blue,
        text: l10n.subWaiverUnderReview,
      );
    }
    final next = profile.nextWaiverApplicationAt;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (profile.waiverRejectionReason != null)
          Text(
            l10n.subWaiverRejected('${profile.waiverRejectionReason}'),
            style: const TextStyle(fontSize: 13, color: Colors.red),
          ),
        if (profile.waiverApplicationsLeft > 0)
          TextButton(
            onPressed: onRequestWaiver,
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              visualDensity: VisualDensity.compact,
            ),
            child: Text(
              l10n.subRequestWaiver,
              style: const TextStyle(decoration: TextDecoration.underline),
            ),
          )
        else
          Text(
            next != null
                ? l10n.subWaiverLimitNext(DateFormat.yMMMd().format(next))
                : l10n.subWaiverLimit,
            style: const TextStyle(fontSize: 12, color: _muted),
          ),
      ],
    );
  }

  String _statusLine(AppLocalizations l10n) {
    final until = profile.subscribedUntil;
    final parts = <String>[
      if (until != null) l10n.subSubscribedUntil(_dateTime(until)),
      if (profile.isPending)
        profile.isSubscribed
            ? l10n.subRenewalUnderReview
            : l10n.subPaymentUnderReview,
    ];
    return parts.isEmpty ? l10n.subSubscribeToEnrol : parts.join(' · ');
  }

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              LearnerAvatar(
                imageUrl: profile.avatarUrl,
                initials: profile.initials,
                radius: 26,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile.displayName,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        _StatusBadge(profile: profile),
                        _Pill(label: context.l10n.commonAge('${profile.age}')),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _statusLine(context.l10n),
            style: const TextStyle(fontSize: 13, color: _muted),
          ),
          if (!profile.isPending && profile.lastRejected) ...[
            const SizedBox(height: 4),
            Text(
              profile.lastRejectionReason != null
                  ? context.l10n.subLastRejectedReason(profile.lastRejectionReason!)
                  : context.l10n.subLastRejected,
              style: const TextStyle(fontSize: 13, color: Colors.red),
            ),
          ],
          const SizedBox(height: 6),
          _waiverLine(context.l10n),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: profile.isPending
                ? OutlinedButton(
                    onPressed: onCancel,
                    child: Text(context.l10n.subCancelRequest),
                  )
                : profile.isSubscribed
                ? OutlinedButton(
                    onPressed: canApply ? onApply : null,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xff157a34),
                      side: const BorderSide(color: _green),
                    ),
                    child: Text(context.l10n.subRenew),
                  )
                : FilledButton(
                    onPressed: canApply ? onApply : null,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    child: Text(context.l10n.subApply),
                  ),
          ),
        ],
      ),
    ),
  );
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.profile});
  final ProfileSubscription profile;

  @override
  Widget build(BuildContext context) {
    final (label, icon, background, border, color) = profile.isSubscribed
        ? (context.l10n.subBadgeSubscribed, Icons.check_circle_outline, _green, null, _ink)
        : profile.isPending
        ? (context.l10n.subBadgeUnderReview, Icons.schedule, Colors.white, _blue, _blue)
        : (context.l10n.subBadgeNotSubscribed, Icons.schedule, Colors.white, _gold, _ink);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
        border: border == null ? null : Border.all(color: border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: _border),
    ),
    child: Text(
      label,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: _ink,
      ),
    ),
  );
}

class _RequestTile extends StatelessWidget {
  const _RequestTile({required this.request});
  final SubscriptionRequest request;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (request.status) {
      'APPROVED' => (context.l10n.subReqApproved, const Color(0xff157a34)),
      'REJECTED' => (context.l10n.subReqRejected, Colors.red),
      'CANCELLED' => (context.l10n.subReqCancelled, Colors.blueGrey),
      _ => (context.l10n.subReqUnderReview, _blue),
    };
    final created = request.createdAt;
    final periodEnd = request.periodEnd;
    return ListTile(
      title: Text(
        '${request.profileName} · ${formatMoney(request.amount, request.currency)}'
        '${request.discountPercent > 0 ? ' (${context.l10n.subWaiverPercent(request.discountPercent)})' : ''}',
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            [request.paymentMethod, ?request.transactionId].join(' · '),
            style: const TextStyle(fontSize: 12),
          ),
          if (created != null)
            Text(
              context.l10n.subSubmittedOn(DateFormat.yMMMd().format(created)),
              style: const TextStyle(fontSize: 12),
            ),
          if (request.status == 'APPROVED' && periodEnd != null)
            Text(
              context.l10n.subUntil(DateFormat.yMMMd().format(periodEnd)),
              style: const TextStyle(fontSize: 12),
            ),
          if (request.status == 'REJECTED' && request.rejectionReason != null)
            Text(
              request.rejectionReason!,
              style: const TextStyle(fontSize: 12, color: Colors.red),
            ),
        ],
      ),
      trailing: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _IconLine extends StatelessWidget {
  const _IconLine({
    required this.icon,
    required this.color,
    required this.text,
  });
  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Icon(icon, size: 16, color: color),
      const SizedBox(width: 6),
      Expanded(
        child: Text(
          text,
          style: TextStyle(
            fontSize: 13,
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    ],
  );
}

class _WaiverTile extends StatelessWidget {
  const _WaiverTile({required this.waiver});
  final WaiverItem waiver;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (waiver.status) {
      'APPROVED' => (context.l10n.subWaiverReadyToUse, const Color(0xff157a34)),
      'USED' => (context.l10n.subWaiverUsed, Colors.blueGrey),
      'REJECTED' => (context.l10n.subWaiverNotApproved, Colors.red),
      'EXPIRED' => (context.l10n.subWaiverExpired, Colors.blueGrey),
      'REVOKED' => (context.l10n.subWaiverWithdrawn, Colors.blueGrey),
      _ => (context.l10n.subReqUnderReview, _blue),
    };
    final created = waiver.createdAt;
    final expires = waiver.expiresAt;
    final used = waiver.usedAt;
    return ListTile(
      title: Text(
        '${waiver.profileName}'
        '${waiver.percent != null ? ' · ${context.l10n.subWaiverOff(waiver.percent!)}' : ''}',
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (created != null)
            Text(
              context.l10n.subRequestedOn(DateFormat.yMMMd().format(created)),
              style: const TextStyle(fontSize: 12),
            ),
          if (waiver.status == 'APPROVED' && expires != null)
            Text(
              context.l10n.subUseBy(DateFormat.yMMMd().format(expires)),
              style: const TextStyle(fontSize: 12),
            ),
          if (waiver.status == 'USED' && used != null)
            Text(
              context.l10n.subUsedOn(DateFormat.yMMMd().format(used)),
              style: const TextStyle(fontSize: 12),
            ),
          if (waiver.reason != null)
            Text(
              waiver.reason!,
              style: const TextStyle(fontSize: 12, color: Colors.red),
            ),
        ],
      ),
      trailing: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}
