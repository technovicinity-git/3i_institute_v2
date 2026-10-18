import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../profiles/presentation/widgets/learner_avatar.dart';
import '../../domain/entities/instructor_student.dart';
import '../providers/instructor_courses_providers.dart';
import '../../../../core/format/date_format.dart';

const _navy = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _faint = Color(0xFF94A3B8);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);

/// Students enrolled across all of the instructor's courses. Progress is
/// hidden for online class courses (no materials) and attendance for
/// regular courses (no live classes).
class InstructorAllStudentsPage extends ConsumerStatefulWidget {
  const InstructorAllStudentsPage({super.key});
  @override
  ConsumerState<InstructorAllStudentsPage> createState() =>
      _InstructorAllStudentsPageState();
}

class _InstructorAllStudentsPageState
    extends ConsumerState<InstructorAllStudentsPage> {
  final _search = TextEditingController();
  String _courseId = 'all';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(instructorAllStudentsProvider);
    final courses =
        ref.watch(instructorCoursesProvider).asData?.value ?? const [];
    final students =
        result.asData?.value ?? const <InstructorEnrolledStudent>[];
    final query = _search.text.trim().toLowerCase();
    final filtered = students
        .where(
          (s) =>
              s.displayName.toLowerCase().contains(query) &&
              (_courseId == 'all' || s.courseId == _courseId),
        )
        .toList();
    final inputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: _border),
    );

    return RefreshIndicator(
      onRefresh: () => ref.refresh(instructorAllStudentsProvider.future),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Students',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          Text(
            '${students.length} students enrolled in your courses',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search students...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _search.text.isEmpty
                  ? null
                  : IconButton(
                      tooltip: 'Clear search',
                      icon: const Icon(Icons.close),
                      onPressed: () => setState(_search.clear),
                    ),
              filled: true,
              fillColor: Colors.white,
              isDense: true,
              border: inputBorder,
              enabledBorder: inputBorder,
            ),
          ),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(
            initialValue: _courseId,
            isExpanded: true,
            onChanged: (value) => setState(() => _courseId = value ?? 'all'),
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.filter_list),
              filled: true,
              fillColor: Colors.white,
              isDense: true,
              border: inputBorder,
              enabledBorder: inputBorder,
            ),
            items: [
              const DropdownMenuItem(value: 'all', child: Text('All Courses')),
              for (final course in courses)
                DropdownMenuItem(
                  value: course.id,
                  child: Text(course.title, overflow: TextOverflow.ellipsis),
                ),
            ],
          ),
          const SizedBox(height: 12),
          ...result.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                icon: Icons.error_outline,
                text: 'Could not load students.',
                action: TextButton(
                  onPressed: () =>
                      ref.invalidate(instructorAllStudentsProvider),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (filtered.isEmpty)
                const _Message(
                  icon: Icons.people_outline,
                  text: 'No students found.',
                )
              else
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: _border),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Column(
                    children: [
                      for (var i = 0; i < filtered.length; i++) ...[
                        if (i > 0) const Divider(height: 1, color: _border),
                        _StudentRow(student: filtered[i]),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StudentRow extends StatelessWidget {
  const _StudentRow({required this.student});
  final InstructorEnrolledStudent student;

  @override
  Widget build(BuildContext context) {
    final enrolled = student.enrolledAt;
    final showProgress = student.courseType != 'ONLINE_CLASS';
    final showAttendance = student.courseType != 'REGULAR';
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              LearnerAvatar(
                initials: _initials(student.displayName),
                imageUrl: student.avatarUrl,
                radius: 20,
                backgroundColor: const Color(0xFFF9F6F0),
                foregroundColor: _gold,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      student.displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: _navy,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(
                          Icons.menu_book_outlined,
                          size: 13,
                          color: _muted,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            student.courseTitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12, color: _muted),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (showAttendance)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${student.attendanceRate}%',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: _navy,
                      ),
                    ),
                    const Text(
                      'Attendance',
                      style: TextStyle(fontSize: 10, color: _muted),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              _Meta(
                Icons.event_outlined,
                enrolled == null
                    ? 'Enrolled —'
                    : 'Enrolled ${formatDate(enrolled, DateStyle.date, 'en')}',
              ),
              _Meta(Icons.cake_outlined, 'Age ${_age(student.dateOfBirth)}'),
            ],
          ),
          if (showProgress) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: student.progress / 100,
                      minHeight: 6,
                      color: _green,
                      backgroundColor: const Color(0xFFF1F5F9),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  '${student.progress}%',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _navy,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.text);
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 15, color: _muted),
      const SizedBox(width: 4),
      Text(text, style: const TextStyle(fontSize: 12, color: _muted)),
    ],
  );
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, this.action});
  final IconData icon;
  final String text;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: _faint),
        const SizedBox(height: 10),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _muted),
        ),
        ?action,
      ],
    ),
  );
}

String _initials(String name) => name
    .split(' ')
    .where((part) => part.isNotEmpty)
    .take(2)
    .map((part) => part[0].toUpperCase())
    .join();

String _age(DateTime? dob) {
  if (dob == null) return '—';
  final today = DateTime.now();
  var age = today.year - dob.year;
  if (today.month < dob.month ||
      (today.month == dob.month && today.day < dob.day)) {
    age--;
  }
  return '$age';
}
