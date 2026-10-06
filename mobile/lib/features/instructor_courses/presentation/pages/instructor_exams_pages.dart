import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../../domain/entities/instructor_course.dart';
import '../../domain/entities/instructor_exam.dart';
import '../../domain/entities/instructor_question.dart';
import '../providers/instructor_courses_providers.dart';
import '../widgets/course_action_strip.dart';

const _navy = Color(0xFF0C1F33);
const _deepNavy = Color(0xFF12304E);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _blue = Color(0xFF2563EB);
const _cream = Color(0xFFFBF9F4);
const _orange = Color(0xFFEA580C);

/// Regular-course exams have no attempt limit; the API expects a large number.
const _unlimitedAttempts = 999999;
const _dateTimeFormat = 'MMM d, y • h:mm a';

InstructorCourse? _findCourse(WidgetRef ref, String courseId) => ref
    .watch(instructorCoursesProvider)
    .asData
    ?.value
    .where((c) => c.id == courseId)
    .firstOrNull;

class InstructorExamsPage extends ConsumerWidget {
  const InstructorExamsPage({required this.courseId, super.key});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final exams = ref.watch(instructorExamsProvider(courseId));
    final course = _findCourse(ref, courseId);
    final items = exams.asData?.value ?? const <InstructorExam>[];
    return RefreshIndicator(
      onRefresh: () => ref.refresh(instructorExamsProvider(courseId).future),
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
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Exams',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 27,
                    color: _navy,
                  ),
                ),
              ),
              FilledButton.icon(
                onPressed: () =>
                    context.push('/instructor/courses/$courseId/exams/create'),
                style: FilledButton.styleFrom(backgroundColor: _green),
                icon: const Icon(Icons.add),
                label: const Text('Create'),
              ),
            ],
          ),
          Text(
            '${items.length} exams for this course',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          ...exams.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                icon: Icons.error_outline,
                text: 'Could not load exams.',
                action: TextButton(
                  onPressed: () =>
                      ref.invalidate(instructorExamsProvider(courseId)),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (items.isEmpty)
                const _Message(
                  icon: Icons.description_outlined,
                  text: 'No exams yet. Create your first exam.',
                )
              else
                for (final exam in items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _ExamCard(courseId: courseId, exam: exam),
                  ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ExamCard extends StatelessWidget {
  const _ExamCard({required this.courseId, required this.exam});
  final String courseId;
  final InstructorExam exam;

  @override
  Widget build(BuildContext context) {
    final isFinal = exam.type == 'final';
    final color = isFinal ? Colors.red : _blue;
    final dynamicBank = exam.questions.isEmpty;
    final scheduled =
        exam.openDate != null && exam.openDate!.isAfter(DateTime.now());
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _border),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _Badge(label: isFinal ? 'FINAL' : 'PRACTICE', color: color),
              if (scheduled) ...[
                const SizedBox(width: 8),
                const Text(
                  'SCHEDULED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFCA8A04),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Text(
            exam.title,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: _navy,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              _Meta(Icons.schedule, '${exam.duration} minutes'),
              _Meta(
                Icons.description_outlined,
                dynamicBank
                    ? 'Random questions'
                    : '${exam.questions.length} questions',
              ),
              _Meta(Icons.check_circle_outline, 'Pass: ${exam.passMark}%'),
              _Meta(
                Icons.replay,
                dynamicBank
                    ? 'Unlimited attempts'
                    : 'Max attempts: ${exam.maxAttempts}',
              ),
              if (scheduled)
                _Meta(
                  Icons.event,
                  DateFormat(_dateTimeFormat).format(exam.openDate!),
                ),
            ],
          ),
          const Divider(height: 22),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push(
                    '/instructor/courses/$courseId/exams/${exam.id}/attempts',
                  ),
                  style: OutlinedButton.styleFrom(foregroundColor: _green),
                  icon: const Icon(Icons.people_outline, size: 18),
                  label: const Text('Attempts'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push(
                    '/instructor/courses/$courseId/exams/${exam.id}/edit',
                  ),
                  style: OutlinedButton.styleFrom(foregroundColor: _blue),
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Edit'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Create (no [examId]) or edit an exam.
class InstructorExamFormPage extends ConsumerStatefulWidget {
  const InstructorExamFormPage({
    required this.courseId,
    this.examId,
    super.key,
  });
  final String courseId;
  final String? examId;
  @override
  ConsumerState<InstructorExamFormPage> createState() =>
      _InstructorExamFormPageState();
}

class _InstructorExamFormPageState
    extends ConsumerState<InstructorExamFormPage> {
  final _title = TextEditingController(),
      _duration = TextEditingController(text: '60'),
      _passMark = TextEditingController(text: '50'),
      _maxAttempts = TextEditingController(text: '3'),
      _cooldown = TextEditingController(text: '24'),
      _marks = TextEditingController(text: '20'),
      _search = TextEditingController();
  String _type = 'practice';
  DateTime? _startTime;
  bool _randomizeQuestions = false, _randomizeOptions = false;
  bool _loaded = false, _saving = false;
  String _filterType = 'all', _filterDifficulty = 'all';

  /// Selected question id → marks field, in selection order.
  final _selected = <String, TextEditingController>{};

  bool get _isEdit => widget.examId != null;

  @override
  void dispose() {
    for (final c in [
      _title,
      _duration,
      _passMark,
      _maxAttempts,
      _cooldown,
      _marks,
      _search,
      ..._selected.values,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  void _load(InstructorExam exam) {
    _loaded = true;
    _title.text = exam.title;
    _type = exam.type == 'final' ? 'final' : 'practice';
    _duration.text = '${exam.duration}';
    _passMark.text = '${exam.passMark}';
    _maxAttempts.text = '${exam.maxAttempts.clamp(1, 10)}';
    _cooldown.text = '${exam.cooldownHours}';
    _marks.text = '${exam.totalMarks}';
    _startTime = exam.openDate;
    _randomizeQuestions = exam.randomizeQuestions;
    _randomizeOptions = exam.randomizeOptions;
    for (final q in exam.questions) {
      _selected[q.questionId] = TextEditingController(text: '${q.marks}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final courses = ref.watch(instructorCoursesProvider);
    final course = _findCourse(ref, widget.courseId);
    if (course == null) {
      return courses.isLoading
          ? const Center(child: CircularProgressIndicator())
          : _Message(
              icon: Icons.error_outline,
              text: 'Could not load this course.',
              action: TextButton(
                onPressed: () => ref.invalidate(instructorCoursesProvider),
                child: const Text('Tap to retry'),
              ),
            );
    }
    final examId = widget.examId;
    if (examId != null && !_loaded) {
      return ref
          .watch(instructorExamsProvider(widget.courseId))
          .when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => _Message(
              icon: Icons.error_outline,
              text: 'Could not load this exam.',
              action: TextButton(
                onPressed: () =>
                    ref.invalidate(instructorExamsProvider(widget.courseId)),
                child: const Text('Tap to retry'),
              ),
            ),
            data: (exams) {
              final exam = exams.where((e) => e.id == examId).firstOrNull;
              if (exam == null) {
                return const _Message(
                  icon: Icons.search_off,
                  text: 'This exam no longer exists.',
                );
              }
              _load(exam);
              return _form(course);
            },
          );
    }
    return _form(course);
  }

  Widget _form(InstructorCourse course) {
    final online = course.type == 'ONLINE_CLASS';
    final isFinal = _type == 'final';
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        TextButton.icon(
          onPressed: _saving ? null : _back,
          icon: const Icon(Icons.chevron_left),
          label: const Text('Back to exams'),
          style: TextButton.styleFrom(alignment: Alignment.centerLeft),
        ),
        CourseActionStrip(course: course),
        Text(
          _isEdit ? 'Edit Exam' : 'Create Exam',
          style: const TextStyle(
            fontFamily: 'serif',
            fontSize: 28,
            color: _navy,
          ),
        ),
        const SizedBox(height: 16),
        _Section(
          title: 'Exam Details',
          children: [
            TextField(
              controller: _title,
              enabled: !_saving,
              maxLength: 255,
              decoration: const InputDecoration(
                labelText: 'Exam Title *',
                hintText: 'e.g. Midterm Exam',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 6),
            const _Label('Type *'),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'practice', label: Text('Practice')),
                ButtonSegment(value: 'final', label: Text('Final')),
              ],
              selected: {_type},
              onSelectionChanged: _saving
                  ? null
                  : (value) => setState(() {
                      _type = value.first;
                      _maxAttempts.text = _type == 'final' ? '1' : '3';
                    }),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _NumberField(
                    controller: _duration,
                    label: 'Duration (min) *',
                    enabled: !_saving,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _NumberField(
                    controller: _passMark,
                    label: 'Pass Mark (%) *',
                    enabled: !_saving,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (online) ...[
              Row(
                children: [
                  Expanded(
                    child: _NumberField(
                      controller: _maxAttempts,
                      label: 'Max Attempts *',
                      enabled: !_saving && !isFinal,
                      helper: isFinal ? 'Final exams allow one attempt.' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _NumberField(
                      controller: _cooldown,
                      label: 'Cooldown (hours)',
                      enabled: !_saving,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const _Label('Exam Start Time *'),
              OutlinedButton.icon(
                onPressed: _saving ? null : _pickStartTime,
                style: OutlinedButton.styleFrom(
                  alignment: Alignment.centerLeft,
                  minimumSize: const Size.fromHeight(50),
                  foregroundColor: _navy,
                ),
                icon: const Icon(Icons.event),
                label: Text(
                  _startTime == null
                      ? 'Choose date and time'
                      : DateFormat(_dateTimeFormat).format(_startTime!),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Learners can start this exam from the scheduled time until '
                '50% of the exam duration has elapsed.',
                style: TextStyle(fontSize: 12, color: _muted),
              ),
            ] else ...[
              _NumberField(
                controller: _marks,
                label: 'Exam Marks (Total) *',
                enabled: !_saving,
              ),
              const SizedBox(height: 8),
              const Text(
                'Questions are randomly selected from your course question '
                'bank in every learner attempt up to the total mark set above. '
                'Learners can attempt this exam unlimited times.',
                style: TextStyle(fontSize: 12, color: _muted),
              ),
            ],
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Randomize questions'),
              value: _randomizeQuestions,
              onChanged: _saving
                  ? null
                  : (v) => setState(() => _randomizeQuestions = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Randomize options'),
              value: _randomizeOptions,
              onChanged: _saving
                  ? null
                  : (v) => setState(() => _randomizeOptions = v),
            ),
          ],
        ),
        if (online) ...[const SizedBox(height: 16), _questionPicker()],
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _saving ? null : _back,
                child: const Text('Cancel'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: FilledButton(
                onPressed: _saving || (online && _selected.isEmpty)
                    ? null
                    : () => _submit(online),
                style: FilledButton.styleFrom(backgroundColor: _green),
                child: Text(
                  _saving
                      ? (_isEdit ? 'Saving...' : 'Creating...')
                      : online && _selected.isEmpty
                      ? 'Select at least one question'
                      : (_isEdit ? 'Save Changes' : 'Create Exam'),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _questionPicker() {
    final questions = ref.watch(instructorQuestionsProvider(widget.courseId));
    final query = _search.text.trim().toLowerCase();
    return _Section(
      title: 'Select Questions',
      trailing: Text(
        '${_selected.length} selected • ${_selectedMarks()} marks',
        style: const TextStyle(fontSize: 12, color: _muted),
      ),
      children: [
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: const InputDecoration(
            hintText: 'Search questions...',
            prefixIcon: Icon(Icons.search),
            isDense: true,
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _Dropdown(
                value: _filterType,
                items: const {
                  'all': 'All Types',
                  'mcq': 'MCQ',
                  'multi_select': 'Multi Select',
                  'true_false': 'True/False',
                  'short_answer': 'Short Answer',
                  'essay': 'Essay',
                },
                onChanged: (v) => setState(() => _filterType = v),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _Dropdown(
                value: _filterDifficulty,
                items: const {
                  'all': 'All Difficulties',
                  'easy': 'Easy',
                  'medium': 'Medium',
                  'hard': 'Hard',
                },
                onChanged: (v) => setState(() => _filterDifficulty = v),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...questions.when(
          loading: () => const [
            Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator()),
            ),
          ],
          error: (_, _) => [
            TextButton(
              onPressed: () =>
                  ref.invalidate(instructorQuestionsProvider(widget.courseId)),
              child: const Text('Could not load questions. Tap to retry'),
            ),
          ],
          data: (all) {
            final filtered = all
                .where(
                  (q) =>
                      q.question.toLowerCase().contains(query) &&
                      (_filterType == 'all' || q.type == _filterType) &&
                      (_filterDifficulty == 'all' ||
                          q.difficulty == _filterDifficulty),
                )
                .toList();
            if (filtered.isEmpty) {
              return [
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'No questions found.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: _muted),
                  ),
                ),
                OutlinedButton(
                  onPressed: () => context.push(
                    '/instructor/courses/${widget.courseId}/questions',
                  ),
                  child: const Text('Manage Questions'),
                ),
              ];
            }
            return [
              for (final q in filtered)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _QuestionPickTile(
                    question: q,
                    marks: _selected[q.id],
                    enabled: !_saving,
                    onToggle: () => _toggle(q),
                    onMarksChanged: () => setState(() {}),
                  ),
                ),
            ];
          },
        ),
      ],
    );
  }

  void _toggle(InstructorQuestion question) => setState(() {
    final existing = _selected.remove(question.id);
    if (existing != null) {
      existing.dispose();
    } else {
      _selected[question.id] = TextEditingController(text: '${question.marks}');
    }
  });

  int _selectedMarks() => _selected.values.fold(
    0,
    (sum, c) => sum + (int.tryParse(c.text.trim()) ?? 0),
  );

  Future<void> _pickStartTime() async {
    final now = DateTime.now();
    final initial = _startTime ?? now.add(const Duration(hours: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(now) ? now : initial,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: now.add(const Duration(days: 730)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial),
    );
    if (time == null) return;
    setState(
      () => _startTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      ),
    );
  }

  Future<void> _submit(bool online) async {
    int? read(TextEditingController c) => int.tryParse(c.text.trim());
    final title = _title.text.trim();
    final duration = read(_duration), passMark = read(_passMark);
    if (title.isEmpty) return _notify('Title is required');
    if (duration == null || duration < 5 || duration > 480) {
      return _notify('Duration must be 5 to 480 minutes');
    }
    if (passMark == null || passMark < 1 || passMark > 100) {
      return _notify('Pass mark must be 1 to 100%');
    }

    final int totalMarks, maxAttempts, cooldown;
    final List<Map<String, dynamic>> questions;
    if (online) {
      maxAttempts = _type == 'final' ? 1 : (read(_maxAttempts) ?? 0);
      cooldown = read(_cooldown) ?? -1;
      if (maxAttempts < 1 || maxAttempts > 10) {
        return _notify('Max attempts must be 1 to 10');
      }
      if (cooldown < 0 || cooldown > 168) {
        return _notify('Cooldown must be 0 to 168 hours');
      }
      if (_selected.isEmpty) {
        return _notify('Select at least one question for this exam');
      }
      questions = [];
      for (final MapEntry(key: id, value: c) in _selected.entries) {
        final marks = int.tryParse(c.text.trim());
        if (marks == null || marks < 1) {
          return _notify('Each selected question must have at least one mark');
        }
        questions.add({'questionId': id, 'marks': marks});
      }
      if (_startTime == null) {
        return _notify('Exam start time is required for online class exams');
      }
      if (!_isEdit && !_startTime!.isAfter(DateTime.now())) {
        return _notify('Exam start time must be in the future');
      }
      totalMarks = _selectedMarks();
    } else {
      final marks = read(_marks);
      if (marks == null || marks < 1 || marks > 1000) {
        return _notify('Total marks must be 1 to 1000');
      }
      totalMarks = marks;
      maxAttempts = _unlimitedAttempts;
      cooldown = 0;
      questions = const [];
    }

    final input = {
      'courseId': widget.courseId,
      'title': title,
      'type': _type,
      'duration': duration,
      'passMark': passMark,
      'totalMarks': totalMarks,
      'maxAttempts': maxAttempts,
      'cooldownHours': cooldown,
      'randomizeQuestions': _randomizeQuestions,
      'randomizeOptions': _randomizeOptions,
      if (online) 'openDate': _startTime!.toUtc().toIso8601String(),
      'questions': questions,
    };
    final repository = ref.read(instructorCoursesRepositoryProvider);
    setState(() => _saving = true);
    try {
      if (_isEdit) {
        await repository.updateExam(widget.examId!, input);
      } else {
        await repository.createExam(input);
      }
      ref.invalidate(instructorExamsProvider(widget.courseId));
      if (!mounted) return;
      _notify(_isEdit ? 'Exam updated' : 'Exam created');
      context.go('/instructor/courses/${widget.courseId}/exams');
    } catch (error) {
      _notify(
        apiErrorMessage(
          error,
          fallback: _isEdit ? 'Failed to update exam' : 'Failed to create exam',
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _back() => context.canPop()
      ? context.pop()
      : context.go('/instructor/courses/${widget.courseId}/exams');

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _QuestionPickTile extends StatelessWidget {
  const _QuestionPickTile({
    required this.question,
    required this.marks,
    required this.enabled,
    required this.onToggle,
    required this.onMarksChanged,
  });
  final InstructorQuestion question;
  final TextEditingController? marks;
  final bool enabled;
  final VoidCallback onToggle, onMarksChanged;

  @override
  Widget build(BuildContext context) {
    final selected = marks != null;
    return Material(
      color: selected ? const Color(0xFFF0FDF4) : Colors.white,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: selected ? _green : _border),
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        onTap: enabled ? onToggle : null,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 6, 10, 6),
          child: Row(
            children: [
              Checkbox(
                value: selected,
                activeColor: _green,
                onChanged: enabled ? (_) => onToggle() : null,
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question.question,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, color: _navy),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${question.type.toUpperCase()} • ${question.difficulty} • ${question.marks} marks',
                      style: const TextStyle(fontSize: 11, color: _muted),
                    ),
                  ],
                ),
              ),
              if (marks != null) ...[
                const SizedBox(width: 8),
                SizedBox(
                  width: 64,
                  child: TextField(
                    controller: marks,
                    enabled: enabled,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    onChanged: (_) => onMarksChanged(),
                    decoration: const InputDecoration(
                      labelText: 'Marks',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class InstructorExamAttemptsPage extends ConsumerStatefulWidget {
  const InstructorExamAttemptsPage({
    required this.courseId,
    required this.examId,
    super.key,
  });
  final String courseId, examId;
  @override
  ConsumerState<InstructorExamAttemptsPage> createState() =>
      _InstructorExamAttemptsPageState();
}

class _InstructorExamAttemptsPageState
    extends ConsumerState<InstructorExamAttemptsPage> {
  bool _issuing = false;

  @override
  Widget build(BuildContext context) {
    final attempts = ref.watch(instructorExamAttemptsProvider(widget.examId));
    final course = _findCourse(ref, widget.courseId);
    final exam = ref
        .watch(instructorExamsProvider(widget.courseId))
        .asData
        ?.value
        .where((e) => e.id == widget.examId)
        .firstOrNull;
    final items = attempts.asData?.value ?? const <InstructorExamAttempt>[];
    final pending = items.where((a) => !a.graded).length;
    final canIssue = course?.type == 'ONLINE_CLASS' && exam?.type == 'final';

    return RefreshIndicator(
      onRefresh: () =>
          ref.refresh(instructorExamAttemptsProvider(widget.examId).future),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: () =>
                context.go('/instructor/courses/${widget.courseId}/exams'),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to exams'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          if (course != null) CourseActionStrip(course: course),
          const Text(
            'Exam Attempts',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          if (exam != null)
            Text(
              exam.title,
              style: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
            ),
          Text(
            '${items.length} total attempts • $pending needs grading',
            style: const TextStyle(color: _muted),
          ),
          if (canIssue) ...[
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _issuing || attempts.isLoading || items.isEmpty
                  ? null
                  : _issueCertificates,
              style: FilledButton.styleFrom(backgroundColor: _deepNavy),
              icon: const Icon(Icons.workspace_premium_outlined, size: 18),
              label: Text(
                _issuing
                    ? 'Issuing certificates...'
                    : 'Issue certificates for all learners',
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Latest passed attempts qualify. All attempts must be graded '
              'first.',
              style: TextStyle(fontSize: 12, color: _muted),
            ),
          ],
          const SizedBox(height: 16),
          ...attempts.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                icon: Icons.error_outline,
                text: 'Could not load exam attempts.',
                action: TextButton(
                  onPressed: () => ref.invalidate(
                    instructorExamAttemptsProvider(widget.examId),
                  ),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (items.isEmpty)
                const _Message(
                  icon: Icons.people_outline,
                  text: 'No attempts yet.',
                )
              else
                for (final attempt in items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _AttemptCard(
                      attempt: attempt,
                      onOpen: () => context.push(
                        '/instructor/courses/${widget.courseId}/exams/${widget.examId}/attempts/${attempt.id}/grade',
                      ),
                    ),
                  ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _issueCertificates() async {
    setState(() => _issuing = true);
    try {
      final result = await ref
          .read(instructorCoursesRepositoryProvider)
          .issueFinalExamCertificates(widget.examId);
      _notify(
        'Issued ${result.issued} certificate(s). ${result.alreadyIssued} '
        'already issued; ${result.notPassed} learner(s) did not pass their '
        'latest attempt.',
      );
    } catch (error) {
      _notify(
        apiErrorMessage(
          error,
          fallback: 'Failed to issue final exam certificates',
        ),
      );
    } finally {
      if (mounted) setState(() => _issuing = false);
    }
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _AttemptCard extends StatelessWidget {
  const _AttemptCard({required this.attempt, required this.onOpen});
  final InstructorExamAttempt attempt;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final submitted = attempt.submittedAt;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _border),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  attempt.learnerName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: _navy,
                  ),
                ),
              ),
              _StatusPill(attempt: attempt),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 14,
            runSpacing: 4,
            children: [
              _Meta(Icons.tag, 'Attempt #${attempt.attemptNumber}'),
              _Meta(
                Icons.schedule,
                submitted == null
                    ? 'Not submitted'
                    : DateFormat(_dateTimeFormat).format(submitted),
              ),
              _Meta(
                Icons.grade_outlined,
                attempt.graded
                    ? '${_num(attempt.score ?? 0)} / ${attempt.totalMarks}'
                    : '—',
              ),
            ],
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: attempt.graded
                ? OutlinedButton.icon(
                    onPressed: onOpen,
                    icon: const Icon(Icons.visibility_outlined, size: 18),
                    label: const Text('View'),
                  )
                : FilledButton(
                    onPressed: onOpen,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    child: const Text('Grade now'),
                  ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.attempt});
  final InstructorExamAttempt attempt;

  @override
  Widget build(BuildContext context) {
    final (label, color, icon) = !attempt.graded
        ? ('Needs grading', _orange, Icons.error_outline)
        : attempt.passed == true
        ? ('PASSED', _green, Icons.check_circle_outline)
        : ('FAILED', Colors.red, Icons.cancel_outlined);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class InstructorGradeAttemptPage extends ConsumerStatefulWidget {
  const InstructorGradeAttemptPage({
    required this.courseId,
    required this.examId,
    required this.attemptId,
    super.key,
  });
  final String courseId, examId, attemptId;
  @override
  ConsumerState<InstructorGradeAttemptPage> createState() =>
      _InstructorGradeAttemptPageState();
}

class _InstructorGradeAttemptPageState
    extends ConsumerState<InstructorGradeAttemptPage> {
  final _marks = <String, TextEditingController>{};
  bool _submitting = false;

  @override
  void dispose() {
    for (final c in _marks.values) {
      c.dispose();
    }
    super.dispose();
  }

  static bool _isWritten(InstructorQuestion q) =>
      q.type == 'short_answer' || q.type == 'essay';

  /// Marks typed for [q], prefilled from a previous grading session.
  TextEditingController _controllerFor(
    InstructorQuestion q,
    InstructorExamAttempt attempt,
  ) => _marks.putIfAbsent(q.id, () {
    final stored = attempt.answers['${q.id}_marks'];
    return TextEditingController(
      text: stored is num && stored >= 0 ? _num(stored) : '',
    );
  });

  num? _validMarks(InstructorQuestion q) {
    final value = num.tryParse(_marks[q.id]?.text.trim() ?? '');
    if (value == null || !value.isFinite || value < 0 || value > q.marks) {
      return null;
    }
    return value;
  }

  @override
  Widget build(BuildContext context) {
    final details = ref.watch(
      instructorAttemptDetailsProvider(widget.attemptId),
    );
    return details.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _Message(
        icon: Icons.error_outline,
        text: 'Could not load this attempt.',
        action: TextButton(
          onPressed: () => ref.invalidate(
            instructorAttemptDetailsProvider(widget.attemptId),
          ),
          child: const Text('Tap to retry'),
        ),
      ),
      data: (attempt) {
        final written = attempt.questions.where(_isWritten).toList();
        final shown = attempt.graded ? attempt.questions : written;
        for (final q in written) {
          _controllerFor(q, attempt);
        }
        final allValid = written.every((q) => _validMarks(q) != null);
        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            TextButton.icon(
              onPressed: _submitting ? null : _back,
              icon: const Icon(Icons.chevron_left),
              label: const Text('Back'),
              style: TextButton.styleFrom(alignment: Alignment.centerLeft),
            ),
            Text(
              attempt.graded ? 'View Attempt' : 'Grade Attempt',
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 27,
                color: _navy,
              ),
            ),
            Text(
              '${attempt.learnerName} • Attempt #${attempt.attemptNumber}',
              style: const TextStyle(color: _muted),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                _Meta(Icons.schedule, '${attempt.totalMarks} total marks'),
                _Badge(
                  label: attempt.graded ? 'GRADED' : 'PENDING',
                  color: attempt.graded ? _green : const Color(0xFFA16207),
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (!attempt.graded && written.isEmpty)
              const _Message(
                icon: Icons.description_outlined,
                text:
                    'No written questions to grade. This exam is fully '
                    'auto-graded.',
              )
            else
              for (final q in shown)
                Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _GradeQuestionCard(
                    question: q,
                    attempt: attempt,
                    written: _isWritten(q),
                    controller: _isWritten(q) && !attempt.graded
                        ? _marks[q.id]
                        : null,
                    enabled: !_submitting,
                    onChanged: () => setState(() {}),
                  ),
                ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: _border),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Grading Summary',
                    style: TextStyle(fontWeight: FontWeight.w600, color: _navy),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    attempt.graded
                        ? 'Final result: ${_num(attempt.score ?? 0)} / '
                              '${attempt.totalMarks} • '
                              '${attempt.passed == true ? 'Passed' : 'Failed'}.'
                        : '${written.length} written question(s) to grade '
                              'manually. MCQ/True-False are auto-graded.',
                    style: const TextStyle(fontSize: 12, color: _muted),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _submitting ? null : _back,
                          child: const Text('Done'),
                        ),
                      ),
                      if (!attempt.graded && written.isNotEmpty) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: FilledButton(
                            onPressed: _submitting || !allValid
                                ? null
                                : () => _submit(written),
                            style: FilledButton.styleFrom(
                              backgroundColor: _green,
                            ),
                            child: Text(
                              _submitting
                                  ? 'Submitting grades…'
                                  : 'Submit all grades',
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submit(List<InstructorQuestion> written) async {
    final grades = [
      for (final q in written)
        (questionId: q.id, marksAwarded: _validMarks(q)!),
    ];
    setState(() => _submitting = true);
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .gradeAttempt(widget.attemptId, grades);
      ref
        ..invalidate(instructorAttemptDetailsProvider(widget.attemptId))
        ..invalidate(instructorExamAttemptsProvider(widget.examId));
      _notify('Answers graded');
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to grade answers'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _back() => context.canPop()
      ? context.pop()
      : context.go(
          '/instructor/courses/${widget.courseId}/exams/${widget.examId}/attempts',
        );

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _GradeQuestionCard extends StatelessWidget {
  const _GradeQuestionCard({
    required this.question,
    required this.attempt,
    required this.written,
    required this.controller,
    required this.enabled,
    required this.onChanged,
  });
  final InstructorQuestion question;
  final InstructorExamAttempt attempt;
  final bool written, enabled;
  final TextEditingController? controller;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final awarded = attempt.answers['${question.id}_marks'];
    final input = controller;
    final typed = num.tryParse(input?.text.trim() ?? '');
    final invalid =
        input != null &&
        input.text.trim().isNotEmpty &&
        (typed == null || typed < 0 || typed > question.marks);
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _border),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${question.type.replaceAll('_', ' ').toUpperCase()} QUESTION',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: _muted,
                  ),
                ),
              ),
              Text(
                'Max Marks: ${question.marks}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            question.question,
            style: const TextStyle(fontSize: 15, height: 1.4, color: _navy),
          ),
          const SizedBox(height: 12),
          _AnswerBox(
            label: "Student's Answer",
            text: _answerText(attempt.answers[question.id]),
            background: _cream,
            labelColor: _muted,
          ),
          if (attempt.graded &&
              !written &&
              question.correctAnswers.isNotEmpty) ...[
            const SizedBox(height: 10),
            _AnswerBox(
              label: 'Correct Answer',
              text: question.correctAnswers.join(', '),
            ),
          ],
          if (question.suggestedAnswer != null) ...[
            const SizedBox(height: 10),
            _AnswerBox(
              label: 'Suggested Answer',
              text: question.suggestedAnswer!,
            ),
          ],
          if (written) ...[
            const SizedBox(height: 12),
            if (input == null)
              Text(
                'Marks awarded: ${awarded is num ? _num(awarded) : '—'} / '
                '${question.marks}',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              )
            else
              Row(
                children: [
                  const Text(
                    'Marks Awarded:',
                    style: TextStyle(fontWeight: FontWeight.w600, color: _navy),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    width: 84,
                    child: TextField(
                      controller: input,
                      enabled: enabled,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      textAlign: TextAlign.center,
                      onChanged: (_) => onChanged(),
                      decoration: InputDecoration(
                        isDense: true,
                        errorText: invalid ? '0–${question.marks}' : null,
                        border: const OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '/ ${question.marks}',
                    style: const TextStyle(color: _muted),
                  ),
                ],
              ),
          ],
        ],
      ),
    );
  }
}

class _AnswerBox extends StatelessWidget {
  const _AnswerBox({
    required this.label,
    required this.text,
    this.background = const Color(0xFFF0FDF4),
    this.labelColor = _green,
  });
  final String label, text;
  final Color background, labelColor;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: background,
      borderRadius: BorderRadius.circular(9),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 6),
        SelectableText(
          text,
          style: const TextStyle(fontSize: 14, height: 1.45, color: _navy),
        ),
      ],
    ),
  );
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children, this.trailing});
  final String title;
  final List<Widget> children;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              ),
            ),
            ?trailing,
          ],
        ),
        const SizedBox(height: 14),
        ...children,
      ],
    ),
  );
}

class _NumberField extends StatelessWidget {
  const _NumberField({
    required this.controller,
    required this.label,
    required this.enabled,
    this.helper,
  });
  final TextEditingController controller;
  final String label;
  final bool enabled;
  final String? helper;

  @override
  Widget build(BuildContext context) => TextField(
    controller: controller,
    enabled: enabled,
    keyboardType: TextInputType.number,
    decoration: InputDecoration(
      labelText: label,
      helperText: helper,
      helperMaxLines: 2,
      border: const OutlineInputBorder(),
    ),
  );
}

class _Dropdown extends StatelessWidget {
  const _Dropdown({
    required this.value,
    required this.items,
    required this.onChanged,
  });
  final String value;
  final Map<String, String> items;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) => DropdownButtonFormField<String>(
    initialValue: value,
    isExpanded: true,
    isDense: true,
    decoration: const InputDecoration(
      isDense: true,
      border: OutlineInputBorder(),
    ),
    items: [
      for (final MapEntry(:key, value: label) in items.entries)
        DropdownMenuItem(value: key, child: Text(label)),
    ],
    onChanged: (v) {
      if (v != null) onChanged(v);
    },
  );
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(
      text,
      style: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
    ),
  );
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

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .1),
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      label,
      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
    ),
  );
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, this.action});
  final IconData icon;
  final String text;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.all(2),
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      mainAxisSize: MainAxisSize.min,
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

String _answerText(Object? answer) {
  if (answer is List) return answer.join(', ');
  return answer is String && answer.isNotEmpty ? answer : 'No answer submitted';
}

/// Shows whole numbers without a trailing `.0`.
String _num(num value) =>
    value == value.roundToDouble() ? '${value.toInt()}' : '$value';
