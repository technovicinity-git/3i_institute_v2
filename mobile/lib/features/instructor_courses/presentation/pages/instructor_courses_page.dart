import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entities/instructor_course.dart';
import '../providers/instructor_courses_providers.dart';

class InstructorCoursesPage extends ConsumerStatefulWidget {
  const InstructorCoursesPage({super.key});
  @override
  ConsumerState<InstructorCoursesPage> createState() =>
      _InstructorCoursesPageState();
}

class _InstructorCoursesPageState extends ConsumerState<InstructorCoursesPage> {
  final _search = TextEditingController();
  String? _type, _status;
  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final courses = ref.watch(instructorCoursesProvider);
    return courses.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _message(
        'Failed to load courses',
        retry: () => ref.invalidate(instructorCoursesProvider),
      ),
      data: (all) {
        final query = _search.text.trim().toLowerCase();
        final shown = all
            .where(
              (course) =>
                  (query.isEmpty ||
                      course.title.toLowerCase().contains(query) ||
                      course.summary.toLowerCase().contains(query)) &&
                  (_type == null || _type == course.type) &&
                  (_status == null || _status == course.status),
            )
            .toList();
        return RefreshIndicator(
          onRefresh: () => ref.refresh(instructorCoursesProvider.future),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(18),
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'My Courses',
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontSize: 28,
                        color: Color(0xFF0C1F33),
                      ),
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: () => context.push('/instructor/courses/create'),
                    icon: const Icon(Icons.add),
                    label: const Text('Create'),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${shown.length} of ${all.length} courses',
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              if (all.isNotEmpty) ...[
                const SizedBox(height: 16),
                TextField(
                  controller: _search,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: 'Search courses...',
                    suffixIcon: _search.text.isEmpty
                        ? null
                        : IconButton(
                            onPressed: () {
                              _search.clear();
                              setState(() {});
                            },
                            icon: const Icon(Icons.close),
                          ),
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String?>(
                        initialValue: _type,
                        decoration: const InputDecoration(
                          labelText: 'Type',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: null,
                            child: Text('All types'),
                          ),
                          DropdownMenuItem(
                            value: 'REGULAR',
                            child: Text('Regular'),
                          ),
                          DropdownMenuItem(
                            value: 'ONLINE_CLASS',
                            child: Text('Online class'),
                          ),
                        ],
                        onChanged: (value) => setState(() => _type = value),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String?>(
                        initialValue: _status,
                        decoration: const InputDecoration(
                          labelText: 'Status',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: null,
                            child: Text('All statuses'),
                          ),
                          DropdownMenuItem(
                            value: 'PUBLISHED',
                            child: Text('Published'),
                          ),
                          DropdownMenuItem(
                            value: 'DRAFT',
                            child: Text('Draft'),
                          ),
                          DropdownMenuItem(
                            value: 'PENDING_REVIEW',
                            child: Text('Pending'),
                          ),
                          DropdownMenuItem(
                            value: 'SUSPENDED',
                            child: Text('Suspended'),
                          ),
                          DropdownMenuItem(
                            value: 'ARCHIVED',
                            child: Text('Archived'),
                          ),
                          DropdownMenuItem(
                            value: 'REJECTED',
                            child: Text('Rejected'),
                          ),
                        ],
                        onChanged: (value) => setState(() => _status = value),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              if (all.isEmpty)
                _empty(
                  context,
                  'You haven’t created any courses yet.',
                  action: 'Create your first course',
                  onTap: () => context.push('/instructor/courses/create'),
                )
              else if (shown.isEmpty)
                _empty(
                  context,
                  'No courses match your filters.',
                  action: 'Clear filters',
                  onTap: () {
                    _search.clear();
                    setState(() {
                      _type = null;
                      _status = null;
                    });
                  },
                )
              else
                for (final course in shown)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _CourseCard(course: course),
                  ),
            ],
          ),
        );
      },
    );
  }

  Widget _message(String text, {VoidCallback? retry}) => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(text),
        if (retry != null)
          TextButton(onPressed: retry, child: const Text('Try again')),
      ],
    ),
  );
  Widget _empty(
    BuildContext context,
    String text, {
    required String action,
    required VoidCallback onTap,
  }) => Container(
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: const Color(0xFFE3E8EF)),
    ),
    child: Column(
      children: [
        const Icon(
          Icons.menu_book_outlined,
          size: 42,
          color: Color(0xFFB8912F),
        ),
        const SizedBox(height: 10),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Color(0xFF64748B)),
        ),
        TextButton(onPressed: onTap, child: Text(action)),
      ],
    ),
  );
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course});
  final InstructorCourse course;
  Color get statusColor => switch (course.status) {
    'PUBLISHED' => const Color(0xFF22A146),
    'PENDING_REVIEW' => const Color(0xFFB8912F),
    'SUSPENDED' || 'REJECTED' => Colors.red,
    _ => const Color(0xFF64748B),
  };
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(13),
      border: Border.all(color: const Color(0xFFE3E8EF)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: SizedBox(
                width: 94,
                height: 72,
                child: course.thumbnailUrl == null
                    ? const ColoredBox(
                        color: Color(0xFF12304E),
                        child: Icon(
                          Icons.menu_book_outlined,
                          color: Colors.white,
                        ),
                      )
                    : Image.network(
                        course.thumbnailUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => const ColoredBox(
                          color: Color(0xFF12304E),
                          child: Icon(
                            Icons.menu_book_outlined,
                            color: Colors.white,
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: .1),
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Text(
                      course.status.replaceAll('_', ' '),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0C1F33),
                    ),
                  ),
                  Text(
                    course.summary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 14,
          runSpacing: 6,
          children: [
            Text(
              '${course.studentCount} students',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
            Text(
              '${course.totalLessons} lessons',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
            Text(
              course.type.replaceAll('_', ' '),
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
        const Divider(height: 18),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () =>
                context.push('/instructor/courses/${course.id}/edit'),
            icon: const Icon(Icons.edit_outlined),
            label: const Text('Edit course'),
          ),
        ),
      ],
    ),
  );
}
