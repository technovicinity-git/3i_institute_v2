import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../learning/presentation/learning_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';

class LearnerAssignmentsPage extends ConsumerWidget {
  const LearnerAssignmentsPage({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view assignments.'),
      );
    }
    final key = profile.id;
    final coursesAsync = ref.watch(enrolledCoursesProvider(key));
    return coursesAsync.when(
      loading: () => const Center(
        child: CircularProgressIndicator(color: Color(0xFF12304E)),
      ),
      error: (error, _) => _AssignmentsState(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load your courses',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(enrolledCoursesProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (courses) => RefreshIndicator(
        color: const Color(0xFF12304E),
        onRefresh: () => ref.refresh(enrolledCoursesProvider(key).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          children: [
            Text(
              'Assignments',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontFamily: 'serif',
                color: const Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Select a course to view its assignments.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
            if (courses.isEmpty)
              _AssignmentsState(
                icon: Icons.menu_book_outlined,
                title: 'No courses enrolled yet',
                message: 'Browse courses and enroll to see assignments here.',
                action: FilledButton.icon(
                  onPressed: () => context.go('/courses'),
                  icon: const Icon(Icons.explore_outlined),
                  label: const Text('Browse courses'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF12304E),
                  ),
                ),
              )
            else
              ...courses.map(
                (course) => _AssignmentCourseChoice(
                  title: course.title,
                  instructor: course.instructorName,
                  online: course.type == 'ONLINE_CLASS',
                  onTap: () => context.push(
                    '/my-courses/${course.courseId}/assignments',
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AssignmentCourseChoice extends StatelessWidget {
  const _AssignmentCourseChoice({
    required this.title,
    required this.instructor,
    required this.online,
    required this.onTap,
  });
  final String title, instructor;
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
        child: const Icon(Icons.assignment_outlined, color: Color(0xFFB8912F)),
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

class _AssignmentsState extends StatelessWidget {
  const _AssignmentsState({
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
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
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
