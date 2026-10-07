import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/push/push_notifications.dart';
import '../features/auth/presentation/providers/auth_providers.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';

class ThreeIApp extends ConsumerStatefulWidget {
  const ThreeIApp({super.key});

  @override
  ConsumerState<ThreeIApp> createState() => _ThreeIAppState();
}

class _ThreeIAppState extends ConsumerState<ThreeIApp> {
  final _subscriptions = <StreamSubscription<RemoteMessage>>[];
  // A tapped push waiting for sign-in to finish (e.g. cold start).
  RemoteMessage? _pendingTap;

  @override
  void initState() {
    super.initState();
    if (!PushNotifications.available) return;
    _subscriptions
      ..add(FirebaseMessaging.onMessage.listen(_showForeground))
      ..add(FirebaseMessaging.onMessageOpenedApp.listen(_openFromTap));
    FirebaseMessaging.instance.getInitialMessage().then((message) {
      if (message != null) _openFromTap(message);
    });
  }

  @override
  void dispose() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    super.dispose();
  }

  // Phones don't show pushes while the app is open, so show a snackbar —
  // unless the in-app copy already triggered the notification banner.
  void _showForeground(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null || PushNotifications.hasInAppCopy(message)) {
      return;
    }
    rootScaffoldMessengerKey.currentState
      ?..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                notification.title ?? '',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              if ((notification.body ?? '').isNotEmpty)
                Text(
                  notification.body!,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      );
  }

  void _openFromTap(RemoteMessage message) {
    final account = ref.read(authControllerProvider).asData?.value;
    if (account == null) {
      _pendingTap = message;
      return;
    }
    _pendingTap = null;
    final route = PushNotifications.routeFor(
      message,
      instructor: account.role == 'Instructor',
    );
    // Let the router finish any redirect (e.g. startup) first.
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => ref.read(appRouterProvider).push(route),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Keeps this device's push token registered while signed in.
    ref.watch(pushRegistrationProvider);
    ref.listen(authControllerProvider, (_, next) {
      final pending = _pendingTap;
      if (pending != null && next.asData?.value != null) {
        _openFromTap(pending);
      }
    });

    return MaterialApp.router(
      title: '3i International Islamic Institute',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      routerConfig: ref.watch(appRouterProvider),
    );
  }
}
