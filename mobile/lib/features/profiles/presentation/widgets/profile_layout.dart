import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';

class ProfileLayout extends ConsumerWidget {
  const ProfileLayout({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) => Scaffold(
    appBar: AppBar(
      backgroundColor: Colors.white,
      title: InkWell(
        onTap: () => context.go('/profiles'),
        child: Image.asset(
          'assets/images/logo-icon.png',
          width: 42,
          height: 42,
          semanticLabel: '3i International Islamic Institute logo',
        ),
      ),
      actions: [
        PopupMenuButton<String>(
          tooltip: 'Account menu',
          onSelected: (value) async {
            switch (value) {
              case 'profiles':
                context.go('/profiles');
                break;
              case 'manage':
                context.push('/profile-management');
                break;
              case 'settings':
                context.push('/account-settings');
                break;
              case 'logout':
                ref.read(activeLearnerProfileProvider.notifier).select(null);
                await ref.read(authControllerProvider.notifier).logout();
                if (context.mounted) context.go('/login');
            }
          },
          itemBuilder: (_) => const [
            PopupMenuItem(
              value: 'profiles',
              child: Text('Switch learner profile'),
            ),
            PopupMenuItem(value: 'manage', child: Text('Family & profiles')),
            PopupMenuItem(value: 'settings', child: Text('Manage account')),
            PopupMenuItem(value: 'logout', child: Text('Log out')),
          ],
        ),
      ],
    ),
    body: child,
  );
}
