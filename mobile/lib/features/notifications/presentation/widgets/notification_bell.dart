import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/app_notification.dart';
import '../notifications_providers.dart';

/// App bar bell with an unread badge. Also shows an in-app banner when a new
/// notification for the current feed arrives.
class NotificationBell extends ConsumerWidget {
  const NotificationBell({required this.notificationsRoute, super.key});

  /// Screen opened on tap, e.g. `/notifications` or `/instructor/notifications`.
  final String notificationsRoute;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scope = ref.watch(notificationScopeProvider);
    final unread = ref.watch(
      notificationCenterProvider.select((counts) => counts.forScope(scope)),
    );

    ref.listen<AppNotification?>(latestNotificationProvider, (_, next) {
      if (next == null || next.learnerProfileId != scope) return;
      final messenger = ScaffoldMessenger.maybeOf(context);
      if (messenger == null) return;
      final route = mobileRouteFor(next);
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  next.title,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(next.body, maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
            action: SnackBarAction(
              label: 'View',
              onPressed: () {
                ref
                    .read(
                      notificationFeedProvider(
                        notificationScopeKey(scope),
                      ).notifier,
                    )
                    .markRead(next)
                    .catchError((_) {});
                if (context.mounted) {
                  context.push(route ?? notificationsRoute);
                }
              },
            ),
          ),
        );
    });

    return IconButton(
      tooltip: unread > 0 ? 'Notifications, $unread unread' : 'Notifications',
      onPressed: () => context.push(notificationsRoute),
      icon: Badge(
        isLabelVisible: unread > 0,
        backgroundColor: const Color(0xFF22A146),
        label: Text(unread > 99 ? '99+' : '$unread'),
        child: const Icon(Icons.notifications_none, color: Color(0xFF12304E)),
      ),
    );
  }
}
