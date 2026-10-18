import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:three_i_mobile/core/l10n/l10n.dart';
import 'package:three_i_mobile/features/auth/presentation/pages/login_page.dart';

Widget _app(String language) => ProviderScope(
  child: MaterialApp(
    locale: Locale(language),
    supportedLocales: AppLocalizations.supportedLocales,
    localizationsDelegates: const [
      AppLocalizations.delegate,
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    // Same as the app shell: the layout never mirrors.
    builder: (context, child) =>
        Directionality(textDirection: TextDirection.ltr, child: child!),
    home: const LoginPage(),
  ),
);

void main() {
  test('every supported language has translations', () {
    expect(
      AppLocalizations.supportedLocales.map((l) => l.languageCode).toSet(),
      supportedLanguageCodes.toSet(),
    );
  });

  for (final language in supportedLanguageCodes) {
    testWidgets('login screen renders in $language', (tester) async {
      await tester.pumpWidget(_app(language));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      final l10n = AppLocalizations.of(tester.element(find.byType(LoginPage)));
      expect(find.text(l10n.loginTitle), findsOneWidget);
      // The layout stays left-to-right in every language.
      expect(
        Directionality.of(tester.element(find.text(l10n.loginTitle))),
        TextDirection.ltr,
      );
      if (language == 'ar' || language == 'ur') {
        // Text reads right-to-left inside an isolate.
        expect(l10n.loginTitle, startsWith('\u2067'));
        expect(l10n.loginTitle, endsWith('\u2069'));
      }
    });
  }

  test('plurals and placeholders format per language', () async {
    final en = await AppLocalizations.delegate.load(const Locale('en'));
    final ar = await AppLocalizations.delegate.load(const Locale('ar'));
    expect(en.pinTriesLeft(1), 'Incorrect PIN. 1 try left.');
    expect(en.pinTriesLeft(2), 'Incorrect PIN. 2 tries left.');
    expect(ar.pinTriesLeft(2), contains('محاولتان'));
    expect(en.checkEmailResendIn(42), contains('42'));
  });
}
