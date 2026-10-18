import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/language_picker.dart';

class AccountSettingsPage extends ConsumerWidget {
  const AccountSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => ListView(
    padding: const EdgeInsets.fromLTRB(20, 28, 20, 36),
    children: [
      Text(
        context.l10n.settingsTitle,
        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
          color: const Color(0xff12304e),
          fontFamily: 'serif',
        ),
      ),
      const SizedBox(height: 20),
      _SettingRow(
        icon: Icons.people_outline,
        title: context.l10n.settingsFamilyTitle,
        description: context.l10n.settingsFamilyBody,
        onTap: () => context.push('/profile-management'),
      ),
      _SettingRow(
        icon: Icons.devices_outlined,
        title: context.l10n.settingsDevicesTitle,
        description: context.l10n.settingsDevicesBody,
        disabled: true,
      ),
      _SettingRow(
        icon: Icons.credit_card_outlined,
        title: context.l10n.settingsSubscriptionTitle,
        description: context.l10n.settingsSubscriptionBody,
        onTap: () => context.push('/subscription'),
      ),
      _SettingRow(
        icon: Icons.lock_outline,
        title: context.l10n.settingsSecurityTitle,
        description: context.l10n.settingsSecurityBody,
        onTap: () => context.push('/login-security'),
      ),
      _SettingRow(
        icon: Icons.translate,
        title: context.l10n.languageLabel,
        description:
            '${languageNames[ref.watch(languageProvider)]} · '
            '${context.l10n.languageSettingBody}',
        onTap: () => showLanguageSheet(context, ref),
      ),
    ],
  );
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({
    required this.icon,
    required this.title,
    required this.description,
    this.onTap,
    this.disabled = false,
  });
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback? onTap;
  final bool disabled;

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    child: ListTile(
      enabled: !disabled,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: CircleAvatar(
        backgroundColor: const Color(0xfff9f6f0),
        child: Icon(icon, color: const Color(0xff12304e)),
      ),
      title: Text(
        title,
        style: const TextStyle(fontFamily: 'serif', color: Color(0xff12304e)),
      ),
      subtitle: Text(description),
      trailing: disabled ? null : const Icon(Icons.chevron_right),
      onTap: onTap,
    ),
  );
}
