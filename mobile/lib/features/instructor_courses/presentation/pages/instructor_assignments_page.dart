import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../domain/entities/instructor_course.dart';
import '../providers/instructor_courses_providers.dart';

class InstructorAssignmentsPage extends ConsumerWidget {
  const InstructorAssignmentsPage({required this.courseId, super.key});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(instructorCoursesProvider);
    final assignments = ref.watch(instructorAssignmentsProvider(courseId));
    final course = courses.asData?.value
        .where((c) => c.id == courseId)
        .firstOrNull;
    return assignments.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _Retry(
        onRetry: () => ref.invalidate(instructorAssignmentsProvider(courseId)),
      ),
      data: (items) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: () => context.go('/instructor/courses'),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to courses'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          if (course != null) _CourseActionStrip(course: course),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Assignments',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 27,
                    color: Color(0xFF0C1F33),
                  ),
                ),
              ),
              IconButton.filled(
                onPressed: () => context.push(
                  '/instructor/courses/$courseId/assignments/create',
                ),
                icon: const Icon(Icons.add),
                tooltip: 'Create assignment',
              ),
            ],
          ),
          Text(
            '${items.length} assignments for this course',
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          if (items.isEmpty)
            const _EmptyAssignments()
          else
            ...items.map(
              (item) => Card(
                color: Colors.white,
                child: ListTile(
                  onTap: () => context.push(
                    '/instructor/courses/$courseId/assignments/${item.id}',
                  ),
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFF9F6F0),
                    child: Icon(
                      Icons.description_outlined,
                      color: Color(0xFFB8912F),
                    ),
                  ),
                  title: Text(
                    item.title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    '${item.status} · Due ${_date(item.dueDate)} · ${item.submissionCount} submissions · ${item.totalMarks} marks${item.batchName == null ? '' : ' · ${item.batchName}'}',
                    maxLines: 3,
                  ),
                  trailing: const Icon(Icons.chevron_right),
                ),
              ),
            ),
        ],
      ),
    );
  }

  static String _date(String? value) {
    final date = DateTime.tryParse(value ?? '');
    return date == null
        ? 'No deadline'
        : DateFormat('MMM d, yyyy').format(date.toLocal());
  }
}

class InstructorAssignmentCreatePage extends ConsumerStatefulWidget {
  const InstructorAssignmentCreatePage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<InstructorAssignmentCreatePage> createState() =>
      _InstructorAssignmentCreatePageState();
}

class _InstructorAssignmentCreatePageState
    extends ConsumerState<InstructorAssignmentCreatePage> {
  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _marks = TextEditingController(text: '100');
  String? _batch;
  DateTime? _dueDate;
  bool _saving = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _marks.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final courses = ref.watch(instructorCoursesProvider);
    final batches = ref.watch(instructorBatchesProvider(widget.courseId));
    final course = courses.asData?.value
        .where((c) => c.id == widget.courseId)
        .firstOrNull;
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        TextButton.icon(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.chevron_left),
          label: const Text('Back to assignments'),
          style: TextButton.styleFrom(alignment: Alignment.centerLeft),
        ),
        if (course != null) _CourseActionStrip(course: course),
        const Text(
          'Create Assignment',
          style: TextStyle(
            fontFamily: 'serif',
            fontSize: 27,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 16),
        Form(
          key: _form,
          child: Column(
            children: [
              TextFormField(
                controller: _title,
                maxLength: 255,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Title is required' : null,
                decoration: const InputDecoration(
                  labelText: 'Title *',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _description,
                minLines: 4,
                maxLines: 7,
                validator: (v) => v == null || v.trim().length < 10
                    ? 'Description must be at least 10 characters'
                    : null,
                decoration: const InputDecoration(
                  labelText: 'Description *',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 14),
              batches.when(
                loading: () => const LinearProgressIndicator(),
                error: (_, _) => const Text('Could not load batches'),
                data: (list) => DropdownButtonFormField<String?>(
                  initialValue: _batch,
                  decoration: const InputDecoration(
                    labelText: 'Batch',
                    helperText: 'Leave as All batches to allow every batch.',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: null,
                      child: Text('All batches'),
                    ),
                    for (final b in list)
                      DropdownMenuItem(value: b.id, child: Text(b.name)),
                  ],
                  onChanged: (v) => setState(() => _batch = v),
                ),
              ),
              const SizedBox(height: 14),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Due Date'),
                subtitle: Text(
                  _dueDate == null
                      ? 'No deadline'
                      : DateFormat('MMM d, yyyy').format(_dueDate!),
                ),
                trailing: IconButton(
                  onPressed: _selectDate,
                  icon: const Icon(Icons.calendar_month),
                ),
                onTap: _selectDate,
              ),
              TextFormField(
                controller: _marks,
                keyboardType: TextInputType.number,
                validator: (v) {
                  final n = int.tryParse(v ?? '');
                  return n == null || n < 1 || n > 1000
                      ? 'Enter a value from 1 to 1000'
                      : null;
                },
                decoration: const InputDecoration(
                  labelText: 'Total Marks *',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? 'Creating…' : 'Create Assignment'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 3650)),
    );
    if (date != null) setState(() => _dueDate = date);
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(instructorCoursesRepositoryProvider).createAssignment({
        'courseId': widget.courseId,
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'dueDate': _dueDate == null
            ? null
            : DateFormat('yyyy-MM-dd').format(_dueDate!),
        'totalMarks': int.parse(_marks.text),
        'batchId': _batch,
      });
      ref.invalidate(instructorAssignmentsProvider(widget.courseId));
      if (mounted) {
        context.go('/instructor/courses/${widget.courseId}/assignments');
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not create assignment. Try again.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

class InstructorAssignmentDetailPage extends ConsumerWidget {
  const InstructorAssignmentDetailPage({
    required this.courseId,
    required this.assignmentId,
    super.key,
  });
  final String courseId, assignmentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(instructorCoursesProvider);
    final submissions = ref.watch(instructorSubmissionsProvider(assignmentId));
    final course = courses.asData?.value
        .where((c) => c.id == courseId)
        .firstOrNull;
    return submissions.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _Retry(
        onRetry: () =>
            ref.invalidate(instructorSubmissionsProvider(assignmentId)),
      ),
      data: (items) {
        final pending = items.where((s) => !s.graded).toList();
        final graded = items.where((s) => s.graded).toList();
        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            TextButton.icon(
              onPressed: () =>
                  context.go('/instructor/courses/$courseId/assignments'),
              icon: const Icon(Icons.chevron_left),
              label: const Text('Back to assignments'),
              style: TextButton.styleFrom(alignment: Alignment.centerLeft),
            ),
            if (course != null) _CourseActionStrip(course: course),
            const Text(
              'Submissions',
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 27,
                color: Color(0xFF0C1F33),
              ),
            ),
            Text(
              '${items.length} total · ${pending.length} needs grading',
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            if (items.isEmpty)
              const Padding(
                padding: EdgeInsets.all(28),
                child: Text('No submissions yet.', textAlign: TextAlign.center),
              ),
            if (pending.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Text(
                'Needs Grading',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              for (final submission in pending)
                _SubmissionCard(
                  submission: submission,
                  pending: true,
                  onGrade: () => _grade(context, ref, submission),
                ),
            ],
            if (graded.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Text(
                'Graded',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              for (final submission in graded)
                _SubmissionCard(
                  submission: submission,
                  pending: false,
                  onGrade: () => _grade(context, ref, submission),
                ),
            ],
          ],
        );
      },
    );
  }

  Future<void> _grade(
    BuildContext context,
    WidgetRef ref,
    InstructorSubmission submission,
  ) async {
    final marks = TextEditingController(
      text: submission.marksAwarded?.toString() ?? '',
    );
    final feedback = TextEditingController(text: submission.feedback ?? '');
    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Grade Submission'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${submission.learnerName} · ${DateFormat('MMM d, yyyy').format(DateTime.tryParse(submission.submittedAt)?.toLocal() ?? DateTime.now())}',
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                color: const Color(0xFFFBF9F4),
                child: Text(
                  submission.content.isEmpty
                      ? 'No written response.'
                      : submission.content,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: marks,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Marks Awarded',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: feedback,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Feedback (optional)',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Submit Grade'),
          ),
        ],
      ),
    );
    final markValue = num.tryParse(marks.text);
    marks.dispose();
    if (shouldSave != true || markValue == null) {
      feedback.dispose();
      return;
    }
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .gradeSubmission(submission.id, markValue, feedback.text);
      ref.invalidate(instructorSubmissionsProvider(assignmentId));
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Submission graded')));
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Unable to save grade')));
      }
    } finally {
      feedback.dispose();
    }
  }
}

class _SubmissionCard extends StatelessWidget {
  const _SubmissionCard({
    required this.submission,
    required this.pending,
    required this.onGrade,
  });
  final InstructorSubmission submission;
  final bool pending;
  final VoidCallback onGrade;
  @override
  Widget build(BuildContext context) => Card(
    color: Colors.white,
    child: ListTile(
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFF9F6F0),
        child: Icon(
          pending ? Icons.person_outline : Icons.check_circle_outline,
          color: pending ? const Color(0xFFB8912F) : const Color(0xFF22A146),
        ),
      ),
      title: Text(submission.learnerName),
      subtitle: Text(
        pending
            ? 'Submitted ${DateFormat('MMM d, h:mm a').format(DateTime.tryParse(submission.submittedAt)?.toLocal() ?? DateTime.now())}'
            : 'Marks: ${submission.marksAwarded ?? '—'} · ${submission.feedback ?? 'No feedback'}',
        maxLines: 2,
      ),
      trailing: TextButton(
        onPressed: onGrade,
        child: Text(pending ? 'Grade' : 'Edit'),
      ),
    ),
  );
}

class _CourseActionStrip extends StatelessWidget {
  const _CourseActionStrip({required this.course});
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

class _EmptyAssignments extends StatelessWidget {
  const _EmptyAssignments();
  @override
  Widget build(BuildContext context) => const Padding(
    padding: EdgeInsets.all(30),
    child: Column(
      children: [
        Icon(Icons.assignment_outlined, size: 42, color: Color(0xFFCBD5E1)),
        SizedBox(height: 10),
        Text('No assignments yet.', style: TextStyle(color: Color(0xFF64748B))),
      ],
    ),
  );
}

class _Retry extends StatelessWidget {
  const _Retry({required this.onRetry});
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: TextButton(
      onPressed: onRetry,
      child: const Text('Could not load data. Tap to retry'),
    ),
  );
}
