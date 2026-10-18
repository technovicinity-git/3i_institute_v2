import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../../core/network/api_error_message.dart';

class DeleteLearnerPage extends ConsumerStatefulWidget {
  const DeleteLearnerPage({required this.profileId, super.key});
  final String profileId;

  @override
  ConsumerState<DeleteLearnerPage> createState() => _DeleteLearnerPageState();
}

class _DeleteLearnerPageState extends ConsumerState<DeleteLearnerPage> {
  LearnerProfile? _profile;
  final _confirmation = TextEditingController();
  bool _loading = true;
  bool _deleting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _confirmation.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/learners/${widget.profileId}');
      final data = response.data?['data'];
      if (data is Map<String, dynamic>) {
        _profile = LearnerProfile.fromJson(data);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _delete() async {
    final profile = _profile;
    if (profile == null ||
        _confirmation.text.trim().toLowerCase() !=
            profile.displayName.trim().toLowerCase()) {
      return;
    }
    setState(() => _deleting = true);
    try {
      await ref.read(apiClientProvider).dio.delete('/learners/${profile.id}');
      ref.invalidate(learnerProfilesProvider);
      final active = ref.read(activeLearnerProfileProvider);
      if (active?.id == profile.id) {
        ref.read(activeLearnerProfileProvider.notifier).select(null);
      }
      if (mounted) context.go('/profiles');
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(error, fallback: context.l10n.deleteFailed))),
        );
      }
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = _profile;
    final confirmed =
        profile != null &&
        _confirmation.text.trim().toLowerCase() ==
            profile.displayName.trim().toLowerCase();
    return Scaffold(
      backgroundColor: const Color(0xfffbf9f4),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : profile == null
          ? Center(child: Text(context.l10n.learnerNotFound))
          : Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            context.l10n.deleteTitle(profile.displayName),
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(
                                  fontFamily: 'serif',
                                  color: const Color(0xff12304e),
                                ),
                          ),
                          const SizedBox(height: 22),
                          Text(
                            context.l10n.deleteDestroyed,
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            context.l10n.deleteDestroyedItems,
                          ),
                          const Divider(height: 30),
                          Text(
                            context.l10n.deleteSurvives,
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 6),
                          Text(context.l10n.deleteSurvivesItems),
                          const SizedBox(height: 22),
                          TextField(
                            controller: _confirmation,
                            onChanged: (_) => setState(() {}),
                            decoration: InputDecoration(
                              labelText:
                                  context.l10n.deleteTypeName(profile.displayName),
                              border: const OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 18),
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: Colors.red.shade700,
                            ),
                            onPressed: !confirmed || _deleting ? null : _delete,
                            child: Text(
                              _deleting ? context.l10n.deleteDeleting : context.l10n.deleteConfirm,
                            ),
                          ),
                          TextButton(
                            onPressed: () => context.go('/profile-management'),
                            child: Text(context.l10n.deleteGoBack),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}
