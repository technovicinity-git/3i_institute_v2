import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/learning_models.dart';
import '../learning_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);

class OnlineClassesPage extends ConsumerStatefulWidget {
  const OnlineClassesPage({super.key});
  @override
  ConsumerState<OnlineClassesPage> createState() => _OnlineClassesPageState();
}

class _OnlineClassesPageState extends ConsumerState<OnlineClassesPage> {
  final _search = TextEditingController();
  String _query = '';
  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view your live classes.'),
      );
    }
    final classesAsync = ref.watch(enrolledCoursesProvider(profile.id));
    return classesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _EmptyState(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load online classes',
        action: TextButton(
          onPressed: () => ref.invalidate(enrolledCoursesProvider(profile.id)),
          child: const Text('Try again'),
        ),
      ),
      data: (allCourses) {
        final classes = allCourses
            .where((c) => c.type == 'ONLINE_CLASS')
            .toList(growable: false);
        final filtered = classes
            .where(
              (c) => '${c.title} ${c.instructorName}'.toLowerCase().contains(
                _query.trim().toLowerCase(),
              ),
            )
            .toList(growable: false);
        return RefreshIndicator(
          color: _navy,
          onRefresh: () =>
              ref.refresh(enrolledCoursesProvider(profile.id).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
            children: [
              Text(
                'Online Classes',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: const Color(0xFF0C1F33),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${classes.length} live course${classes.length == 1 ? '' : 's'}',
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              if (classes.isNotEmpty) ...[
                const SizedBox(height: 20),
                TextField(
                  controller: _search,
                  onChanged: (v) => setState(() => _query = v),
                  decoration: InputDecoration(
                    hintText: 'Search by course or instructor...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              if (classes.isEmpty)
                _EmptyState(
                  icon: Icons.video_library_outlined,
                  title: 'No live classes yet',
                  description: 'Browse the course catalogue to find a class.',
                  action: FilledButton(
                    onPressed: () => context.go('/courses'),
                    child: const Text('Browse courses'),
                  ),
                )
              else if (filtered.isEmpty)
                _EmptyState(
                  icon: Icons.search_off,
                  title: 'No matching classes',
                  description: 'Try another course or instructor name.',
                )
              else
                ...filtered.map((course) => _OnlineClassCard(course: course)),
            ],
          ),
        );
      },
    );
  }
}

class _OnlineClassCard extends ConsumerWidget {
  const _OnlineClassCard({required this.course});
  final EnrolledCourse course;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionAsync = ref.watch(
      nextLiveSessionProvider(course.batchId ?? ''),
    );
    final nextSession = sessionAsync.asData?.value;
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 14),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: SizedBox(
                    width: 96,
                    height: 78,
                    child:
                        course.thumbnailUrl == null ||
                            course.thumbnailUrl!.isEmpty
                        ? const ColoredBox(
                            color: _navy,
                            child: Icon(
                              Icons.menu_book,
                              color: Colors.white70,
                              size: 32,
                            ),
                          )
                        : Image.network(
                            course.thumbnailUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => const ColoredBox(
                              color: _navy,
                              child: Icon(
                                Icons.menu_book,
                                color: Colors.white70,
                                size: 32,
                              ),
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 5,
                        children: [
                          _Badge(text: _level(course.level)),
                          const _Badge(text: 'LIVE', live: true),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 17,
                          color: Color(0xFF0C1F33),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        course.instructorName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (sessionAsync.isLoading)
              const LinearProgressIndicator(minHeight: 2, color: _green)
            else if (nextSession != null)
              Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: _gold,
                      size: 19,
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nextSession.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFF0C1F33),
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            _formatDateTime(nextSession.scheduledAt),
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else if (course.nextSession != null)
              Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: _gold,
                      size: 19,
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            course.nextSession!.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFF0C1F33),
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            _formatDateTime(course.nextSession!.scheduledAt),
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 6),
                child: Text(
                  'No upcoming session',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                ),
              ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: () => context.push('/courses/${course.courseId}'),
                  icon: const Icon(Icons.open_in_new, size: 17),
                  label: const Text('Details'),
                ),
                OutlinedButton.icon(
                  onPressed: () => context.push(
                    '/my-courses/${course.courseId}/exams?online=true',
                  ),
                  icon: const Icon(Icons.quiz_outlined, size: 17),
                  label: const Text('Exams'),
                ),
                if (nextSession?.meetingLink != null &&
                    nextSession!.meetingLink!.isNotEmpty)
                  FilledButton.icon(
                    onPressed: () =>
                        _openMeeting(context, nextSession.meetingLink!),
                    icon: const Icon(Icons.video_call_outlined, size: 18),
                    label: const Text('Join class'),
                    style: FilledButton.styleFrom(backgroundColor: _green),
                  ),
                FilledButton.icon(
                  onPressed: () => context.push(
                    Uri(
                      path: '/chat',
                      queryParameters: {
                        'courseId': course.courseId,
                        'courseTitle': course.title,
                        if (course.batchId?.isNotEmpty == true)
                          'batchId': course.batchId!,
                        'batchName': course.batchName ?? 'Batch',
                      },
                    ).toString(),
                  ),
                  icon: const Icon(Icons.chat_bubble_outline, size: 18),
                  label: const Text('Chat'),
                  style: FilledButton.styleFrom(backgroundColor: _navy),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openMeeting(BuildContext context, String link) async {
    final uri = Uri.tryParse(link);
    if (uri != null &&
        await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      return;
    }
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the meeting link.')),
      );
    }
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, this.live = false});
  final String text;
  final bool live;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: live ? const Color(0xFF7C3AED) : Colors.white,
      borderRadius: BorderRadius.circular(5),
      border: live ? null : Border.all(color: const Color(0xFFE3E8EF)),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w700,
        color: live ? Colors.white : const Color(0xFF0C1F33),
      ),
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    this.description,
    this.action,
  });
  final IconData icon;
  final String title;
  final String? description;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 26),
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, color: const Color(0xFF94A3B8), size: 38),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _navy, fontWeight: FontWeight.w600),
        ),
        if (description != null) ...[
          const SizedBox(height: 6),
          Text(
            description!,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
        ],
        if (action != null) ...[const SizedBox(height: 10), action!],
      ],
    ),
  );
}

String _level(String value) => switch (value.toLowerCase()) {
  '1' || 'beginner' => 'BEGINNER',
  '2' || 'intermediate' => 'INTERMEDIATE',
  '3' || 'advanced' => 'ADVANCED',
  _ => 'ALL LEVELS',
};
String _formatDateTime(String value) {
  final date = DateTime.tryParse(value)?.toLocal();
  if (date == null) return 'Date to be announced';
  return '${DateFormat('EEE, MMM d').format(date)} • ${DateFormat('h:mm a').format(date)}';
}
