import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
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
          semanticLabel: context.l10n.commonLogoLabel,
        ),
      ),
      actions: [
        PopupMenuButton<String>(
          tooltip: context.l10n.menuAccount,
          onSelected: (value) async {
            switch (value) {
              case 'profiles':
                context.go('/profiles');
                break;
              case 'manage':
                context.push('/profile-management');
                break;
              case 'subscription':
                context.push('/subscription');
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
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'profiles',
              child: Text(context.l10n.menuSwitchLearner),
            ),
            PopupMenuItem(
              value: 'manage',
              child: Text(context.l10n.menuFamily),
            ),
            PopupMenuItem(
              value: 'subscription',
              child: Text(context.l10n.menuSubscription),
            ),
            PopupMenuItem(
              value: 'settings',
              child: Text(context.l10n.menuManageAccount),
            ),
            PopupMenuItem(
              value: 'logout',
              child: Text(context.l10n.menuLogOut),
            ),
          ],
        ),
      ],
    ),
    body: child,
  );
}
