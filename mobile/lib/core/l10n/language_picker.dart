import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'l10n.dart';
import 'language_controller.dart';

/// Lets the user pick the app language; the app switches right away.
/// Signed in, the choice is also saved on the account.
Future<void> showLanguageSheet(BuildContext context, WidgetRef ref) async {
  final current = ref.read(languageProvider);
  final code = await showModalBottomSheet<String>(
    context: context,
    showDragHandle: true,
    builder: (context) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
            child: Text(
              context.l10n.languageLabel,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          for (final code in supportedLanguageCodes)
            ListTile(
              title: Text(languageNames[code]!),
              trailing: code == current
                  ? Icon(Icons.check, color: Theme.of(context).primaryColor)
                  : null,
              onTap: () => Navigator.pop(context, code),
            ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
  if (code == null || code == current) return;
  final saved = await ref.read(languageProvider.notifier).change(code);
  if (!saved && context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.languageSaveFailed)));
  }
}

/// Language field for the registration form. Picking a language switches the
/// app immediately and becomes the new account's language.
class LanguageDropdownField extends ConsumerWidget {
  const LanguageDropdownField({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) =>
      DropdownButtonFormField<String>(
        initialValue: ref.watch(languageProvider),
        decoration: InputDecoration(
          labelText: context.l10n.registerLanguage,
          helperText: context.l10n.registerLanguageHint,
          helperMaxLines: 2,
        ),
        items: [
          for (final code in supportedLanguageCodes)
            DropdownMenuItem(value: code, child: Text(languageNames[code]!)),
        ],
        onChanged: (code) {
          if (code != null) ref.read(languageProvider.notifier).change(code);
        },
      );
}

/// Globe button that opens the language sheet, like the website's header
/// switcher. [showName] adds the current language's name next to the globe.
class LanguageButton extends ConsumerWidget {
  const LanguageButton({this.showName = false, this.color, super.key});

  final bool showName;
  final Color? color;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = languageNames[ref.watch(languageProvider)]!;
    final tooltip = context.l10n.languageChangeTo;
    if (!showName) {
      return IconButton(
        tooltip: tooltip,
        onPressed: () => showLanguageSheet(context, ref),
        icon: Icon(Icons.language, color: color),
      );
    }
    return Tooltip(
      message: tooltip,
      child: TextButton.icon(
        onPressed: () => showLanguageSheet(context, ref),
        icon: Icon(Icons.language, size: 18, color: color),
        label: Text(name),
        style: TextButton.styleFrom(foregroundColor: color),
      ),
    );
  }
}
