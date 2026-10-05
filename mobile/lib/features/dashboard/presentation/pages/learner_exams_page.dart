import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../learning/presentation/learning_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';

const _navy = Color(0xFF12304E);

class LearnerExamsPage extends ConsumerWidget {
  const LearnerExamsPage({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view exams.'),
      );
    }
    final key = profile.id;
    final coursesAsync = ref.watch(enrolledCoursesProvider(key));
    return coursesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _CoursePickerState(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load your courses',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(enrolledCoursesProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (courses) => RefreshIndicator(
        color: _navy,
        onRefresh: () => ref.refresh(enrolledCoursesProvider(key).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          children: [
            Text(
              'Exams',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontFamily: 'serif',
                color: const Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Select a course to view and take its exams.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
            if (courses.isEmpty)
              _CoursePickerState(
                icon: Icons.menu_book_outlined,
                title: 'No courses enrolled yet',
                message: 'Browse courses and enroll to see course exams here.',
                action: FilledButton.icon(
                  onPressed: () => context.go('/courses'),
                  icon: const Icon(Icons.explore_outlined),
                  label: const Text('Browse courses'),
                  style: FilledButton.styleFrom(backgroundColor: _navy),
                ),
              )
            else
              ...courses.map(
                (course) => _CourseChoice(
                  title: course.title,
                  instructor: course.instructorName,
                  icon: Icons.description_outlined,
                  online: course.type == 'ONLINE_CLASS',
                  onTap: () => context.push(
                    '/my-courses/${course.courseId}/exams${course.type == 'ONLINE_CLASS' ? '?online=true' : ''}',
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _CourseChoice extends StatelessWidget {
  const _CourseChoice({
    required this.title,
    required this.instructor,
    required this.icon,
    required this.online,
    required this.onTap,
  });
  final String title, instructor;
  final IconData icon;
  final bool online;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
    color: Colors.white,
    margin: const EdgeInsets.only(bottom: 11),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(13),
      side: const BorderSide(color: Color(0xFFE3E8EF)),
    ),
    child: ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      leading: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: const Color(0xFFF9F6F0),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: const Color(0xFFB8912F), size: 21),
      ),
      title: Text(
        title,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Color(0xFF0C1F33),
        ),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Text(
          '$instructor${online ? ' • Online class' : ''}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
        ),
      ),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFF64748B)),
    ),
  );
}

class _CoursePickerState extends StatelessWidget {
  const _CoursePickerState({
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title, message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 15),
    padding: const EdgeInsets.all(25),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 40, color: const Color(0xFFCBD5E1)),
        const SizedBox(height: 11),
        Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        if (action != null) ...[const SizedBox(height: 13), action!],
      ],
    ),
  );
}
