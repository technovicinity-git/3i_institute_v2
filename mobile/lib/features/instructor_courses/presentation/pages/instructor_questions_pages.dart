import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../domain/entities/instructor_question.dart';
import '../providers/instructor_courses_providers.dart';
import '../widgets/course_action_strip.dart';

const _navy = Color(0xFF0C1F33);
const _deepNavy = Color(0xFF12304E);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _cream = Color(0xFFFBF9F4);

const _questionTypes = [
  ('mcq', 'MCQ (Single Answer)'),
  ('multi_select', 'Multi Select'),
  ('true_false', 'True / False'),
  ('short_answer', 'Short Answer'),
  ('essay', 'Essay'),
];
const _difficulties = ['easy', 'medium', 'hard'];
const _maxCsvBytes = 5 * 1024 * 1024;

class InstructorQuestionsPage extends ConsumerStatefulWidget {
  const InstructorQuestionsPage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<InstructorQuestionsPage> createState() =>
      _InstructorQuestionsPageState();
}

class _InstructorQuestionsPageState
    extends ConsumerState<InstructorQuestionsPage> {
  final _search = TextEditingController();
  String _filter = 'all';
  String? _deletingId;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final questions = ref.watch(instructorQuestionsProvider(widget.courseId));
    final course = ref
        .watch(instructorCoursesProvider)
        .asData
        ?.value
        .where((c) => c.id == widget.courseId)
        .firstOrNull;
    final items = questions.asData?.value ?? const <InstructorQuestion>[];
    final query = _search.text.trim().toLowerCase();
    final filtered = items
        .where(
          (q) =>
              q.question.toLowerCase().contains(query) &&
              (_filter == 'all' || q.type == _filter),
        )
        .toList();

    return RefreshIndicator(
      onRefresh: () =>
          ref.refresh(instructorQuestionsProvider(widget.courseId).future),
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
            'Question Bank',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          Text(
            '${items.length} questions',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _bulkImport,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: _deepNavy,
                    side: const BorderSide(color: _deepNavy),
                  ),
                  icon: const Icon(Icons.upload, size: 18),
                  label: const Text('Bulk Import'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => context.push(
                    '/instructor/courses/${widget.courseId}/questions/create',
                  ),
                  style: FilledButton.styleFrom(backgroundColor: _green),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Create'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search questions...',
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
          const SizedBox(height: 10),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (final (value, label) in [
                  ('all', 'All Types'),
                  for (final t in _questionTypes) (t.$1, _typeBadge(t.$1).$1),
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: 7),
                    child: ChoiceChip(
                      label: Text(label),
                      selected: _filter == value,
                      onSelected: (_) => setState(() => _filter = value),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          ...questions.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                text: 'Failed to load questions',
                action: TextButton(
                  onPressed: () => ref.invalidate(
                    instructorQuestionsProvider(widget.courseId),
                  ),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (filtered.isEmpty)
                const _Message(text: 'No questions found.')
              else
                for (final question in filtered)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _QuestionCard(
                      question: question,
                      deleting: _deletingId == question.id,
                      onOpen: () => context.push(
                        '/instructor/courses/${widget.courseId}/questions/${question.id}/edit',
                      ),
                      onDelete: _deletingId == null
                          ? () => _delete(question)
                          : null,
                    ),
                  ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _delete(InstructorQuestion question) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete question?'),
        content: Text(
          question.question,
          maxLines: 4,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    setState(() => _deletingId = question.id);
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .deleteQuestion(question.id);
      ref.invalidate(instructorQuestionsProvider(widget.courseId));
      _notify('Question deleted');
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to delete question'));
    } finally {
      if (mounted) setState(() => _deletingId = null);
    }
  }

  Future<void> _bulkImport() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _BulkImportSheet(courseId: widget.courseId),
    );
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _QuestionCard extends StatelessWidget {
  const _QuestionCard({
    required this.question,
    required this.deleting,
    required this.onOpen,
    required this.onDelete,
  });
  final InstructorQuestion question;
  final bool deleting;
  final VoidCallback onOpen;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final (label, color) = _typeBadge(question.type);
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: _border),
        borderRadius: BorderRadius.circular(13),
      ),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(13),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(15, 13, 6, 13),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: .1),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Text(
                            label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: color,
                            ),
                          ),
                        ),
                        Text(
                          question.difficulty.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: _difficultyColor(question.difficulty),
                          ),
                        ),
                        Text(
                          '${question.marks} marks',
                          style: const TextStyle(fontSize: 11, color: _muted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      question.question,
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        height: 1.45,
                        color: _navy,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'View / edit',
                onPressed: onOpen,
                color: const Color(0xFF2563EB),
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.visibility_outlined, size: 20),
              ),
              IconButton(
                tooltip: 'Delete',
                onPressed: onDelete,
                color: Colors.red,
                visualDensity: VisualDensity.compact,
                icon: deleting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.delete_outline, size: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Create (no [questionId]) or edit an existing question.
class InstructorQuestionFormPage extends ConsumerStatefulWidget {
  const InstructorQuestionFormPage({
    required this.courseId,
    this.questionId,
    super.key,
  });
  final String courseId;
  final String? questionId;
  @override
  ConsumerState<InstructorQuestionFormPage> createState() =>
      _InstructorQuestionFormPageState();
}

class _InstructorQuestionFormPageState
    extends ConsumerState<InstructorQuestionFormPage> {
  final _question = TextEditingController(),
      _suggested = TextEditingController(),
      _marks = TextEditingController(text: '1'),
      _negative = TextEditingController(text: '0'),
      _explanation = TextEditingController();
  final _options = List.generate(4, (_) => TextEditingController());
  final _correct = <int>{};
  String _type = 'mcq', _difficulty = 'medium';
  bool _trueFalse = true, _loaded = false, _saving = false;

  bool get _isEdit => widget.questionId != null;
  bool get _hasOptions => _type == 'mcq' || _type == 'multi_select';

  @override
  void dispose() {
    for (final c in [
      _question,
      _suggested,
      _marks,
      _negative,
      _explanation,
      ..._options,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  void _load(InstructorQuestion q) {
    _loaded = true;
    _type = q.type;
    _difficulty = _difficulties.contains(q.difficulty)
        ? q.difficulty
        : 'medium';
    _question.text = q.question;
    _suggested.text = q.suggestedAnswer ?? '';
    _marks.text = '${q.marks}';
    _negative.text = '${q.negativeMarks}';
    _explanation.text = q.explanation ?? '';
    if (_hasOptions) {
      for (final c in _options) {
        c.dispose();
      }
      _options
        ..clear()
        ..addAll(q.options.map((o) => TextEditingController(text: o)));
      while (_options.length < 2) {
        _options.add(TextEditingController());
      }
      for (var i = 0; i < q.options.length; i++) {
        if (q.correctAnswers.contains(q.options[i])) _correct.add(i);
      }
    }
    if (_type == 'true_false') {
      _trueFalse = q.correctAnswers.firstOrNull?.toLowerCase() != 'false';
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = widget.questionId;
    if (id != null && !_loaded) {
      return ref
          .watch(instructorQuestionProvider(id))
          .when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => _Message(
              text: 'Could not load this question.',
              action: TextButton(
                onPressed: () => ref.invalidate(instructorQuestionProvider(id)),
                child: const Text('Tap to retry'),
              ),
            ),
            data: (q) {
              _load(q);
              return _form();
            },
          );
    }
    return _form();
  }

  Widget _form() => ListView(
    padding: const EdgeInsets.all(18),
    children: [
      TextButton.icon(
        onPressed: _saving ? null : _back,
        icon: const Icon(Icons.chevron_left),
        label: const Text('Back to questions'),
        style: TextButton.styleFrom(alignment: Alignment.centerLeft),
      ),
      Text(
        _isEdit ? 'Edit Question' : 'Create Question',
        style: const TextStyle(fontFamily: 'serif', fontSize: 28, color: _navy),
      ),
      const SizedBox(height: 18),
      const _Label('Question Type *'),
      if (_isEdit)
        Text(
          _type.replaceAll('_', ' ').toUpperCase(),
          style: const TextStyle(fontWeight: FontWeight.bold, color: _muted),
        )
      else
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final (value, label) in _questionTypes)
              _Toggle(
                label: label,
                selected: _type == value,
                onTap: () => setState(() {
                  _type = value;
                  _correct.clear();
                  _trueFalse = true;
                }),
              ),
          ],
        ),
      const SizedBox(height: 20),
      TextField(
        controller: _question,
        enabled: !_saving,
        minLines: 3,
        maxLines: 8,
        decoration: const InputDecoration(
          labelText: 'Question *',
          hintText: 'Enter your question',
          alignLabelWithHint: true,
          border: OutlineInputBorder(),
        ),
      ),
      const SizedBox(height: 20),
      if (_hasOptions) ..._optionFields(),
      if (_type == 'true_false') ...[
        const _Label('Correct Answer'),
        Row(
          children: [
            for (final value in [true, false])
              Padding(
                padding: const EdgeInsets.only(right: 10),
                child: _Toggle(
                  label: value ? 'True' : 'False',
                  selected: _trueFalse == value,
                  selectedColor: _green,
                  onTap: () => setState(() => _trueFalse = value),
                ),
              ),
          ],
        ),
        const SizedBox(height: 20),
      ],
      if (_type == 'short_answer' || _type == 'essay') ...[
        TextField(
          controller: _suggested,
          enabled: !_saving,
          minLines: 3,
          maxLines: 8,
          decoration: const InputDecoration(
            labelText: 'Suggested Answer (optional)',
            hintText: 'Model answer for grading',
            helperText: 'For grading reference only.',
            alignLabelWithHint: true,
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 20),
      ],
      Row(
        children: [
          Expanded(
            child: TextField(
              controller: _marks,
              enabled: !_saving,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Marks *',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: _negative,
              enabled: !_saving,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Negative Marks',
                border: OutlineInputBorder(),
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 20),
      const _Label('Difficulty *'),
      Row(
        children: [
          for (final diff in _difficulties)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _Toggle(
                label: '${diff[0].toUpperCase()}${diff.substring(1)}',
                selected: _difficulty == diff,
                onTap: () => setState(() => _difficulty = diff),
              ),
            ),
        ],
      ),
      const SizedBox(height: 20),
      TextField(
        controller: _explanation,
        enabled: !_saving,
        minLines: 2,
        maxLines: 6,
        decoration: const InputDecoration(
          labelText: 'Explanation (optional)',
          hintText: 'Explain why the answer is correct',
          alignLabelWithHint: true,
          border: OutlineInputBorder(),
        ),
      ),
      const SizedBox(height: 22),
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
              onPressed: _saving ? null : _submit,
              style: FilledButton.styleFrom(backgroundColor: _green),
              child: Text(
                _saving
                    ? (_isEdit ? 'Saving...' : 'Creating...')
                    : (_isEdit ? 'Save Changes' : 'Create Question'),
              ),
            ),
          ),
        ],
      ),
    ],
  );

  List<Widget> _optionFields() {
    final single = _type == 'mcq';
    final hint = single
        ? (_correct.isEmpty
              ? 'Tap ✓ to mark the correct answer'
              : '✓ Correct answer selected')
        : (_correct.isEmpty
              ? 'Tap ✓ on every correct answer'
              : '✓ ${_correct.length} correct answer(s) selected');
    return [
      Row(
        children: [
          const Expanded(child: _Label('Options')),
          Text(hint, style: const TextStyle(fontSize: 11, color: _muted)),
        ],
      ),
      for (var i = 0; i < _options.length; i++)
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _options[i],
                  enabled: !_saving,
                  onChanged: (value) {
                    if (value.trim().isEmpty && _correct.remove(i)) {
                      setState(() {});
                    }
                  },
                  decoration: InputDecoration(
                    hintText: 'Option ${i + 1}',
                    isDense: true,
                    filled: _correct.contains(i),
                    fillColor: const Color(0xFFF0FDF4),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: _correct.contains(i) ? _green : _border,
                      ),
                    ),
                    border: const OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              _correct.contains(i)
                  ? IconButton.filled(
                      tooltip: 'Correct answer',
                      onPressed: _saving ? null : () => _toggleCorrect(i),
                      style: IconButton.styleFrom(backgroundColor: _green),
                      icon: const Icon(Icons.check, color: Colors.white),
                    )
                  : IconButton.outlined(
                      tooltip: single
                          ? 'Mark as correct answer'
                          : 'Toggle correct answer',
                      onPressed: _saving ? null : () => _toggleCorrect(i),
                      style: IconButton.styleFrom(
                        foregroundColor: _muted,
                        side: const BorderSide(color: _border),
                      ),
                      icon: const Icon(Icons.check),
                    ),
              if (_options.length > 2)
                IconButton(
                  tooltip: 'Remove option',
                  onPressed: _saving ? null : () => _removeOption(i),
                  color: Colors.red,
                  icon: const Icon(Icons.close, size: 20),
                ),
            ],
          ),
        ),
      Align(
        alignment: Alignment.centerLeft,
        child: TextButton.icon(
          onPressed: _saving
              ? null
              : () => setState(() => _options.add(TextEditingController())),
          style: TextButton.styleFrom(foregroundColor: _green),
          icon: const Icon(Icons.add),
          label: const Text('Add Option'),
        ),
      ),
      const SizedBox(height: 12),
    ];
  }

  void _toggleCorrect(int index) {
    if (_options[index].text.trim().isEmpty) {
      return _notify('Enter the option text first.');
    }
    setState(() {
      if (_type == 'mcq') {
        _correct
          ..clear()
          ..add(index);
      } else if (!_correct.remove(index)) {
        _correct.add(index);
      }
    });
  }

  void _removeOption(int index) => setState(() {
    _options.removeAt(index).dispose();
    // Shift selections above the removed option down by one.
    final shifted = _correct
        .where((i) => i != index)
        .map((i) => i > index ? i - 1 : i)
        .toSet();
    _correct
      ..clear()
      ..addAll(shifted);
  });

  Future<void> _submit() async {
    final text = _question.text.trim();
    final marks = int.tryParse(_marks.text.trim());
    final negative = _negative.text.trim().isEmpty
        ? 0
        : int.tryParse(_negative.text.trim());
    if (text.isEmpty) return _notify('Question is required');
    if (marks == null || marks < 1 || marks > 100) {
      return _notify('Marks must be a whole number from 1 to 100');
    }
    if (negative == null || negative < 0) {
      return _notify('Negative marks must be a whole number of 0 or more');
    }

    List<String>? options;
    Object? correctAnswer;
    String? suggested;
    switch (_type) {
      case 'mcq' || 'multi_select':
        final filled = [
          for (var i = 0; i < _options.length; i++)
            if (_options[i].text.trim().isNotEmpty) i,
        ];
        options = [for (final i in filled) _options[i].text.trim()];
        if (options.length < 2) return _notify('Add at least two options');
        if (options.toSet().length != options.length) {
          return _notify('Each option must be different');
        }
        final correct = [
          for (final i in filled)
            if (_correct.contains(i)) _options[i].text.trim(),
        ];
        if (correct.isEmpty) {
          return _notify(
            _type == 'mcq'
                ? 'Select the correct answer'
                : 'Select at least one correct answer',
          );
        }
        correctAnswer = _type == 'mcq' ? correct.first : correct;
      case 'true_false':
        options = const ['True', 'False'];
        correctAnswer = _trueFalse ? 'true' : 'false';
      default:
        final value = _suggested.text.trim();
        suggested = value.isEmpty ? null : value;
    }

    final explanation = _explanation.text.trim();
    final input = <String, dynamic>{
      'type': _type,
      'question': text,
      'options': ?options,
      'correctAnswer': ?correctAnswer,
      'marks': marks,
      'negativeMarks': negative,
      'difficulty': _difficulty,
    };
    final repository = ref.read(instructorCoursesRepositoryProvider);
    setState(() => _saving = true);
    try {
      if (_isEdit) {
        await repository.updateQuestion(widget.questionId!, {
          ...input,
          // The update endpoint writes fields as given, so send empty strings
          // to let instructors clear these.
          if (_type == 'short_answer' || _type == 'essay')
            'suggestedAnswer': suggested ?? '',
          'explanation': explanation,
        });
        ref.invalidate(instructorQuestionProvider(widget.questionId!));
      } else {
        await repository.createQuestion({
          ...input,
          'courseId': widget.courseId,
          'suggestedAnswer': ?suggested,
          if (explanation.isNotEmpty) 'explanation': explanation,
        });
      }
      ref.invalidate(instructorQuestionsProvider(widget.courseId));
      if (!mounted) return;
      _notify(_isEdit ? 'Question updated' : 'Question created');
      context.go('/instructor/courses/${widget.courseId}/questions');
    } catch (error) {
      _notify(
        apiErrorMessage(
          error,
          fallback: _isEdit
              ? 'Failed to update question'
              : 'Failed to create question',
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _back() => context.canPop()
      ? context.pop()
      : context.go('/instructor/courses/${widget.courseId}/questions');

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _BulkImportSheet extends ConsumerStatefulWidget {
  const _BulkImportSheet({required this.courseId});
  final String courseId;
  @override
  ConsumerState<_BulkImportSheet> createState() => _BulkImportSheetState();
}

class _BulkImportSheetState extends ConsumerState<_BulkImportSheet> {
  PlatformFile? _file;
  List<int>? _bytes;
  bool _importing = false, _showTemplate = false;
  QuestionImportResult? _result;

  @override
  Widget build(BuildContext context) {
    final result = _result;
    return SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * .85,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Bulk Import Questions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Upload a CSV file to import multiple questions at once',
                style: TextStyle(fontSize: 12, color: _muted),
              ),
              const SizedBox(height: 14),
              _templateCard(),
              const SizedBox(height: 14),
              if (result == null) ..._picker() else ..._results(result),
            ],
          ),
        ),
      ),
    );
  }

  Widget _templateCard() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xFFF9F6F0),
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.description_outlined, color: Color(0xFFB8912F)),
            const SizedBox(width: 10),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Need a template?',
                    style: TextStyle(fontWeight: FontWeight.w600, color: _navy),
                  ),
                  Text(
                    'CSV columns and examples',
                    style: TextStyle(fontSize: 11, color: _muted),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => setState(() => _showTemplate = !_showTemplate),
              child: Text(_showTemplate ? 'Hide' : 'Show'),
            ),
          ],
        ),
        if (_showTemplate) ...[
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: _border),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Text(
                _csvTemplate,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
              ),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'correct_answer uses option letters (A, or "A,B,C" for multi '
            'select), or True/False.',
            style: TextStyle(fontSize: 11, color: _muted),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () async {
                await Clipboard.setData(
                  const ClipboardData(text: _csvTemplate),
                );
                _notify('Template copied');
              },
              icon: const Icon(Icons.copy, size: 16),
              label: const Text('Copy CSV template'),
            ),
          ),
        ],
      ],
    ),
  );

  List<Widget> _picker() => [
    Material(
      color: _cream,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: _border, width: 2),
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        onTap: _importing ? null : _pick,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 12),
          child: Column(
            children: [
              const Icon(Icons.upload_file, size: 32, color: _muted),
              const SizedBox(height: 8),
              Text(
                _file?.name ?? 'Tap to choose a CSV file',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'CSV only, max 5MB (up to ~1,000 questions)',
                style: TextStyle(fontSize: 11, color: _muted),
              ),
            ],
          ),
        ),
      ),
    ),
    if (_file != null) ...[
      const SizedBox(height: 14),
      Row(
        children: [
          OutlinedButton(
            onPressed: _importing
                ? null
                : () => setState(() {
                    _file = null;
                    _bytes = null;
                  }),
            child: const Text('Clear'),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: FilledButton(
              onPressed: _importing ? null : _import,
              style: FilledButton.styleFrom(backgroundColor: _green),
              child: Text(_importing ? 'Importing...' : 'Import Questions'),
            ),
          ),
        ],
      ),
    ],
  ];

  List<Widget> _results(QuestionImportResult result) => [
    Row(
      children: [
        _ResultTile(value: result.total, label: 'Total Rows'),
        const SizedBox(width: 8),
        _ResultTile(
          value: result.imported,
          label: 'Imported',
          color: _green,
          background: const Color(0xFFF0FDF4),
        ),
        const SizedBox(width: 8),
        _ResultTile(
          value: result.failed,
          label: 'Failed',
          color: result.failed > 0 ? Colors.red : _navy,
          background: result.failed > 0 ? const Color(0xFFFEF2F2) : _cream,
        ),
      ],
    ),
    const SizedBox(height: 14),
    if (result.imported > 0 && result.failed == 0)
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          border: Border.all(color: const Color(0xFFBBF7D0)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: _green),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'All questions imported successfully. ${result.imported} '
                'questions added to this course.',
                style: const TextStyle(color: _navy),
              ),
            ),
          ],
        ),
      ),
    if (result.errors.isNotEmpty)
      Container(
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFFECACA)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              color: const Color(0xFFFEF2F2),
              child: Text(
                '${result.errors.length} row(s) had errors',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFB91C1C),
                ),
              ),
            ),
            for (final error in result.errors)
              Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Row ${error.row}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(child: Text(error.message)),
                  ],
                ),
              ),
          ],
        ),
      ),
    const SizedBox(height: 14),
    Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => setState(() {
              _result = null;
              _file = null;
              _bytes = null;
            }),
            child: const Text('Import Another'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: FilledButton(
            onPressed: () => Navigator.pop(context),
            style: FilledButton.styleFrom(backgroundColor: _green),
            child: const Text('Done'),
          ),
        ),
      ],
    ),
  ];

  Future<void> _pick() async {
    try {
      // .csv has no dependable MIME filter across Android file providers, so
      // pick any file and check the extension.
      final file = await FilePicker.pickFile();
      if (file == null) return;
      if (file.extension?.toLowerCase() != 'csv') {
        return _notify('Only CSV files are allowed');
      }
      final bytes = await file.readAsBytes();
      if (bytes.isEmpty) return _notify('The selected file is empty.');
      if (bytes.length > _maxCsvBytes) {
        return _notify('File size exceeds 5MB');
      }
      setState(() {
        _file = file;
        _bytes = bytes;
      });
    } catch (_) {
      _notify('Could not open the selected file.');
    }
  }

  Future<void> _import() async {
    final file = _file, bytes = _bytes;
    if (file == null || bytes == null) return;
    setState(() => _importing = true);
    try {
      final result = await ref
          .read(instructorCoursesRepositoryProvider)
          .importQuestions(widget.courseId, bytes, file.name);
      ref.invalidate(instructorQuestionsProvider(widget.courseId));
      if (!mounted) return;
      setState(() {
        _result = result;
        if (result.failed == 0) {
          _file = null;
          _bytes = null;
        }
      });
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to import questions'));
    } finally {
      if (mounted) setState(() => _importing = false);
    }
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _ResultTile extends StatelessWidget {
  const _ResultTile({
    required this.value,
    required this.label,
    this.color = _navy,
    this.background = _cream,
  });
  final int value;
  final String label;
  final Color color, background;

  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(
            '$value',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(label, style: const TextStyle(fontSize: 11, color: _muted)),
        ],
      ),
    ),
  );
}

class _Toggle extends StatelessWidget {
  const _Toggle({
    required this.label,
    required this.selected,
    required this.onTap,
    this.selectedColor = _deepNavy,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color selectedColor;

  @override
  Widget build(BuildContext context) => Material(
    color: selected ? selectedColor : Colors.white,
    shape: RoundedRectangleBorder(
      side: BorderSide(color: selected ? selectedColor : _border),
      borderRadius: BorderRadius.circular(8),
    ),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : _navy,
          ),
        ),
      ),
    ),
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

class _Message extends StatelessWidget {
  const _Message({required this.text, this.action});
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

(String, Color) _typeBadge(String type) => switch (type) {
  'mcq' => ('MCQ', const Color(0xFF2563EB)),
  'multi_select' => ('MULTI SELECT', const Color(0xFF7C3AED)),
  'true_false' => ('TRUE/FALSE', _green),
  'short_answer' => ('SHORT ANSWER', const Color(0xFFB8912F)),
  'essay' => ('ESSAY', const Color(0xFFEA580C)),
  _ => (type.toUpperCase(), _muted),
};

Color _difficultyColor(String difficulty) => switch (difficulty) {
  'easy' => _green,
  'medium' => const Color(0xFFB8912F),
  'hard' => const Color(0xFFDC2626),
  _ => _muted,
};

// Mirrors frontend/public/templates/questions-template.csv.
const _csvTemplate =
    'type,question,option_a,option_b,option_c,option_d,option_e,correct_answer,suggested_answer,marks,negative_marks,difficulty,explanation\n'
    'mcq,What is the meaning of Tawheed?,The Oneness of Allah,The five daily prayers,Fasting in Ramadan,Giving charity,,A,,2,0,easy,Tawheed is the belief in the absolute Oneness of Allah.\n'
    'multi_select,Which are pillars of Islam?,Salah,Sawm,Zakat,Wudu,,"A,B,C",,3,1,medium,The five pillars are Shahada Salah Sawm Zakat Hajj.\n'
    'true_false,The Quran was revealed over 23 years.,True,False,,,,True,,1,0,easy,It was revealed gradually over 23 years.\n'
    'short_answer,Explain Ihsan briefly.,,,,,,,Worshipping Allah as if you see Him and knowing He sees you.,5,0,hard,The highest level of faith.\n'
    'essay,Compare the two migrations.,,,,,,,Discuss the migration to Habasha and Hijra with reasons challenges and outcomes.,10,0,hard,Analytical question on early Islamic history.';
