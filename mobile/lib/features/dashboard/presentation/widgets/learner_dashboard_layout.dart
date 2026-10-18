import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/l10n/language_picker.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../../profiles/presentation/widgets/learner_avatar.dart';
import '../../../notifications/presentation/widgets/notification_bell.dart';

class LearnerDashboardLayout extends ConsumerWidget {
  const LearnerDashboardLayout({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) => LayoutBuilder(
    builder: (context, constraints) {
      final wide = constraints.maxWidth >= 1000;
      if (wide) {
        return Scaffold(
          backgroundColor: const Color(0xFFFBF9F4),
          body: Row(
            children: [
              const SizedBox(width: 260, child: DashboardSidebar()),
              Expanded(
                child: Scaffold(
                  backgroundColor: const Color(0xFFFBF9F4),
                  appBar: _dashboardAppBar(context, ref),
                  body: child,
                ),
              ),
            ],
          ),
        );
      }

      return Scaffold(
        backgroundColor: const Color(0xFFFBF9F4),
        appBar: _dashboardAppBar(context, ref, showMenu: true),
        drawer: const Drawer(child: DashboardSidebar()),
        body: child,
      );
    },
  );

  PreferredSizeWidget _dashboardAppBar(
    BuildContext context,
    WidgetRef ref, {
    bool showMenu = false,
  }) {
    final learner = ref.watch(activeLearnerProfileProvider);
    final account = ref.watch(authControllerProvider).asData?.value;
    final l10n = context.l10n;
    final name = learner?.displayName ?? account?.firstName ?? l10n.commonLearner;

    return AppBar(
      toolbarHeight: 72,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      titleSpacing: showMenu ? 0 : 24,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            l10n.dashboardGreeting(name),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 18,
              color: Color(0xFF12304E),
            ),
          ),
          Text(
            l10n.dashboardWelcomeBack,
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
        ],
      ),
      actions: [
        const LanguageButton(color: Color(0xFF12304E)),
        IconButton(
          tooltip: l10n.dashboardSearchCourses,
          onPressed: () => context.go('/courses'),
          icon: const Icon(Icons.search, color: Color(0xFF12304E)),
        ),
        const NotificationBell(notificationsRoute: '/notifications'),
        PopupMenuButton<String>(
          tooltip: l10n.menuLearnerProfile,
          onSelected: (value) {
            if (value == 'switch') {
              ref.read(activeLearnerProfileProvider.notifier).select(null);
              context.go('/profiles');
            } else if (value == 'courses') {
              context.go('/courses');
            } else if (value == 'online-classes') {
              context.go('/online-classes');
            } else if (value == 'help') {
              context.push('/help');
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem<String>(
              enabled: false,
              child: Row(
                children: [
                  LearnerAvatar(
                    imageUrl: learner?.avatarUrl,
                    initials: learner?.initials ?? 'L',
                    radius: 19,
                    backgroundColor: const Color(0xFF12304E),
                    foregroundColor: Colors.white,
                  ),
                  const SizedBox(width: 10),
                  Flexible(child: Text(name, overflow: TextOverflow.ellipsis)),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'switch',
              child: Text(l10n.menuSwitchLearner),
            ),
            PopupMenuItem(value: 'courses', child: Text(l10n.menuCourses)),
            PopupMenuItem(
              value: 'online-classes',
              child: Text(l10n.navOnlineClasses),
            ),
            PopupMenuItem(value: 'help', child: Text(l10n.menuHelp)),
          ],
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: LearnerAvatar(
              imageUrl: learner?.avatarUrl,
              initials:
                  learner?.initials ??
                  (account?.firstName.isNotEmpty == true
                      ? account!.firstName.substring(0, 1).toUpperCase()
                      : 'U'),
              radius: 18,
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
    );
  }
}

class DashboardSidebar extends StatelessWidget {
  const DashboardSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final items = <_DashboardNavItem>[
      _DashboardNavItem(
        l10n.navDashboard,
        Icons.dashboard_outlined,
        '/dashboard',
      ),
      _DashboardNavItem(
        l10n.navRegularCourses,
        Icons.menu_book_outlined,
        '/my-courses',
      ),
      _DashboardNavItem(
        l10n.navOnlineClasses,
        Icons.video_library_outlined,
        '/online-classes',
      ),
      _DashboardNavItem(
        l10n.navAssignments,
        Icons.assignment_outlined,
        '/assignments',
      ),
      _DashboardNavItem(l10n.navExams, Icons.description_outlined, '/exams'),
      _DashboardNavItem(
        l10n.navCertificates,
        Icons.workspace_premium_outlined,
        '/certificates',
      ),
      _DashboardNavItem(l10n.navWishlist, Icons.favorite_border, '/wishlist'),
    ];
    final currentLocation = GoRouterState.of(context).uri.path;
    return ColoredBox(
      color: const Color(0xFF12304E),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 20, 16, 30),
              child: Row(
                children: [
                  Image.asset(
                    'assets/images/logo-icon.png',
                    width: 38,
                    height: 38,
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    '3i INSTITUTE',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: .5,
                    ),
                  ),
                ],
              ),
            ),
            for (final item in items)
              _DashboardNavigationTile(
                item: item,
                selected:
                    item.route != null &&
                    (currentLocation == item.route ||
                        currentLocation.startsWith('${item.route}/')),
              ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(20),
              child: TextButton.icon(
                onPressed: () {
                  Scaffold.maybeOf(context)?.closeDrawer();
                  context.go('/courses');
                },
                icon: const Icon(Icons.explore_outlined),
                label: Text(l10n.dashboardExploreCourses),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  alignment: Alignment.centerLeft,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardNavItem {
  const _DashboardNavItem(this.label, this.icon, this.route);
  final String label;
  final IconData icon;
  final String? route;
}

class _DashboardNavigationTile extends StatelessWidget {
  const _DashboardNavigationTile({required this.item, required this.selected});
  final _DashboardNavItem item;
  final bool selected;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
    child: ListTile(
      enabled: item.route != null,
      selected: selected,
      selectedTileColor: Colors.white.withValues(alpha: .08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
      leading: Icon(item.icon, size: 20),
      title: Text(item.label, style: const TextStyle(fontSize: 13)),
      textColor: Colors.white.withValues(alpha: item.route == null ? .42 : .76),
      iconColor: Colors.white.withValues(alpha: item.route == null ? .42 : .76),
      selectedColor: Colors.white,
      onTap: item.route == null
          ? null
          : () {
              Scaffold.maybeOf(context)?.closeDrawer();
              context.go(item.route!);
            },
      dense: true,
    ),
  );
}
