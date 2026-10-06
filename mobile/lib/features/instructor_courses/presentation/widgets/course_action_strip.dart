import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entities/instructor_course.dart';

class CourseActionStrip extends StatelessWidget {
  const CourseActionStrip({required this.course, super.key});
  final InstructorCourse course;
  @override
  Widget build(BuildContext context) {
    final id = course.id;
    final items = <(String, IconData, String)>[
      ('Details', Icons.edit_outlined, '/instructor/courses/$id/edit'),
      if (course.type == 'REGULAR')
        (
          'Materials',
          Icons.video_library_outlined,
          '/instructor/courses/$id/materials',
        ),
      if (course.type == 'ONLINE_CLASS')
        (
          'Batches',
          Icons.calendar_month_outlined,
          '/instructor/courses/$id/batches',
        ),
      ('Questions', Icons.help_outline, '/instructor/courses/$id/questions'),
      ('Exams', Icons.description_outlined, '/instructor/courses/$id/exams'),
      ('Students', Icons.people_outline, '/instructor/courses/$id/students'),
      if (course.type == 'ONLINE_CLASS')
        (
          'Assignments',
          Icons.assignment_outlined,
          '/instructor/courses/$id/assignments',
        ),
      ('View Course', Icons.visibility_outlined, '/courses/$id'),
    ];
    return SizedBox(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(right: 7),
              child: ActionChip(
                avatar: Icon(item.$2, size: 16),
                label: Text(item.$1),
                onPressed: () => context.go(item.$3),
              ),
            ),
        ],
      ),
    );
  }
}
