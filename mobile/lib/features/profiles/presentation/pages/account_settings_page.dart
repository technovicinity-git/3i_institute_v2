import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AccountSettingsPage extends StatelessWidget {
  const AccountSettingsPage({super.key});

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.fromLTRB(20, 28, 20, 36),
    children: [
      Text(
        'Account settings',
        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
          color: const Color(0xff12304e),
          fontFamily: 'serif',
        ),
      ),
      const SizedBox(height: 20),
      _SettingRow(
        icon: Icons.people_outline,
        title: 'Family & profiles',
        description: 'Manage learner profiles, PINs, and seats',
        onTap: () => context.push('/profile-management'),
      ),
      _SettingRow(
        icon: Icons.devices_outlined,
        title: 'Devices',
        description: 'Device management is available on the website',
        disabled: true,
      ),
      _SettingRow(
        icon: Icons.credit_card_outlined,
        title: 'Subscription & billing',
        description: 'View your plan and invoices on the website',
        disabled: true,
      ),
      _SettingRow(
        icon: Icons.lock_outline,
        title: 'Login & security',
        description: 'Update your email and password',
        onTap: () => context.push('/login-security'),
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
