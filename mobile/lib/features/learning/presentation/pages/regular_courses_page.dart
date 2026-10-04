import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../learning_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class RegularCoursesPage extends ConsumerStatefulWidget {
  const RegularCoursesPage({super.key});
  @override
  ConsumerState<RegularCoursesPage> createState() => _RegularCoursesPageState();
}

class _RegularCoursesPageState extends ConsumerState<RegularCoursesPage> {
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
        child: Text('Select a learner profile to view courses.'),
      );
    }
    final coursesAsync = ref.watch(enrolledCoursesProvider(profile.id));
    return coursesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _MessageState(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load your courses',
        action: TextButton(
          onPressed: () => ref.invalidate(enrolledCoursesProvider(profile.id)),
          child: const Text('Try again'),
        ),
      ),
      data: (allCourses) {
        final courses = allCourses
            .where((c) => c.type == 'REGULAR')
            .toList(growable: false);
        final filtered = courses
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
                'Regular Courses',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: const Color(0xFF0C1F33),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${courses.length} self-paced course${courses.length == 1 ? '' : 's'}',
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              if (courses.isNotEmpty) ...[
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
              if (courses.isEmpty)
                _MessageState(
                  icon: Icons.menu_book_outlined,
                  title: 'No regular courses yet',
                  description:
                      'Browse the course catalogue to find your next lesson.',
                  action: FilledButton(
                    onPressed: () => context.go('/courses'),
                    child: const Text('Browse courses'),
                  ),
                )
              else if (filtered.isEmpty)
                _MessageState(
                  icon: Icons.search_off,
                  title: 'No matching courses',
                  description: 'Try a different course or instructor name.',
                )
              else
                ...filtered.map(
                  (course) => Card(
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
                                          errorBuilder: (_, _, _) =>
                                              const ColoredBox(
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
                                        if (course.isCompleted)
                                          const _Badge(
                                            text: 'COMPLETED',
                                            green: true,
                                          ),
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
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Text(
                                '${course.completedMaterials}/${course.totalMaterials} lessons',
                                style: const TextStyle(
                                  color: _green,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '${course.progress}%',
                                style: const TextStyle(
                                  color: Color(0xFF0C1F33),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 7),
                          LinearProgressIndicator(
                            value: (course.progress / 100).clamp(0, 1),
                            minHeight: 6,
                            borderRadius: BorderRadius.circular(99),
                            backgroundColor: const Color(0xFFF1F3F5),
                            color: _green,
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton.icon(
                              onPressed: course.continueLessonId == null
                                  ? null
                                  : () => context.push(
                                      '/my-courses/${course.courseId}/lessons/${course.continueLessonId}',
                                    ),
                              icon: Icon(
                                course.progress > 0
                                    ? Icons.play_arrow
                                    : Icons.school_outlined,
                              ),
                              label: Text(
                                course.continueLessonId == null
                                    ? 'No lessons available'
                                    : course.progress > 0
                                    ? 'Resume learning'
                                    : 'Start learning',
                              ),
                              style: FilledButton.styleFrom(
                                backgroundColor: _navy,
                                disabledBackgroundColor: const Color(
                                  0xFFE2E8F0,
                                ),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 13,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

String _level(String value) => switch (value.toLowerCase()) {
  '1' || 'beginner' => 'BEGINNER',
  '2' || 'intermediate' => 'INTERMEDIATE',
  '3' || 'advanced' => 'ADVANCED',
  _ => 'ALL LEVELS',
};

class _Badge extends StatelessWidget {
  const _Badge({required this.text, this.green = false});
  final String text;
  final bool green;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: green ? _green : Colors.white,
      borderRadius: BorderRadius.circular(5),
      border: green ? null : Border.all(color: const Color(0xFFE3E8EF)),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w700,
        color: green ? Colors.white : const Color(0xFF0C1F33),
      ),
    ),
  );
}

class _MessageState extends StatelessWidget {
  const _MessageState({
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
          style: const TextStyle(
            color: Color(0xFF12304E),
            fontWeight: FontWeight.w600,
          ),
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
