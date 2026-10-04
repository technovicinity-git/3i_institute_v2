import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';

class LandingLayout extends ConsumerWidget {
  const LandingLayout({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final account = ref.watch(authControllerProvider).asData?.value;
    final profile = ref.watch(activeLearnerProfileProvider);
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 1,
        titleSpacing: 20,
        title: InkWell(
          onTap: () => context.go('/courses'),
          child: const Text('3i', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w800, color: Color(0xFF12304E))),
        ),
        actions: [
          TextButton.icon(
            onPressed: () => context.go('/courses'),
            icon: const Icon(Icons.menu_book_outlined, size: 19),
            label: const Text('Courses'),
          ),
          PopupMenuButton<String>(
            tooltip: 'Account and learner menu',
            onSelected: (value) async {
              if (value == 'switch') {
                ref.read(activeLearnerProfileProvider.notifier).select(null);
                context.go('/profiles');
              } else if (value == 'logout') {
                ref.read(activeLearnerProfileProvider.notifier).select(null);
                try {
                  await ref.read(authControllerProvider.notifier).logout();
                } catch (_) {
                  // The auth controller clears its local session on failure too.
                }
                if (context.mounted) context.go('/login');
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(profile?.displayName ?? account?.firstName ?? 'Account', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF12304E))),
                    if (account?.email.isNotEmpty == true)
                      Text(account!.email, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                  ],
                ),
              ),
              const PopupMenuItem(value: 'switch', child: Text('Switch learner profile')),
              const PopupMenuItem(value: 'logout', child: Text('Log out')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: CircleAvatar(
                radius: 17,
                backgroundColor: const Color(0xFF12304E),
                child: Text(
                  (profile?.initials ?? (account?.firstName.isNotEmpty == true ? account!.firstName.substring(0, 1).toUpperCase() : 'U')),
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                ),
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
            const Text('3i', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            const Text('Rigorous teaching. Global classrooms. One institute.', style: TextStyle(color: Color(0xFFB8912F), fontFamily: 'serif')),
            const SizedBox(height: 8),
            const Text(
              'Structured, accredited programs across the sciences, humanities, and professional fields, taught to students in 40 countries.',
              style: TextStyle(color: Color(0xFFCBD5E1), height: 1.5, fontSize: 13),
            ),
            const SizedBox(height: 28),
            const Divider(color: Color(0xFF2B4560)),
            const SizedBox(height: 10),
            Text(
              '© ${DateTime.now().year} 3i International Islamic Institute. All rights reserved.',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
          ],
        ),
      );
}
