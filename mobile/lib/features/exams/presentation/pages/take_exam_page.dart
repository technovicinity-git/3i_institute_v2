import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/exam_models.dart';
import '../exams_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class TakeExamPage extends ConsumerStatefulWidget {
  const TakeExamPage({
    required this.courseId,
    required this.examId,
    this.onlineClass = false,
    super.key,
  });
  final String courseId, examId;
  final bool onlineClass;

  String get _examsPath =>
      '/my-courses/$courseId/exams${onlineClass ? '?online=true' : ''}';
  @override
  ConsumerState<TakeExamPage> createState() => _TakeExamPageState();
}

class _TakeExamPageState extends ConsumerState<TakeExamPage> {
  final Map<String, Object> _answers = {};
  final Map<String, TextEditingController> _textControllers = {};
  Timer? _timer;
  DateTime? _startedAt;
  int? _secondsLeft;
  int _current = 0;
  bool _submitting = false;

  @override
  void dispose() {
    _timer?.cancel();
    for (final controller in _textControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  TextEditingController _textControllerFor(ExamQuestion question) =>
      _textControllers.putIfAbsent(
        question.id,
        () =>
            TextEditingController(text: _answers[question.id] as String? ?? ''),
      );

  void _startTimer(int seconds) {
    if (_timer != null) return;
    _startedAt = DateTime.now();
    _secondsLeft = seconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      final remaining = (_secondsLeft ?? 0) - 1;
      setState(() => _secondsLeft = remaining.clamp(0, 999999));
      if (remaining <= 0) {
        timer.cancel();
        _submit(auto: true);
      }
    });
  }

  Future<void> _submit({bool auto = false}) async {
    if (_submitting) return;
    final profile = ref.read(activeLearnerProfileProvider);
    final data = ref.read(examQuestionsProvider(widget.examId)).asData?.value;
    if (profile == null || data == null) return;
    if (!auto && !_answers.isNotEmpty) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Submit without answers?'),
          content: const Text(
            'You have not answered any questions. Do you want to submit this exam?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Continue exam'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Submit'),
            ),
          ],
        ),
      );
      if (confirm != true || !mounted) return;
    } else if (!auto) {
      final unanswered = data.questions.length - _answers.length;
      if (unanswered > 0) {
        final confirm = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Submit exam?'),
            content: Text(
              '$unanswered question${unanswered == 1 ? '' : 's'} unanswered. You cannot change your answers after submission.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Review'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Submit'),
              ),
            ],
          ),
        );
        if (confirm != true || !mounted) return;
      }
    }
    setState(() => _submitting = true);
    _timer?.cancel();
    try {
      await ref
          .read(examsRepositoryProvider)
          .submitExam(
            examId: widget.examId,
            profileId: profile.id,
            answers: _answers,
            startedAt: _startedAt ?? DateTime.now(),
            questions: data.questions,
          );
      ref.invalidate(courseExamsProvider('${widget.courseId}|${profile.id}'));
      ref.invalidate(examResultProvider('${widget.examId}|${profile.id}'));
      if (mounted) {
        context.go(
          '/my-courses/${widget.courseId}/exams/${widget.examId}/result${widget.onlineClass ? '?online=true' : ''}',
        );
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(
              error,
              fallback: 'Could not submit your exam. Please try again.',
            ),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncData = ref.watch(examQuestionsProvider(widget.examId));
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(child: Text('Select a learner profile first.'));
    }
    return asyncData.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _LoadingError(
        onRetry: () => ref.invalidate(examQuestionsProvider(widget.examId)),
      ),
      data: (data) {
        final start = data.exam.openDate == null
            ? null
            : DateTime.tryParse(data.exam.openDate!)?.toLocal();
        final now = DateTime.now();
        final upcoming = start != null && now.isBefore(start);
        final closed =
            start != null &&
            now.isAfter(start.add(Duration(seconds: data.exam.duration * 30)));
        if (upcoming || closed) {
          return _AccessMessage(
            title: upcoming ? 'Exam not started yet' : 'Start window closed',
            text: upcoming
                ? 'This exam starts ${MaterialLocalizations.of(context).formatFullDate(start)} at ${MaterialLocalizations.of(context).formatTimeOfDay(TimeOfDay.fromDateTime(start))}. You can start it during the first half of its duration.'
                : 'The start window has passed. Return to the exam list to review your results.',
            onBack: () => context.go(widget._examsPath),
          );
        }
        if (data.questions.isEmpty) {
          return _AccessMessage(
            title: 'No questions available',
            text: 'This exam does not have any questions yet.',
            onBack: () => context.go(widget._examsPath),
          );
        }
        _startTimer(data.exam.duration * 60);
        final question = data.questions[_current];
        final answered = _answers.length;
        return SafeArea(
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: const Color(0xFFE3E8EF)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Question ${_current + 1} of ${data.questions.length}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0C1F33),
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '$answered answered',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.timer_outlined,
                              size: 20,
                              color: (_secondsLeft ?? 0) < 300
                                  ? Colors.red
                                  : _navy,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              _formatTime(
                                _secondsLeft ?? data.exam.duration * 60,
                              ),
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 18,
                                color: (_secondsLeft ?? 0) < 300
                                    ? Colors.red
                                    : _navy,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'of ${data.exam.duration} minutes',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 18),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE3E8EF)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUESTION ${_current + 1}  •  ${question.marks} ${question.marks == 1 ? 'mark' : 'marks'}',
                          style: const TextStyle(
                            fontSize: 12,
                            letterSpacing: .4,
                            color: Color(0xFF64748B),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 11),
                        Text(
                          question.question,
                          style: const TextStyle(
                            fontSize: 18,
                            height: 1.45,
                            color: Color(0xFF0C1F33),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 18),
                        if (question.type == 'mcq' ||
                            question.type == 'true_false' ||
                            question.type == 'multi_select')
                          ...question.options.map((option) {
                            final currentAnswer = _answers[question.id];
                            final selected = question.type == 'multi_select'
                                ? currentAnswer is List &&
                                      currentAnswer.contains(option)
                                : currentAnswer == option;
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 9),
                              child: Material(
                                color: selected
                                    ? const Color(0xFFF4F8FF)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(10),
                                  onTap: () => setState(() {
                                    if (question.type == 'multi_select') {
                                      final options = currentAnswer is List
                                          ? List<String>.from(currentAnswer)
                                          : <String>[];
                                      if (options.contains(option)) {
                                        options.remove(option);
                                      } else {
                                        options.add(option);
                                      }
                                      if (options.isEmpty) {
                                        _answers.remove(question.id);
                                      } else {
                                        _answers[question.id] = options;
                                      }
                                    } else {
                                      _answers[question.id] = option;
                                    }
                                  }),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 13,
                                    ),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: selected
                                            ? const Color(0xFF2D6CDF)
                                            : const Color(0xFFE3E8EF),
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          question.type == 'multi_select'
                                              ? (selected
                                                    ? Icons.check_box
                                                    : Icons
                                                          .check_box_outline_blank)
                                              : (selected
                                                    ? Icons.radio_button_checked
                                                    : Icons.radio_button_off),
                                          color: selected
                                              ? const Color(0xFF2D6CDF)
                                              : const Color(0xFF94A3B8),
                                          size: 20,
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            option,
                                            style: const TextStyle(
                                              color: Color(0xFF0C1F33),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          })
                        else
                          TextField(
                            key: ValueKey(question.id),
                            controller: _textControllerFor(question),
                            onChanged: (value) => setState(() {
                              if (value.trim().isEmpty) {
                                _answers.remove(question.id);
                              } else {
                                _answers[question.id] = value;
                              }
                            }),
                            minLines: question.type == 'essay' ? 7 : 4,
                            maxLines: question.type == 'essay' ? 12 : 6,
                            textCapitalization: TextCapitalization.sentences,
                            decoration: InputDecoration(
                              hintText: 'Type your answer...',
                              alignLabelWithHint: true,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
                child: Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: _current == 0
                          ? null
                          : () => setState(() => _current--),
                      icon: const Icon(Icons.chevron_left),
                      label: const Text('Previous'),
                    ),
                    const Spacer(),
                    if (_current < data.questions.length - 1)
                      FilledButton.icon(
                        onPressed: () => setState(() => _current++),
                        iconAlignment: IconAlignment.end,
                        icon: const Icon(Icons.chevron_right),
                        label: const Text('Next'),
                        style: FilledButton.styleFrom(backgroundColor: _navy),
                      )
                    else
                      FilledButton.icon(
                        onPressed: _submitting ? null : () => _submit(),
                        icon: const Icon(Icons.check_circle_outline),
                        label: Text(
                          _submitting ? 'Submitting…' : 'Submit exam',
                        ),
                        style: FilledButton.styleFrom(backgroundColor: _green),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

String _formatTime(int seconds) =>
    '${(seconds ~/ 60).toString().padLeft(2, '0')}:${(seconds % 60).toString().padLeft(2, '0')}';

class _AccessMessage extends StatelessWidget {
  const _AccessMessage({
    required this.title,
    required this.text,
    required this.onBack,
  });
  final String title, text;
  final VoidCallback onBack;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.lock_clock_outlined,
            size: 48,
            color: Color(0xFFB8912F),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 9),
          Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 18),
          OutlinedButton(onPressed: onBack, child: const Text('Back to exams')),
        ],
      ),
    ),
  );
}

class _LoadingError extends StatelessWidget {
  const _LoadingError({required this.onRetry});
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.cloud_off_outlined,
            size: 44,
            color: Color(0xFF94A3B8),
          ),
          const SizedBox(height: 12),
          const Text('Could not load this exam.'),
          TextButton(onPressed: onRetry, child: const Text('Try again')),
        ],
      ),
    ),
  );
}
