import 'dart:async';
import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import 'l10n.dart';

/// Loaded in `main()` before the app starts, so the saved language is known
/// on the first frame.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('Override in main()'),
);

final languageProvider = NotifierProvider<LanguageController, String>(
  LanguageController.new,
);

/// The learner-side interface language.
///
/// Starts from the language saved on this device, then the device language,
/// then English. When someone signs in, their account's language wins (it is
/// chosen at registration and synced from the website). Changing it here also
/// saves it on the account, so the website and emails follow.
class LanguageController extends Notifier<String> {
  static const _storageKey = 'language';

  SharedPreferences get _prefs => ref.read(sharedPreferencesProvider);

  @override
  String build() {
    ref.listen(authControllerProvider, (previous, next) {
      final before = previous?.asData?.value;
      final account = next.asData?.value;
      if (account != null &&
          account.id != before?.id &&
          isSupportedLanguage(account.locale)) {
        _apply(account.locale);
      }
    });

    final saved = _prefs.getString(_storageKey);
    final device = PlatformDispatcher.instance.locale.languageCode;
    final code = isSupportedLanguage(saved)
        ? saved!
        : (isSupportedLanguage(device) ? device : 'en');
    ref.read(apiClientProvider).languageCode = code;
    return code;
  }

  void _apply(String code) {
    state = code;
    ref.read(apiClientProvider).languageCode = code;
    unawaited(_prefs.setString(_storageKey, code));
  }

  /// Switches the app's language. Returns false when it couldn't be saved on
  /// the account (the app still switches; it resets at the next sign-in).
  Future<bool> change(String code) async {
    if (!isSupportedLanguage(code) || code == state) return true;
    _apply(code);
    final account = ref.read(authControllerProvider).asData?.value;
    if (account == null) return true;
    try {
      await ref
          .read(apiClientProvider)
          .dio
          .patch<Map<String, dynamic>>('/users/me', data: {'locale': code});
      unawaited(ref.read(authControllerProvider.notifier).refreshAccount());
      return true;
    } catch (_) {
      return false;
    }
  }
}
