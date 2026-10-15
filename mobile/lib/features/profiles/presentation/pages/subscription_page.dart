import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/subscription_providers.dart';
import '../widgets/learner_avatar.dart';

const _navy = Color(0xff12304e);
const _ink = Color(0xff0c1f33);
const _muted = Color(0xff475569);
const _green = Color(0xff22a146);
const _gold = Color(0xffb8912f);
const _border = Color(0xffe3e8ef);

String _price(double amount) => '\$${amount.toStringAsFixed(2)}';

class SubscriptionPage extends ConsumerStatefulWidget {
  const SubscriptionPage({super.key});

  @override
  ConsumerState<SubscriptionPage> createState() => _SubscriptionPageState();
}

class _SubscriptionPageState extends ConsumerState<SubscriptionPage> {
  String? _pendingId;

  Future<void> _change(ProfileSubscription profile) async {
    final subscribe = !profile.isSubscribed;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          subscribe
              ? 'Subscribe ${profile.displayName}?'
              : 'Unsubscribe ${profile.displayName}?',
        ),
        content: Text(
          subscribe
              ? '${profile.displayName} will be able to enrol in courses for '
                    'their age. Payment isn’t collected yet, so this is '
                    'activated straight away.'
              : '${profile.displayName} won’t be able to enrol in new courses. '
                    'Their progress, results and certificates are kept.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(subscribe ? 'Cancel' : 'Keep subscription'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: subscribe ? _green : Colors.deepOrange,
            ),
            child: Text(subscribe ? 'Subscribe' : 'Unsubscribe'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _pendingId = profile.id);
    final messenger = ScaffoldMessenger.of(context);
    try {
      final actions = ref.read(subscriptionActionsProvider);
      if (subscribe) {
        await actions.subscribe(profile.id);
      } else {
        await actions.unsubscribe(profile.id);
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            subscribe
                ? '${profile.displayName} is now subscribed'
                : '${profile.displayName} has been unsubscribed',
          ),
        ),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(
              error,
              fallback: subscribe
                  ? 'Failed to subscribe'
                  : 'Failed to unsubscribe',
            ),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _pendingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
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
        data: (data) => RefreshIndicator(
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
                'courses.',
                style: TextStyle(color: _muted),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: _SummaryTile(
                      label: 'Subscribed',
                      value:
                          '${data.subscribedCount} of ${data.profiles.length}',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _SummaryTile(
                      label: 'Per profile',
                      value: '${_price(data.pricePerProfile)}/mo',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _SummaryTile(
                      label: 'Monthly total',
                      value: _price(
                        data.subscribedCount * data.pricePerProfile,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _Notice(manualEnabled: data.manualSubscriptionsEnabled),
              const SizedBox(height: 18),
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
                  price: data.pricePerProfile,
                  canManage: data.manualSubscriptionsEnabled,
                  pending: _pendingId == profile.id,
                  onChange: _pendingId == null ? () => _change(profile) : null,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryTile extends StatelessWidget {
  const _SummaryTile({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: _border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: _muted)),
        const SizedBox(height: 4),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(
            value,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 18,
              color: _ink,
            ),
          ),
        ),
      ],
    ),
  );
}

class _Notice extends StatelessWidget {
  const _Notice({required this.manualEnabled});
  final bool manualEnabled;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: manualEnabled ? _gold.withValues(alpha: .1) : Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(
        color: manualEnabled ? _gold.withValues(alpha: .3) : _border,
      ),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.info_outline,
          size: 20,
          color: manualEnabled ? _gold : _muted,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            manualEnabled
                ? 'Online payment is coming soon. For now, subscriptions are '
                      'activated as soon as you subscribe and no payment is '
                      'taken.'
                : 'Subscriptions can’t be changed here right now. Please '
                      'contact support.',
            style: TextStyle(fontSize: 13, color: manualEnabled ? _ink : _muted),
          ),
        ),
      ],
    ),
  );
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.profile,
    required this.price,
    required this.canManage,
    required this.pending,
    required this.onChange,
  });

  final ProfileSubscription profile;
  final double price;
  final bool canManage;
  final bool pending;
  final VoidCallback? onChange;

  @override
  Widget build(BuildContext context) {
    final since = profile.subscribedAt;
    return Card(
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
                          _StatusBadge(subscribed: profile.isSubscribed),
                          _Pill(label: 'Age ${profile.age}'),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              profile.isSubscribed && since != null
                  ? 'Subscribed since ${DateFormat.yMMMd().format(since.toLocal())} · can enrol in courses'
                  : '${_price(price)} / month · subscribe to enrol in courses',
              style: const TextStyle(fontSize: 13, color: _muted),
            ),
            if (canManage) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: profile.isSubscribed
                    ? OutlinedButton(
                        onPressed: onChange,
                        child: pending
                            ? const _Spinner()
                            : const Text('Unsubscribe'),
                      )
                    : FilledButton(
                        onPressed: onChange,
                        style: FilledButton.styleFrom(backgroundColor: _green),
                        child: pending
                            ? const _Spinner(color: Colors.white)
                            : const Text('Subscribe'),
                      ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.subscribed});
  final bool subscribed;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: subscribed ? _green : Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: subscribed ? null : Border.all(color: _gold),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          subscribed ? Icons.check_circle_outline : Icons.schedule,
          size: 12,
          color: _ink,
        ),
        const SizedBox(width: 4),
        Text(
          subscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED',
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: _ink,
          ),
        ),
      ],
    ),
  );
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

class _Spinner extends StatelessWidget {
  const _Spinner({this.color});
  final Color? color;

  @override
  Widget build(BuildContext context) => SizedBox.square(
    dimension: 18,
    child: CircularProgressIndicator(strokeWidth: 2, color: color),
  );
}
