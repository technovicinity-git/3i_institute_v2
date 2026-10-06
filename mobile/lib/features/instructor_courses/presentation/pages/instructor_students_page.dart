import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../profiles/presentation/widgets/learner_avatar.dart';
import '../../domain/entities/instructor_student.dart';
import '../providers/instructor_courses_providers.dart';
import '../widgets/course_action_strip.dart';

const _navy = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _faint = Color(0xFF94A3B8);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _blue = Color(0xFF2563EB);
const _purple = Color(0xFF7C3AED);
const _gold = Color(0xFFB8912F);

class InstructorStudentsPage extends ConsumerStatefulWidget {
  const InstructorStudentsPage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<InstructorStudentsPage> createState() =>
      _InstructorStudentsPageState();
}

class _InstructorStudentsPageState
    extends ConsumerState<InstructorStudentsPage> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(instructorCourseStudentsProvider(widget.courseId));
    final course = ref
        .watch(instructorCoursesProvider)
        .asData
        ?.value
        .where((c) => c.id == widget.courseId)
        .firstOrNull;
    final data = result.asData?.value;
    final students = data?.students ?? const <InstructorStudent>[];
    final query = _search.text.trim().toLowerCase();
    final filtered = students
        .where((s) => s.displayName.toLowerCase().contains(query))
        .toList();
    final isOnline = course?.type == 'ONLINE_CLASS';
    final isRegular = course?.type == 'REGULAR';

    return RefreshIndicator(
      onRefresh: () =>
          ref.refresh(instructorCourseStudentsProvider(widget.courseId).future),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: () => context.go('/instructor/courses'),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to courses'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          if (course != null) CourseActionStrip(course: course),
          const Text(
            'Enrolled Students',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          Text(
            '${data?.total ?? 0} students enrolled in '
            '${data?.courseTitle ?? 'this course'}',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
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
                  onPressed: () => ref.invalidate(
                    instructorCourseStudentsProvider(widget.courseId),
                  ),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (data) => [
              if (students.isEmpty)
                const _Message(
                  icon: Icons.people_outline,
                  text: 'No students enrolled yet.',
                )
              else ...[
                _Summary(total: data.total, students: students),
                const SizedBox(height: 14),
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
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                if (filtered.isEmpty)
                  const _Message(
                    icon: Icons.search,
                    text: 'No students match your search.',
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
                          _StudentRow(
                            student: filtered[i],
                            showBatch: isOnline,
                            showProgress: isRegular,
                          ),
                        ],
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.total, required this.students});
  final int total;
  final List<InstructorStudent> students;

  @override
  Widget build(BuildContext context) {
    final avg =
        students.fold<int>(0, (sum, s) => sum + s.progress) / students.length;
    final tiles = [
      (Icons.people_outline, _blue, '$total', 'Total Students'),
      (Icons.trending_up, _green, '${avg.round()}%', 'Avg Progress'),
      (
        Icons.workspace_premium_outlined,
        _gold,
        '${students.where((s) => s.progress == 100).length}',
        'Completed',
      ),
      (
        Icons.menu_book_outlined,
        _purple,
        '${students.where((s) => s.batchName != null).length}',
        'In Batches',
      ),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 2.3,
      children: [
        for (final (icon, color, value, label) in tiles)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: _border),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: .1),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(icon, size: 20, color: color),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        value,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: _navy,
                        ),
                      ),
                      Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, color: _muted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _StudentRow extends StatelessWidget {
  const _StudentRow({
    required this.student,
    required this.showBatch,
    required this.showProgress,
  });
  final InstructorStudent student;
  final bool showBatch, showProgress;

  @override
  Widget build(BuildContext context) {
    final enrolled = student.enrolledAt;
    final average = student.examAverage;
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
                    Text(
                      '${student.examAttempts} exam attempt(s)',
                      style: const TextStyle(fontSize: 12, color: _muted),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    average == null ? '—' : '${_num(average)}%',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: average == null
                          ? _faint
                          : average >= 50
                          ? _green
                          : Colors.red,
                    ),
                  ),
                  const Text(
                    'Exam avg',
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
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _Meta(
                Icons.event_outlined,
                enrolled == null
                    ? 'Enrolled —'
                    : 'Enrolled ${DateFormat('MMM d, y').format(enrolled)}',
              ),
              _Meta(Icons.cake_outlined, 'Age ${_age(student.dateOfBirth)}'),
              if (showBatch)
                student.batchName == null
                    ? const _Meta(Icons.groups_outlined, 'No batch')
                    : Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: _purple.withValues(alpha: .1),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          student.batchName!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: _purple,
                          ),
                        ),
                      ),
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
        Icon(icon, size: 42, color: const Color(0xFFCBD5E1)),
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

String _num(num value) => value == value.roundToDouble()
    ? '${value.toInt()}'
    : value.toStringAsFixed(1);
