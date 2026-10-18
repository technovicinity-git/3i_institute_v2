import 'package:flutter/widgets.dart';

import '../../l10n/app_localizations.dart';

export '../../l10n/app_localizations.dart';

/// Interface languages. `Account.locale` on the backend uses the same codes.
const supportedLanguageCodes = ['en', 'bn', 'hi', 'ur', 'ar'];

/// Each language's name in its own script, for the language picker.
const languageNames = {
  'en': 'English',
  'bn': 'বাংলা',
  'hi': 'हिन्दी',
  'ur': 'اردو',
  'ar': 'العربية',
};

bool isSupportedLanguage(String? code) =>
    code != null && supportedLanguageCodes.contains(code);

extension AppLocalizationsX on BuildContext {
  /// Translated strings for the current language: `context.l10n.loginTitle`.
  AppLocalizations get l10n => AppLocalizations.of(this);
}
