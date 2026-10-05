import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/learner_profiles_providers.dart';
import '../widgets/learner_avatar.dart';

class ProfileManagementPage extends ConsumerWidget {
  const ProfileManagementPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profiles = ref.watch(learnerProfilesProvider);
    return Scaffold(
      backgroundColor: const Color(0xfffbf9f4),
      body: profiles.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Failed to load profiles'),
              TextButton(
                onPressed: () => ref.invalidate(learnerProfilesProvider),
                child: const Text('Try again'),
              ),
            ],
          ),
        ),
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Your learner’s profiles',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontFamily: 'serif',
                      color: const Color(0xff12304e),
                    ),
                  ),
                ),
                FilledButton(
                  onPressed: () => context.push('/profiles/add'),
                  child: const Text('Add profile'),
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (items.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No learner profiles yet. Add a profile to get started.',
                ),
              ),
            for (final profile in items)
              Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          LearnerAvatar(
                            imageUrl: profile.avatarUrl,
                            initials: profile.initials,
                            radius: 26,
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  profile.displayName,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  !profile.isActive && profile.hasSeat
                                      ? 'Cancelled'
                                      : !profile.isActive
                                      ? 'Never activated'
                                      : 'Active',
                                  style: TextStyle(
                                    color: !profile.isActive
                                        ? Colors.blueGrey
                                        : const Color(0xff287a50),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () =>
                                context.push('/profiles/${profile.id}/edit'),
                            icon: const Icon(Icons.edit_outlined),
                            label: const Text('Edit'),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => context.push(
                              '/profiles/${profile.id}/edit?action=reset-pin',
                            ),
                            icon: const Icon(Icons.pin_outlined),
                            label: Text(
                              profile.hasPin ? 'Reset PIN' : 'Set PIN',
                            ),
                          ),
                          TextButton.icon(
                            onPressed: () => context.push(
                              '/delete-profile?profileId=${profile.id}',
                            ),
                            icon: const Icon(
                              Icons.delete_outline,
                              color: Colors.red,
                            ),
                            label: const Text(
                              'Delete',
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
