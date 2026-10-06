import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../domain/app_notification.dart';
import '../notifications_providers.dart';

const _navy = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});
  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scroll.removeListener(_onScroll);
    _scroll.dispose();
    super.dispose();
  }

  String get _scopeKey =>
      notificationScopeKey(ref.read(notificationScopeProvider));

  void _onScroll() {
    if (_scroll.position.extentAfter < 300) {
      ref
          .read(notificationFeedProvider(_scopeKey).notifier)
          .loadMore()
          .catchError((_) {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final scope = ref.watch(notificationScopeProvider);
    final scopeKey = notificationScopeKey(scope);
    final feed = ref.watch(notificationFeedProvider(scopeKey));
    final unread = ref.watch(
      notificationCenterProvider.select((counts) => counts.forScope(scope)),
    );

    return RefreshIndicator(
      onRefresh: () {
        ref.read(notificationCenterProvider.notifier).refresh();
        return ref.refresh(notificationFeedProvider(scopeKey).future);
      },
      child: ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Notifications',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 27,
                    color: _navy,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: unread == 0
                    ? null
                    : () => ref
                          .read(notificationFeedProvider(scopeKey).notifier)
                          .markAllRead()
                          .catchError((_) => _notify('Could not mark as read')),
                style: TextButton.styleFrom(foregroundColor: _green),
                icon: const Icon(Icons.done_all, size: 18),
                label: const Text('Mark all read'),
              ),
            ],
          ),
          Text('$unread unread', style: const TextStyle(color: _muted)),
          const SizedBox(height: 16),
          ...feed.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                icon: Icons.error_outline,
                text: 'Could not load notifications.',
                action: TextButton(
                  onPressed: () =>
                      ref.invalidate(notificationFeedProvider(scopeKey)),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (state) => [
              if (state.items.isEmpty)
                const _Message(
                  icon: Icons.notifications_none,
                  text: "You're all caught up.",
                )
              else
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: _border),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      for (var i = 0; i < state.items.length; i++) ...[
                        if (i > 0) const Divider(height: 1, color: _border),
                        _NotificationTile(
                          notification: state.items[i],
                          onOpen: () => _open(scopeKey, state.items[i]),
                          onRemove: () => ref
                              .read(notificationFeedProvider(scopeKey).notifier)
                              .remove(state.items[i])
                              .catchError(
                                (_) => _notify('Could not remove notification'),
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              if (state.loadingMore)
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _open(String scopeKey, AppNotification notification) {
    ref
        .read(notificationFeedProvider(scopeKey).notifier)
        .markRead(notification)
        .catchError((_) {});
    final route = mobileRouteFor(notification);
    if (route != null) context.push(route);
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.notification,
    required this.onOpen,
    required this.onRemove,
  });
  final AppNotification notification;
  final VoidCallback onOpen, onRemove;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _categoryStyle(notification.category);
    final unread = !notification.read;
    return Dismissible(
      key: ValueKey(notification.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove(),
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: Material(
        color: unread ? const Color(0xFFF2FBF4) : Colors.white,
        child: InkWell(
          onTap: onOpen,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: color.withValues(alpha: .1),
                  child: Icon(icon, size: 18, color: color),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                color: _navy,
                                fontWeight: unread
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                              ),
                            ),
                          ),
                          if (unread)
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(left: 6),
                              decoration: const BoxDecoration(
                                color: _green,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        notification.body,
                        style: const TextStyle(fontSize: 13, color: _muted),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _timeAgo(notification.createdAt),
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, this.action});
  final IconData icon;
  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: const Color(0xFFCBD5E1)),
        const SizedBox(height: 10),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _muted),
        ),
        ?action,
      ],
    ),
  );
}

(IconData, Color) _categoryStyle(String category) => switch (category) {
  'schedule' => (Icons.event_outlined, const Color(0xFF2563EB)),
  'learning' => (Icons.menu_book_outlined, const Color(0xFF7C3AED)),
  'enrolment' => (Icons.how_to_reg_outlined, _green),
  'certificate' => (Icons.workspace_premium_outlined, const Color(0xFFB8912F)),
  'chat' => (Icons.chat_bubble_outline, const Color(0xFF0EA5E9)),
  'billing' => (Icons.credit_card, const Color(0xFFEA580C)),
  'course' => (Icons.school_outlined, _green),
  'admin' => (Icons.admin_panel_settings_outlined, const Color(0xFFDC2626)),
  _ => (Icons.notifications_none, _muted),
};

String _timeAgo(DateTime date) {
  final diff = DateTime.now().difference(date);
  if (diff.inMinutes < 1) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  return DateFormat('MMM d, y').format(date);
}
