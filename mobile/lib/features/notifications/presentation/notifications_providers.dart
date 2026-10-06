import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../data/notifications_repository.dart';
import '../domain/app_notification.dart';

final notificationsRepositoryProvider = Provider(
  (ref) => NotificationsRepository(ref.watch(apiClientProvider)),
);

/// Family key for account-level feeds (instructors, account holders).
const accountNotificationScope = 'account';

/// The feed the signed-in user is looking at: the active learner profile, or
/// the account feed for instructors. Null learner profile id = account.
final notificationScopeProvider = Provider<String?>((ref) {
  final role = ref.watch(
    authControllerProvider.select((auth) => auth.asData?.value?.role),
  );
  if (role == null || role == 'Instructor') return null;
  return ref.watch(activeLearnerProfileProvider)?.id;
});

String notificationScopeKey(String? learnerProfileId) =>
    learnerProfileId ?? accountNotificationScope;

/// Unread counts for every feed, kept live over Socket.IO while signed in.
final notificationCenterProvider =
    NotifierProvider<NotificationCenter, UnreadCounts>(NotificationCenter.new);

/// The most recent notification received in realtime, for in-app banners.
final latestNotificationProvider =
    NotifierProvider<LatestNotification, AppNotification?>(
      LatestNotification.new,
    );

class LatestNotification extends Notifier<AppNotification?> {
  @override
  AppNotification? build() => null;
  void push(AppNotification notification) => state = notification;
}

class NotificationCenter extends Notifier<UnreadCounts> {
  NotificationSocket? _socket;

  NotificationsRepository get _repository =>
      ref.read(notificationsRepositoryProvider);

  @override
  UnreadCounts build() {
    // Reconnect only when the signed-in user changes.
    final userId = ref.watch(
      authControllerProvider.select((auth) => auth.asData?.value?.id),
    );
    ref.onDispose(() {
      _socket?.close();
      _socket = null;
    });
    if (userId == null) return const UnreadCounts();
    Future.microtask(() async {
      await refresh();
      await _connect();
    });
    return const UnreadCounts();
  }

  Future<void> refresh() async {
    try {
      final counts = await _repository.unreadCounts();
      if (ref.mounted) state = counts;
    } catch (_) {
      // Keep the last known counts.
    }
  }

  Future<void> _connect() async {
    final token = await ref.read(apiClientProvider).readAccessToken();
    if (token == null || token.isEmpty || !ref.mounted) return;
    _socket?.close();
    _socket = _repository.connect(
      token: token,
      onUnread: (counts) {
        if (ref.mounted) state = counts;
      },
      onNotification: (notification) {
        if (!ref.mounted) return;
        ref.invalidate(notificationFeedProvider);
        ref.read(latestNotificationProvider.notifier).push(notification);
      },
    );
  }
}

class NotificationFeedState {
  const NotificationFeedState({
    required this.items,
    required this.hasMore,
    this.loadingMore = false,
  });
  final List<AppNotification> items;
  final bool hasMore, loadingMore;

  NotificationFeedState copyWith({
    List<AppNotification>? items,
    bool? hasMore,
    bool? loadingMore,
  }) => NotificationFeedState(
    items: items ?? this.items,
    hasMore: hasMore ?? this.hasMore,
    loadingMore: loadingMore ?? this.loadingMore,
  );
}

/// Paged notifications for one feed, keyed by [notificationScopeKey].
final notificationFeedProvider =
    AsyncNotifierProvider.family<
      NotificationFeed,
      NotificationFeedState,
      String
    >(NotificationFeed.new);

class NotificationFeed extends AsyncNotifier<NotificationFeedState> {
  NotificationFeed(this.scopeKey);
  final String scopeKey;
  static const _pageSize = 20;
  int _page = 1;

  String? get _learnerProfileId =>
      scopeKey == accountNotificationScope ? null : scopeKey;

  NotificationsRepository get _repository =>
      ref.read(notificationsRepositoryProvider);

  @override
  Future<NotificationFeedState> build() async {
    _page = 1;
    final page = await _repository.list(
      learnerProfileId: _learnerProfileId,
      limit: _pageSize,
    );
    return NotificationFeedState(items: page.items, hasMore: page.hasMore);
  }

  Future<void> loadMore() async {
    final current = state.asData?.value;
    if (current == null || !current.hasMore || current.loadingMore) return;
    state = AsyncData(current.copyWith(loadingMore: true));
    try {
      final page = await _repository.list(
        learnerProfileId: _learnerProfileId,
        page: _page + 1,
        limit: _pageSize,
      );
      _page++;
      final seen = current.items.map((n) => n.id).toSet();
      state = AsyncData(
        current.copyWith(
          items: [
            ...current.items,
            ...page.items.where((n) => !seen.contains(n.id)),
          ],
          hasMore: page.hasMore,
          loadingMore: false,
        ),
      );
    } catch (_) {
      state = AsyncData(current.copyWith(loadingMore: false));
      rethrow;
    }
  }

  Future<void> markRead(AppNotification notification) async {
    if (notification.read) return;
    _replace(
      (items) => [
        for (final n in items)
          n.id == notification.id ? n.copyWith(read: true) : n,
      ],
    );
    try {
      await _repository.markAsRead(notification.id);
    } finally {
      await ref.read(notificationCenterProvider.notifier).refresh();
    }
  }

  Future<void> markAllRead() async {
    _replace((items) => [for (final n in items) n.copyWith(read: true)]);
    try {
      await _repository.markAllAsRead(_learnerProfileId);
    } finally {
      await ref.read(notificationCenterProvider.notifier).refresh();
    }
  }

  Future<void> remove(AppNotification notification) async {
    _replace((items) => items.where((n) => n.id != notification.id).toList());
    try {
      await _repository.remove(notification.id);
    } catch (_) {
      ref.invalidateSelf();
      rethrow;
    } finally {
      await ref.read(notificationCenterProvider.notifier).refresh();
    }
  }

  void _replace(List<AppNotification> Function(List<AppNotification>) update) {
    final current = state.asData?.value;
    if (current == null) return;
    state = AsyncData(current.copyWith(items: update(current.items)));
  }
}

/// Maps a notification's web route to a screen that exists in the app.
/// Returns null when there is no matching screen.
String? mobileRouteFor(AppNotification notification) {
  final route = notification.route;
  if (route == null || !route.startsWith('/')) return null;
  final path = Uri.parse(route).path;

  // Online class detail pages are web-only; open the online classes list.
  if (RegExp(r'^/online-classes/[^/]+$').hasMatch(path)) {
    return '/online-classes';
  }

  const supported = [
    r'^/my-courses$',
    r'^/my-courses/[^/]+/exams$',
    r'^/my-courses/[^/]+/exams/[^/]+/result$',
    r'^/my-courses/[^/]+/assignments$',
    r'^/my-courses/[^/]+/lessons/[^/]+$',
    r'^/online-classes$',
    r'^/certificates$',
    r'^/courses/[^/]+$',
    r'^/account-settings$',
    r'^/instructor/dashboard$',
    r'^/instructor/courses/[^/]+/edit$',
    r'^/instructor/courses/[^/]+/students$',
    r'^/instructor/courses/[^/]+/batches/[^/]+$',
    r'^/instructor/courses/[^/]+/assignments/[^/]+$',
    r'^/instructor/courses/[^/]+/exams/[^/]+/attempts/[^/]+/grade$',
  ];
  return supported.any((pattern) => RegExp(pattern).hasMatch(path))
      ? path
      : null;
}
