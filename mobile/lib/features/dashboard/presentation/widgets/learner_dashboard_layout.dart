import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../../profiles/presentation/widgets/learner_avatar.dart';

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
    final name = learner?.displayName ?? account?.firstName ?? 'Learner';

    return AppBar(
      toolbarHeight: 72,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      titleSpacing: showMenu ? 0 : 24,
      title: Row(
        children: [
          if (showMenu)
            Builder(
              builder: (context) => IconButton(
                tooltip: 'Open navigation menu',
                onPressed: () => Scaffold.of(context).openDrawer(),
                icon: const Icon(Icons.menu, color: Color(0xFF12304E)),
              ),
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Assalamu alaikum, $name',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'serif',
                    fontSize: 18,
                    color: Color(0xFF12304E),
                  ),
                ),
                const Text(
                  'Welcome back to your dashboard',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          tooltip: 'Search courses',
          onPressed: () => context.go('/courses'),
          icon: const Icon(Icons.search, color: Color(0xFF12304E)),
        ),
        IconButton(
          tooltip: 'Notifications',
          onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('You’re all caught up.')),
          ),
          icon: const Badge(
            smallSize: 8,
            backgroundColor: Color(0xFF22A146),
            child: Icon(Icons.notifications_none, color: Color(0xFF12304E)),
          ),
        ),
        PopupMenuButton<String>(
          tooltip: 'Learner profile',
          onSelected: (value) {
            if (value == 'switch') {
              ref.read(activeLearnerProfileProvider.notifier).select(null);
              context.go('/profiles');
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
            const PopupMenuItem(
              value: 'switch',
              child: Text('Switch learner profile'),
            ),
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

  static const _items = <_DashboardNavItem>[
    _DashboardNavItem('Dashboard', Icons.dashboard_outlined, '/dashboard'),
    _DashboardNavItem('My Courses', Icons.menu_book_outlined, null),
    _DashboardNavItem('Online Classes', Icons.video_library_outlined, null),
    _DashboardNavItem('Assignments', Icons.assignment_outlined, null),
    _DashboardNavItem('Exams', Icons.description_outlined, null),
    _DashboardNavItem('Certificates', Icons.workspace_premium_outlined, null),
    _DashboardNavItem('Wishlist', Icons.favorite_border, null),
  ];

  @override
  Widget build(BuildContext context) {
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
            for (final item in _items)
              _DashboardNavigationTile(
                item: item,
                selected: currentLocation == item.route,
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
                label: const Text('Explore courses'),
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
