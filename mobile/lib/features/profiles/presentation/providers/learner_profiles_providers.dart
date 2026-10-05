import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';

class LearnerProfile {
  const LearnerProfile({
    required this.id,
    required this.displayName,
    required this.dateOfBirth,
    required this.avatarUrl,
    required this.isActive,
    required this.hasPin,
    this.nameLocked = false,
    this.hasSeat = false,
  });

  final String id;
  final String displayName;
  final String dateOfBirth;
  final String? avatarUrl;
  final bool isActive;
  final bool hasPin;
  final bool nameLocked;
  final bool hasSeat;

  String get initials => displayName
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .take(2)
      .map((part) => part[0])
      .join()
      .toUpperCase();

  factory LearnerProfile.fromJson(Map<String, dynamic> json) => LearnerProfile(
    id: json['id'] as String? ?? '',
    displayName: json['displayName'] as String? ?? 'Learner',
    dateOfBirth: json['dateOfBirth'] as String? ?? '',
    avatarUrl: json['avatarUrl'] as String?,
    isActive: json['isActive'] as bool? ?? false,
    hasPin: json['hasPin'] as bool? ?? false,
    nameLocked: json['nameLocked'] as bool? ?? false,
    hasSeat: json['hasSeat'] as bool? ?? false,
  );
}

final learnerProfilesProvider = FutureProvider<List<LearnerProfile>>((
  ref,
) async {
  final response = await ref
      .watch(apiClientProvider)
      .dio
      .get<Map<String, dynamic>>('/learners');
  final data = response.data?['data'];
  if (data is! List) return const [];
  return data
      .whereType<Map<String, dynamic>>()
      .map(LearnerProfile.fromJson)
      .toList(growable: false);
});

final activeLearnerProfileProvider =
    NotifierProvider<ActiveLearnerProfile, LearnerProfile?>(
      ActiveLearnerProfile.new,
    );

class ActiveLearnerProfile extends Notifier<LearnerProfile?> {
  @override
  LearnerProfile? build() => null;

  void select(LearnerProfile? profile) => state = profile;
}
