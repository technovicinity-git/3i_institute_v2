import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/subscription_providers.dart';
import '../widgets/apply_subscription_sheet.dart';
import '../widgets/learner_avatar.dart';

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
            'Payment submitted. We’ll subscribe ${profile.displayName} once it’s verified.',
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
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel this request?'),
        content: Text(
          'The payment for ${profile.displayName} won’t be reviewed. You can '
          'submit it again later.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep it'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.deepOrange),
            child: const Text('Cancel request'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(subscriptionActionsProvider).cancel(requestId);
      messenger.showSnackBar(
        const SnackBar(content: Text('Request cancelled')),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(error, fallback: 'Failed to cancel the request'),
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
              const Text('Failed to load your subscription'),
              TextButton(
                onPressed: () => ref.invalidate(subscriptionOverviewProvider),
                child: const Text('Try again'),
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
                  'Subscription',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontFamily: 'serif',
                    color: _navy,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Each learner profile needs its own subscription to enrol in '
                  'courses. A subscription lasts one month from approval.',
                  style: TextStyle(color: _muted),
                ),
                const SizedBox(height: 18),
                _PaymentDetails(payment: data.payment),
                const SizedBox(height: 22),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Learner profiles',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontFamily: 'serif', color: _ink),
                      ),
                    ),
                    Text(
                      '${data.subscribedCount} of ${data.profiles.length} subscribed'
                      '${pending > 0 ? ' · $pending under review' : ''}',
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
                          const Text(
                            'Add a learner profile to subscribe.',
                            style: TextStyle(color: _muted),
                          ),
                          const SizedBox(height: 12),
                          FilledButton.icon(
                            onPressed: () => context.push('/profiles/add'),
                            icon: const Icon(Icons.person_add_alt_1_outlined),
                            label: const Text('Add profile'),
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
                  ),
                if (data.requests.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  Text(
                    'Payment history',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontFamily: 'serif',
                      color: _ink,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Card(
                    child: Column(
                      children: [
                        for (final (index, request) in data.requests.indexed) ...[
                          if (index > 0) const Divider(height: 1),
                          _RequestTile(request: request),
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
            const Expanded(
              child: Text(
                'How to pay',
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
                const Text(
                  'per profile · one month',
                  style: TextStyle(fontSize: 11, color: _muted),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        const Text(
          'Send the payment to one of these accounts, then apply for each '
          'profile with your transaction details.',
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
          const Text(
            'Payment details haven’t been added yet. Please contact support.',
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
                account.typeLabel.toUpperCase(),
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
                    tooltip: 'Copy account number',
                    visualDensity: VisualDensity.compact,
                    iconSize: 16,
                    onPressed: () async {
                      await Clipboard.setData(
                        ClipboardData(text: account.accountNumber),
                      );
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Copied')),
                        );
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
  });

  final ProfileSubscription profile;
  final bool canApply;
  final VoidCallback onApply;
  final VoidCallback onCancel;

  String get _statusLine {
    final until = profile.subscribedUntil;
    final parts = <String>[
      if (until != null) 'Subscribed until ${_dateTime(until)}',
      if (profile.isPending)
        profile.isSubscribed
            ? 'Renewal payment under review'
            : 'Payment under review — usually within a day',
    ];
    return parts.isEmpty ? 'Subscribe to enrol in courses' : parts.join(' · ');
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
                        _Pill(label: 'Age ${profile.age}'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(_statusLine, style: const TextStyle(fontSize: 13, color: _muted)),
          if (!profile.isPending && profile.lastRejected) ...[
            const SizedBox(height: 4),
            Text(
              'Last payment wasn’t approved'
              '${profile.lastRejectionReason != null ? ': ${profile.lastRejectionReason}' : '.'}',
              style: const TextStyle(fontSize: 13, color: Colors.red),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: profile.isPending
                ? OutlinedButton(
                    onPressed: onCancel,
                    child: const Text('Cancel request'),
                  )
                : profile.isSubscribed
                ? OutlinedButton(
                    onPressed: canApply ? onApply : null,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xff157a34),
                      side: const BorderSide(color: _green),
                    ),
                    child: const Text('Renew'),
                  )
                : FilledButton(
                    onPressed: canApply ? onApply : null,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    child: const Text('Apply for subscription'),
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
        ? ('SUBSCRIBED', Icons.check_circle_outline, _green, null, _ink)
        : profile.isPending
        ? ('UNDER REVIEW', Icons.schedule, Colors.white, _blue, _blue)
        : ('NOT SUBSCRIBED', Icons.schedule, Colors.white, _gold, _ink);
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
      'APPROVED' => ('Approved', const Color(0xff157a34)),
      'REJECTED' => ('Rejected', Colors.red),
      'CANCELLED' => ('Cancelled', Colors.blueGrey),
      _ => ('Under review', _blue),
    };
    final created = request.createdAt;
    final periodEnd = request.periodEnd;
    return ListTile(
      title: Text(
        '${request.profileName} · ${formatMoney(request.amount, request.currency)}',
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${request.paymentMethod} · ${request.transactionId}',
            style: const TextStyle(fontSize: 12),
          ),
          if (created != null)
            Text(
              'Submitted ${DateFormat.yMMMd().format(created)}',
              style: const TextStyle(fontSize: 12),
            ),
          if (request.status == 'APPROVED' && periodEnd != null)
            Text(
              'Until ${DateFormat.yMMMd().format(periodEnd)}',
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
