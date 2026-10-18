import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/format/date_format.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';

/// Whether a learner can use their courses. After the subscription ends there
/// is a short grace period of full access; then lessons, live classes,
/// assignments and chat lock. Exams, results and certificates stay open.
/// Mirrors `LearningAccess` in the API (seat/service.ts).
class LearningAccess {
  const LearningAccess({
    required this.status,
    required this.hasAccess,
    required this.graceEndsAt,
  });

  /// SUBSCRIBED, GRACE, EXPIRED or NONE.
  final String status;
  final bool hasAccess;
  final DateTime? graceEndsAt;

  bool get locked => !hasAccess;

  factory LearningAccess.fromJson(Map<String, dynamic> json) => LearningAccess(
    status: json['status'] as String? ?? 'NONE',
    hasAccess: json['hasAccess'] == true,
    graceEndsAt: DateTime.tryParse('${json['graceEndsAt']}')?.toLocal(),
  );
}

/// Access of a learner profile, keyed by profile id.
final learningAccessProvider = FutureProvider.autoDispose
    .family<LearningAccess, String>((ref, profileId) async {
      final response = await ref
          .watch(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/seats/access/$profileId');
      final data = response.data?['data'];
      return LearningAccess.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : const {},
      );
    });

/// The active learner's access, or null while unknown.
LearningAccess? watchActiveLearningAccess(WidgetRef ref) {
  final profile = ref.watch(activeLearnerProfileProvider);
  if (profile == null) return null;
  return ref.watch(learningAccessProvider(profile.id)).asData?.value;
}

/// Shown above every learner screen once the subscription has ended.
class SubscriptionAccessBanner extends ConsumerWidget {
  const SubscriptionAccessBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    final access = watchActiveLearningAccess(ref);
    if (profile == null || access == null || access.status == 'SUBSCRIBED') {
      return const SizedBox.shrink();
    }
    final l10n = context.l10n;
    final grace = access.status == 'GRACE';
    final none = access.status == 'NONE';
    final tint = grace ? const Color(0xFFB45309) : const Color(0xFFB91C1C);
    return Material(
      color: grace ? const Color(0xFFFFFBEB) : const Color(0xFFFEF2F2),
      child: SafeArea(
        bottom: false,
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
          child: Row(
            children: [
              Icon(
                grace ? Icons.warning_amber_rounded : Icons.lock_outline,
                color: tint,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      none
                          ? l10n.accessNoneTitle(profile.displayName)
                          : l10n.accessEndedTitle(profile.displayName),
                      style: TextStyle(
                        color: tint,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      grace
                          ? l10n.accessGraceBody(formatDate(access.graceEndsAt))
                          : none
                          ? l10n.accessNoneBody
                          : l10n.accessExpiredBody,
                      style: TextStyle(color: tint, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () => context.go('/subscription'),
                style: TextButton.styleFrom(foregroundColor: tint),
                child: Text(none ? l10n.accessSubscribe : l10n.accessRenew),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Takes the place of the lesson player when lessons are locked.
class LessonLockedCard extends StatelessWidget {
  const LessonLockedCard({required this.learnerName, super.key});
  final String learnerName;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE3E8EF)),
      ),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 28,
            backgroundColor: Color(0xFFFEF2F2),
            child: Icon(Icons.lock_outline, color: Color(0xFFDC2626), size: 28),
          ),
          const SizedBox(height: 14),
          Text(
            l10n.accessLessonLockedTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0C1F33),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            l10n.accessLessonLockedBody(learnerName),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () => context.go('/subscription'),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF22A146),
            ),
            child: Text(l10n.accessRenew),
          ),
        ],
      ),
    );
  }
}
