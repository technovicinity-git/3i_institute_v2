import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';
import '../widgets/learner_avatar.dart';
import '../widgets/pin_entry_sheet.dart';

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
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 36),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 780),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
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
      final verified = await showPinEntrySheet(
        context,
        profile: profile,
        verify: (pin) => _verifyPin(ref, profile.id, pin),
      );
      if (verified != true || !context.mounted) return;
    }
    ref.read(activeLearnerProfileProvider.notifier).select(profile);
    if (context.mounted) context.go('/courses');
  }
}

Future<PinCheckResult> _verifyPin(
  WidgetRef ref,
  String profileId,
  String pin,
) async {
  try {
    final response = await ref
        .read(apiClientProvider)
        .dio
        .post<Map<String, dynamic>>(
          '/learners/$profileId/verify-pin',
          data: {'pin': pin},
        );
    final data = response.data?['data'];
    return data is Map && data['valid'] == false
        ? PinCheckResult.incorrect
        : PinCheckResult.valid;
  } on DioException catch (error) {
    final status = error.response?.statusCode;
    // The API answers a wrong PIN with a 4xx validation error.
    return status != null && status >= 400 && status < 500
        ? PinCheckResult.incorrect
        : PinCheckResult.failed;
  } catch (_) {
    return PinCheckResult.failed;
  }
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
