import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/exam_models.dart';
import '../exams_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class ExamResultPage extends ConsumerWidget {
  const ExamResultPage({
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
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(child: Text('Select a learner profile first.'));
    }
    final resultKey = '$examId|${profile.id}';
    final examsKey = '$courseId|${profile.id}';
    final resultAsync = ref.watch(examResultProvider(resultKey));
    final examsAsync = ref.watch(courseExamsProvider(examsKey));
    return resultAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _ResultError(
        onRetry: () => ref.invalidate(examResultProvider(resultKey)),
        onBack: () => context.go(_examsPath),
      ),
      data: (data) {
        final best = data.bestAttempt;
        final latest = data.attempts.isEmpty ? null : data.attempts.last;
        final pending = latest != null && !latest.graded;
        final passed = best?.passed == true;
        final examSummary = examsAsync.asData?.value
            .where((e) => e.id == examId)
            .firstOrNull;
        final accessStart = data.exam.openDate == null
            ? null
            : DateTime.tryParse(data.exam.openDate!)?.toLocal();
        final now = DateTime.now();
        final accessOpen =
            accessStart == null ||
            (!now.isBefore(accessStart) &&
                !now.isAfter(
                  accessStart.add(Duration(seconds: data.exam.duration * 30)),
                ));
        final canRetry =
            examsAsync.hasValue &&
            !passed &&
            !pending &&
            accessOpen &&
            examSummary != null &&
            (examSummary.maxAttempts == null ||
                examSummary.attemptCount < examSummary.maxAttempts!);
        final total = best?.totalMarks ?? data.exam.totalMarks;
        final score = best?.score;
        final percent = score == null || total == 0
            ? null
            : (score / total * 100).round();
        return ListView(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 32),
          children: [
            TextButton.icon(
              onPressed: () => context.go(_examsPath),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: const Text('Back to exams'),
              style: TextButton.styleFrom(
                alignment: Alignment.centerLeft,
                foregroundColor: const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE3E8EF)),
              ),
              child: Column(
                children: [
                  Container(
                    width: 66,
                    height: 66,
                    decoration: BoxDecoration(
                      color: passed
                          ? _green.withValues(alpha: .1)
                          : pending
                          ? const Color(0xFFFFF7ED)
                          : const Color(0xFFFEF2F2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      passed
                          ? Icons.emoji_events_outlined
                          : pending
                          ? Icons.hourglass_top
                          : Icons.cancel_outlined,
                      size: 36,
                      color: passed
                          ? _green
                          : pending
                          ? Colors.orange
                          : Colors.red,
                    ),
                  ),
                  const SizedBox(height: 13),
                  Text(
                    data.exam.title,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: const Color(0xFF0C1F33),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    passed
                        ? 'Congratulations! You passed.'
                        : pending
                        ? 'Your written answers are being graded.'
                        : 'You did not pass. Review your answers and try again.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: passed
                          ? _green
                          : pending
                          ? Colors.orange.shade800
                          : Colors.red.shade700,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (score != null) ...[
                    const SizedBox(height: 19),
                    Text(
                      '${_number(score)} / $total',
                      style: const TextStyle(
                        fontSize: 34,
                        color: Color(0xFF0C1F33),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'Pass mark: ${data.exam.passMark}%  •  ${data.exam.duration} mins',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      _Stat(
                        icon: Icons.track_changes,
                        label: 'Score',
                        value: percent == null ? '—' : '$percent%',
                      ),
                      const SizedBox(width: 8),
                      _Stat(
                        icon: Icons.description_outlined,
                        label: 'Attempts',
                        value: '${data.attempts.length}',
                      ),
                      const SizedBox(width: 8),
                      _Stat(
                        icon: Icons.timer_outlined,
                        label: 'Time taken',
                        value: _timeTaken(latest),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (data.attempts.isNotEmpty) ...[
              const SizedBox(height: 18),
              const _SectionTitle('Attempt history'),
              const SizedBox(height: 9),
              ...data.attempts.map((attempt) => _AttemptTile(attempt: attempt)),
            ],
            if (data.questionResults.isNotEmpty) ...[
              const SizedBox(height: 18),
              const _SectionTitle('Question review'),
              const SizedBox(height: 4),
              const Text(
                'Review your responses and the correct answers.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 10),
              ...data.questionResults.asMap().entries.map(
                (entry) =>
                    _QuestionReview(index: entry.key + 1, item: entry.value),
              ),
              const SizedBox(height: 5),
              Text(
                best == null
                    ? 'No attempts found.'
                    : 'Showing answers from Attempt #${best.attemptNumber}.',
                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.go(_examsPath),
                    child: const Text('Back to exams'),
                  ),
                ),
                if (canRetry) ...[
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      onPressed: () => context.go(
                        '/my-courses/$courseId/exams/$examId/take${onlineClass ? '?online=true' : ''}',
                      ),
                      style: FilledButton.styleFrom(backgroundColor: _green),
                      child: const Text('Retake exam'),
                    ),
                  ),
                ],
              ],
            ),
          ],
        );
      },
    );
  }
}

class _QuestionReview extends StatelessWidget {
  const _QuestionReview({required this.index, required this.item});
  final int index;
  final ExamQuestionResult item;
  @override
  Widget build(BuildContext context) {
    final written = item.type == 'short_answer' || item.type == 'essay';
    final graded = written && item.marksAwarded != null;
    final correct = _answersEqual(item.myAnswer, item.correctAnswer);
    final color = written && !graded
        ? Colors.orange
        : correct
        ? _green
        : Colors.red;
    return Container(
      margin: const EdgeInsets.only(bottom: 11),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE3E8EF)),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBF9F4),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '$index',
                    style: const TextStyle(
                      color: Color(0xFFB8912F),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.question,
                        style: const TextStyle(
                          height: 1.4,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0C1F33),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${item.marks} ${item.marks == 1 ? 'mark' : 'marks'}${graded ? ' • ${_number(item.marksAwarded!)} awarded' : ''}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  written && !graded
                      ? Icons.hourglass_top
                      : correct
                      ? Icons.check_circle_outline
                      : Icons.cancel_outlined,
                  color: color,
                  size: 20,
                ),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            color: const Color(0xFFFAFBFC),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (written) ...[
                  _AnswerBlock(
                    label: 'Your answer',
                    value: _answerText(item.myAnswer),
                    tint: written && !graded
                        ? const Color(0xFFFFF7ED)
                        : correct
                        ? const Color(0xFFF0FDF4)
                        : const Color(0xFFFEF2F2),
                  ),
                  if (item.suggestedAnswer?.isNotEmpty == true) ...[
                    const SizedBox(height: 10),
                    _AnswerBlock(
                      label: 'Suggested answer',
                      value: item.suggestedAnswer!,
                      tint: const Color(0xFFF0FDF4),
                    ),
                  ],
                ] else if (item.options.isNotEmpty) ...[
                  ...item.options.map((option) {
                    final selected = _asList(item.myAnswer).contains(option);
                    final isCorrect = _asList(
                      item.correctAnswer,
                    ).contains(option);
                    final optionColor = isCorrect
                        ? _green
                        : selected
                        ? Colors.red
                        : const Color(0xFFE3E8EF);
                    return Container(
                      margin: const EdgeInsets.only(top: 7),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isCorrect
                            ? const Color(0xFFF0FDF4)
                            : selected
                            ? const Color(0xFFFEF2F2)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: optionColor.withValues(alpha: .55),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isCorrect
                                ? Icons.check_circle_outline
                                : selected
                                ? Icons.cancel_outlined
                                : Icons.radio_button_unchecked,
                            size: 17,
                            color: optionColor,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              option,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF0C1F33),
                              ),
                            ),
                          ),
                          if (selected)
                            Text(
                              'Your answer',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: optionColor,
                              ),
                            ),
                        ],
                      ),
                    );
                  }),
                ] else ...[
                  _AnswerBlock(
                    label: 'Your answer',
                    value: _answerText(item.myAnswer),
                    tint: correct
                        ? const Color(0xFFF0FDF4)
                        : const Color(0xFFFEF2F2),
                  ),
                  const SizedBox(height: 10),
                  _AnswerBlock(
                    label: 'Correct answer',
                    value: _answerText(item.correctAnswer),
                    tint: const Color(0xFFF0FDF4),
                  ),
                ],
                if (item.explanation?.isNotEmpty == true) ...[
                  const SizedBox(height: 12),
                  const Text(
                    'Explanation',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.explanation!,
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.4,
                      color: Color(0xFF475569),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AnswerBlock extends StatelessWidget {
  const _AnswerBlock({
    required this.label,
    required this.value,
    required this.tint,
  });
  final String label, value;
  final Color tint;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: Color(0xFF64748B),
        ),
      ),
      const SizedBox(height: 4),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: tint,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            height: 1.35,
            color: Color(0xFF334155),
          ),
        ),
      ),
    ],
  );
}

class _AttemptTile extends StatelessWidget {
  const _AttemptTile({required this.attempt});
  final ExamAttempt attempt;
  @override
  Widget build(BuildContext context) {
    final status = !attempt.graded
        ? 'PENDING'
        : attempt.passed == true
        ? 'PASSED'
        : 'FAILED';
    final color = !attempt.graded
        ? Colors.orange
        : attempt.passed == true
        ? _green
        : Colors.red;
    final date = DateTime.tryParse(attempt.startedAt ?? '')?.toLocal();
    return Container(
      margin: const EdgeInsets.only(bottom: 7),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF9F4),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Attempt #${attempt.attemptNumber}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0C1F33),
                  ),
                ),
                if (date != null)
                  Text(
                    DateFormat('MMM d, y • h:mm a').format(date),
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF64748B),
                    ),
                  ),
              ],
            ),
          ),
          Text(
            status,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '${attempt.score == null ? '—' : _number(attempt.score!)}/${attempt.totalMarks}',
            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label, value;
  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF9F4),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFFB8912F), size: 18),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFF0C1F33),
            ),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 9, color: Color(0xFF64748B)),
          ),
        ],
      ),
    ),
  );
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w700,
      color: Color(0xFF0C1F33),
    ),
  );
}

class _ResultError extends StatelessWidget {
  const _ResultError({required this.onRetry, required this.onBack});
  final VoidCallback onRetry, onBack;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Could not load exam results.',
            style: TextStyle(color: Colors.red),
          ),
          TextButton(onPressed: onRetry, child: const Text('Try again')),
          TextButton(onPressed: onBack, child: const Text('Back to exams')),
        ],
      ),
    ),
  );
}

List<String> _asList(Object? value) => value == null
    ? const []
    : value is List
    ? value.map((e) => '$e').toList()
    : ['$value'];
String _answerText(Object? value) => value == null
    ? 'Not answered'
    : value is List
    ? value.join(', ')
    : '$value';
bool _answersEqual(Object? a, Object? b) {
  final first = _asList(a), second = _asList(b);
  if (first.length != second.length) return false;
  return first.toSet().containsAll(second);
}

String _number(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);
String _timeTaken(ExamAttempt? attempt) {
  if (attempt?.startedAt == null || attempt?.submittedAt == null) return '—';
  final start = DateTime.tryParse(attempt!.startedAt!);
  final end = DateTime.tryParse(attempt.submittedAt!);
  if (start == null || end == null) return '—';
  final minutes = end.difference(start).inMinutes.clamp(1, 999999);
  return '${minutes}m';
}
