import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../../profiles/presentation/widgets/learner_avatar.dart';
import '../../../notifications/presentation/widgets/notification_bell.dart';
import '../../../../core/l10n/l10n.dart';

class LandingLayout extends ConsumerWidget {
  const LandingLayout({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final account = ref.watch(authControllerProvider).asData?.value;
    final isInstructor = account?.role == 'Instructor';
    // Instructors browse as themselves, never as a learner profile.
    final profile = isInstructor
        ? null
        : ref.watch(activeLearnerProfileProvider);
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 1,
        titleSpacing: 20,
        title: InkWell(
          onTap: () => context.go('/courses'),
          child: Image.asset(
            'assets/images/logo-icon.png',
            width: 42,
            height: 42,
            semanticLabel: context.l10n.landingHomeLabel,
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: () => context.go('/courses'),
            icon: const Icon(Icons.menu_book_outlined, size: 19),
            label: Text(context.l10n.menuCourses),
          ),
          if (account != null)
            NotificationBell(
              notificationsRoute: isInstructor
                  ? '/instructor/notifications'
                  : '/notifications',
            ),
          PopupMenuButton<String>(
            tooltip: context.l10n.landingAccountMenu,
            onSelected: (value) async {
              if (value == 'switch') {
                ref.read(activeLearnerProfileProvider.notifier).select(null);
                context.go('/profiles');
              } else if (value == 'dashboard') {
                context.go(
                  isInstructor ? '/instructor/dashboard' : '/dashboard',
                );
              } else if (value == 'my-courses') {
                context.go('/my-courses');
              } else if (value == 'subscription') {
                context.push('/subscription');
              } else if (value == 'logout') {
                ref.read(activeLearnerProfileProvider.notifier).select(null);
                try {
                  await ref.read(authControllerProvider.notifier).logout();
                } catch (_) {
                  // The auth controller clears its local session on failure too.
                }
                if (context.mounted) {
                  context.go(isInstructor ? '/instructor/login' : '/login');
                }
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile?.displayName ??
                          (account == null || account.fullName.isEmpty
                              ? context.l10n.landingAccount
                              : account.fullName),
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF12304E),
                      ),
                    ),
                    if (account?.email.isNotEmpty == true)
                      Text(
                        account!.email,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    if (isInstructor)
                      Container(
                        margin: const EdgeInsets.only(top: 6),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0x1A22A146),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'INSTRUCTOR',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF22A146),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              PopupMenuItem(value: 'dashboard', child: Text(context.l10n.menuDashboard)),
              if (!isInstructor) ...[
                PopupMenuItem(value: 'my-courses', child: Text(context.l10n.menuMyCourses)),
                PopupMenuItem(
                  value: 'subscription',
                  child: Text(context.l10n.menuSubscription),
                ),
                PopupMenuItem(
                  value: 'switch',
                  child: Text(context.l10n.menuSwitchLearner),
                ),
              ],
              PopupMenuItem(value: 'logout', child: Text(context.l10n.menuLogOut)),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: LearnerAvatar(
                imageUrl: profile?.avatarUrl ?? account?.avatarUrl,
                initials:
                    profile?.initials ??
                    (account?.firstName.isNotEmpty == true
                        ? account!.firstName.substring(0, 1).toUpperCase()
                        : 'U'),
                radius: 17,
                backgroundColor: const Color(0xFF12304E),
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE3E8EF)),
        ),
      ),
      body: child,
    );
  }
}

class LandingFooter extends StatelessWidget {
  const LandingFooter({super.key});

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    color: const Color(0xFF12304E),
    padding: const EdgeInsets.fromLTRB(24, 36, 24, 20),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.asset(
          'assets/images/logo-icon.png',
          width: 58,
          height: 58,
          semanticLabel: context.l10n.commonLogoLabel,
        ),
        const SizedBox(height: 10),
        Text(
          context.l10n.footerTagline,
          style: TextStyle(color: Color(0xFFB8912F), fontFamily: 'serif'),
        ),
        const SizedBox(height: 8),
        Text(
          context.l10n.footerAbout,
          style: TextStyle(color: Color(0xFFCBD5E1), height: 1.5, fontSize: 13),
        ),
        const SizedBox(height: 28),
        const Divider(color: Color(0xFF2B4560)),
        const SizedBox(height: 10),
        Text(
          context.l10n.footerRights('${DateTime.now().year}'),
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
        ),
      ],
    ),
  );
}
