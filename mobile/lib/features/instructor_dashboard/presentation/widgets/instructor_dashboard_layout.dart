import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';

class InstructorDashboardLayout extends ConsumerWidget {
  const InstructorDashboardLayout({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) => LayoutBuilder(
    builder: (context, constraints) {
      if (constraints.maxWidth >= 1000) {
        return Scaffold(
          backgroundColor: const Color(0xFFFBF9F4),
          body: Row(
            children: [
              const SizedBox(width: 260, child: InstructorSidebar()),
              Expanded(
                child: Scaffold(
                  backgroundColor: const Color(0xFFFBF9F4),
                  appBar: _appBar(context, ref),
                  body: child,
                ),
              ),
            ],
          ),
        );
      }
      return Scaffold(
        backgroundColor: const Color(0xFFFBF9F4),
        appBar: _appBar(context, ref, showMenu: true),
        drawer: const Drawer(child: InstructorSidebar()),
        body: child,
      );
    },
  );

  PreferredSizeWidget _appBar(
    BuildContext context,
    WidgetRef ref, {
    bool showMenu = false,
  }) {
    final account = ref.watch(authControllerProvider).asData?.value;
    final name = [
      account?.firstName,
      account?.lastName,
    ].whereType<String>().where((part) => part.isNotEmpty).join(' ');
    return AppBar(
      toolbarHeight: 72,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      titleSpacing: showMenu ? 0 : 24,
      title: const Text(
        'Instructor Portal',
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: Color(0xFF12304E),
        ),
      ),
      actions: [
        IconButton(
          tooltip: 'Notifications',
          onPressed: () => context.go('/instructor/notifications'),
          icon: const Icon(Icons.notifications_none, color: Color(0xFF12304E)),
        ),
        PopupMenuButton<String>(
          tooltip: 'Account menu',
          onSelected: (value) async {
            if (value == 'dashboard') context.go('/instructor/dashboard');
            if (value == 'courses') context.go('/instructor/courses');
            if (value == 'settings') context.go('/instructor/settings');
            if (value == 'logout') {
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) context.go('/instructor/login');
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              enabled: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name.isEmpty ? 'Instructor' : name,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  if (account?.email.isNotEmpty == true)
                    Text(
                      account!.email,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                ],
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(value: 'dashboard', child: Text('Dashboard')),
            const PopupMenuItem(value: 'courses', child: Text('My Courses')),
            const PopupMenuItem(value: 'settings', child: Text('Settings')),
            const PopupMenuItem(value: 'logout', child: Text('Log out')),
          ],
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFF12304E),
              child: Text(
                name.isEmpty ? 'I' : name[0].toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
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

class InstructorSidebar extends StatelessWidget {
  const InstructorSidebar({super.key});
  static const items = <(String, IconData, String)>[
    ('Dashboard', Icons.dashboard_outlined, '/instructor/dashboard'),
    ('My Courses', Icons.menu_book_outlined, '/instructor/courses'),
    ('Live Classes', Icons.video_library_outlined, '/instructor/live-classes'),
    ('Questions', Icons.quiz_outlined, '/instructor/questions'),
    (
      'Certificates',
      Icons.workspace_premium_outlined,
      '/instructor/certificates',
    ),
    ('Students', Icons.people_outline, '/instructor/students'),
    ('Notifications', Icons.notifications_none, '/instructor/notifications'),
    ('Settings', Icons.settings_outlined, '/instructor/settings'),
  ];

  @override
  Widget build(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
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
                    'INSTRUCTOR',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: .5,
                    ),
                  ),
                ],
              ),
            ),
            for (final item in items)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 2,
                ),
                child: ListTile(
                  selected: path == item.$3 || path.startsWith('${item.$3}/'),
                  selectedTileColor: Colors.white.withValues(alpha: .08),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(9),
                  ),
                  leading: Icon(item.$2, size: 20),
                  title: Text(item.$1, style: const TextStyle(fontSize: 13)),
                  textColor: Colors.white.withValues(alpha: .76),
                  iconColor: Colors.white.withValues(alpha: .76),
                  selectedColor: Colors.white,
                  dense: true,
                  onTap: () {
                    Scaffold.maybeOf(context)?.closeDrawer();
                    context.go(item.$3);
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
