import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';
import '../widgets/learner_avatar.dart';

class ProfileSelectionPage extends ConsumerWidget {
  const ProfileSelectionPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profiles = ref.watch(learnerProfilesProvider);
    return profiles.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Could not load learner profiles.'),
            TextButton(
              onPressed: () => ref.invalidate(learnerProfilesProvider),
              child: const Text('Try again'),
            ),
          ],
        ),
      ),
      data: (items) => SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 780),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'International Islamic Institute',
                    style: TextStyle(
                      color: Color(0xFFB8912F),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Who’s learning today?',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontFamily: 'serif',
                      color: const Color(0xFF12304E),
                    ),
                  ),
                  const SizedBox(height: 26),
                  if (items.isEmpty)
                    const Text(
                      'Add a learner profile to get started.',
                      textAlign: TextAlign.center,
                    ),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 14,
                    runSpacing: 14,
                    children: [
                      for (final profile in items)
                        SizedBox(
                          width: 156,
                          height: 180,
                          child: Card(
                            color: Colors.white,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () =>
                                  _selectProfile(context, ref, profile),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  LearnerAvatar(
                                    imageUrl: profile.avatarUrl,
                                    initials: profile.initials,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    profile.displayName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    _ageLabel(profile.dateOfBirth),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                  if (!profile.isActive)
                                    const Text(
                                      'No seat',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.deepOrange,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      SizedBox(
                        width: 156,
                        height: 180,
                        child: Card(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => context.push('/profiles/add'),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.add_circle_outline,
                                  size: 42,
                                  color: Color(0xFF64748B),
                                ),
                                SizedBox(height: 10),
                                Text(
                                  'Add learner',
                                  style: TextStyle(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextButton.icon(
                    onPressed: () async {
                      ref
                          .read(activeLearnerProfileProvider.notifier)
                          .select(null);
                      try {
                        await ref
                            .read(authControllerProvider.notifier)
                            .logout();
                      } catch (_) {}
                      if (context.mounted) context.go('/login');
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Log out'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectProfile(
    BuildContext context,
    WidgetRef ref,
    LearnerProfile profile,
  ) async {
    if (profile.hasPin) {
      final pin = await showDialog<String>(
        context: context,
        builder: (context) => _PinDialog(profile: profile),
      );
      if (pin == null || !context.mounted) return;
      try {
        final response = await ref
            .read(apiClientProvider)
            .dio
            .post<Map<String, dynamic>>(
              '/learners/${profile.id}/verify-pin',
              data: {'pin': pin},
            );
        if (response.data?['data'] is Map &&
            (response.data!['data'] as Map)['valid'] != true) {
          throw Exception('Invalid PIN');
        }
      } catch (_) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('The PIN is incorrect.')),
          );
        }
        return;
      }
    }
    ref.read(activeLearnerProfileProvider.notifier).select(profile);
    if (context.mounted) context.go('/courses');
  }
}

class _PinDialog extends StatefulWidget {
  const _PinDialog({required this.profile});
  final LearnerProfile profile;
  @override
  State<_PinDialog> createState() => _PinDialogState();
}

class _PinDialogState extends State<_PinDialog> {
  final _controller = TextEditingController();
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Column(
      children: [
        LearnerAvatar(
          imageUrl: widget.profile.avatarUrl,
          initials: widget.profile.initials,
          radius: 30,
        ),
        const SizedBox(height: 12),
        Text('Enter ${widget.profile.displayName}’s PIN'),
      ],
    ),
    content: TextField(
      controller: _controller,
      autofocus: true,
      obscureText: true,
      keyboardType: TextInputType.number,
      maxLength: 4,
      decoration: const InputDecoration(
        labelText: '4-digit PIN',
        counterText: '',
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      FilledButton(
        onPressed: () => _controller.text.length == 4
            ? Navigator.pop(context, _controller.text)
            : null,
        child: const Text('Continue'),
      ),
    ],
  );
}

String _ageLabel(String dateOfBirth) {
  final date = DateTime.tryParse(dateOfBirth);
  if (date == null) return 'Learner';
  final now = DateTime.now();
  var age = now.year - date.year;
  if (now.month < date.month ||
      (now.month == date.month && now.day < date.day)) {
    age--;
  }
  if (age >= 18) return 'Adult';
  if (age >= 13) return 'Ages 13–17';
  if (age >= 9) return 'Ages 9–12';
  if (age >= 6) return 'Ages 6–8';
  return 'Ages 5 and under';
}
