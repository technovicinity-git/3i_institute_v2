import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'core/l10n/language_controller.dart';
import 'core/push/push_notifications.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PushNotifications.initialize();
  final preferences = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(preferences)],
      child: const ThreeIApp(),
    ),
  );
}
