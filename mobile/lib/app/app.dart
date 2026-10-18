import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' show Intl;

import '../core/l10n/l10n.dart';
import '../core/l10n/language_controller.dart';
import '../core/network/api_error_message.dart';
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
  // Instructor screens (incl. sign-in) stay English, like the website.
  bool _onInstructorRoute = false;

  @override
  void initState() {
    super.initState();
    final router = ref.read(appRouterProvider);
    router.routerDelegate.addListener(_trackRoute);
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

  void _trackRoute() {
    final path = ref
        .read(appRouterProvider)
        .routerDelegate
        .currentConfiguration
        .uri
        .path;
    final instructor = path.startsWith('/instructor');
    if (instructor != _onInstructorRoute) {
      setState(() => _onInstructorRoute = instructor);
    }
  }

  @override
  void dispose() {
    ref.read(appRouterProvider).routerDelegate.removeListener(_trackRoute);
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

    final account = ref.watch(authControllerProvider).asData?.value;
    final language = ref.watch(languageProvider);
    final englishOnly = _onInstructorRoute || account?.role == 'Instructor';
    final locale = Locale(englishOnly ? 'en' : language);
    // Dates and numbers formatted without an explicit locale follow the app.
    Intl.defaultLocale = locale.languageCode;

    return MaterialApp.router(
      title: '3i International Islamic Institute',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: ref.watch(appRouterProvider),
      builder: (context, child) {
        connectionErrorMessage = context.l10n.commonConnectionError;
        // Arabic and Urdu keep the same left-to-right layout as every other
        // language; their strings carry right-to-left isolates (see the .arb
        // files), so the text itself still reads right-to-left.
        return Directionality(
          textDirection: TextDirection.ltr,
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
