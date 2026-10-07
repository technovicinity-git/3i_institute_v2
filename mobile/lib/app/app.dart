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
  final _subscriptions = <StreamSubscription<Object?>>[];
  // Data of a tapped notification waiting for sign-in to finish (e.g. cold
  // start).
  Map<String, dynamic>? _pendingTap;

  @override
  void initState() {
    super.initState();
    if (!PushNotifications.available) return;
    _subscriptions
      // Shown in the notification bar even while the app is open.
      ..add(
        FirebaseMessaging.onMessage.listen(PushNotifications.showForeground),
      )
      ..add(
        FirebaseMessaging.onMessageOpenedApp.listen((m) => _openFromTap(m.data)),
      )
      ..add(PushNotifications.localTaps.listen(_openFromTap));
    FirebaseMessaging.instance.getInitialMessage().then((message) {
      if (message != null) _openFromTap(message.data);
    });
  }

  @override
  void dispose() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    super.dispose();
  }

  void _openFromTap(Map<String, dynamic> data) {
    final account = ref.read(authControllerProvider).asData?.value;
    if (account == null) {
      _pendingTap = data;
      return;
    }
    _pendingTap = null;
    final route = PushNotifications.routeFor(
      data,
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
      routerConfig: ref.watch(appRouterProvider),
    );
  }
}
