import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/exam_models.dart';
import '../exams_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class CourseExamsPage extends ConsumerWidget {
  const CourseExamsPage({
    required this.courseId,
    this.onlineClass = false,
    super.key,
  });
  final String courseId;
  final bool onlineClass;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(child: Text('Select a learner profile first.'));
    }
    final key = '$courseId|${profile.id}';
    final asyncExams = ref.watch(courseExamsProvider(key));
    return asyncExams.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _StateCard(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load exams',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(courseExamsProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (exams) => RefreshIndicator(
        color: _navy,
        onRefresh: () => ref.refresh(courseExamsProvider(key).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          children: [
            TextButton.icon(
              onPressed: () =>
                  context.go(onlineClass ? '/online-classes' : '/my-courses'),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: Text(
                onlineClass
                    ? 'Back to Online Classes'
                    : 'Back to Regular Courses',
              ),
              style: TextButton.styleFrom(
                alignment: Alignment.centerLeft,
                foregroundColor: const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Exams',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: const Color(0xFF0C1F33),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${exams.length} exam${exams.length == 1 ? '' : 's'} available',
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
            if (exams.isEmpty)
              const _StateCard(
                icon: Icons.description_outlined,
                title: 'No exams available',
                message: 'There are no exams for this course yet.',
              )
            else
              ...exams.map(
                (exam) => _ExamCard(
                  exam: exam,
                  courseId: courseId,
                  onlineClass: onlineClass,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ExamCard extends StatelessWidget {
  const _ExamCard({
    required this.exam,
    required this.courseId,
    required this.onlineClass,
  });
  final LearnerExam exam;
  final String courseId;
  final bool onlineClass;

  String get _onlineQuery => onlineClass ? '?online=true' : '';

  @override
  Widget build(BuildContext context) {
    final access = _access(exam.openDate, exam.duration);
    final maxReached =
        exam.maxAttempts != null && exam.attemptCount >= exam.maxAttempts!;
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 7,
              runSpacing: 6,
              children: [
                _Badge(
                  text: exam.type.toUpperCase(),
                  color: exam.type == 'final'
                      ? const Color(0xFFB42318)
                      : const Color(0xFF2563EB),
                ),
                if (exam.passed == true)
                  const _Badge(text: 'PASSED', color: _green),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              exam.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 14,
              runSpacing: 8,
              children: [
                _Meta(icon: Icons.schedule, text: '${exam.duration} min'),
                _Meta(
                  icon: Icons.quiz_outlined,
                  text: exam.maxAttempts == null
                      ? 'Random questions'
                      : '${exam.questions.length} questions',
                ),
                _Meta(
                  icon: Icons.flag_outlined,
                  text: 'Pass ${exam.passMark}%',
                ),
                _Meta(
                  icon: Icons.replay,
                  text:
                      'Attempts ${exam.maxAttempts == null ? exam.attemptCount : '${exam.attemptCount}/${exam.maxAttempts}'}',
                ),
              ],
            ),
            if (exam.bestScore != null) ...[
              const SizedBox(height: 9),
              Text(
                'Best score: ${_number(exam.bestScore!)}/${exam.totalMarks}',
                style: const TextStyle(
                  color: _green,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ],
            const SizedBox(height: 14),
            Wrap(
              spacing: 9,
              runSpacing: 8,
              children: [
                if (exam.attemptCount > 0)
                  OutlinedButton.icon(
                    onPressed: () => context.push(
                      '/my-courses/$courseId/exams/${exam.id}/result$_onlineQuery',
                    ),
                    icon: const Icon(Icons.bar_chart, size: 18),
                    label: const Text('View result'),
                  ),
                if (maxReached)
                  const Chip(
                    avatar: Icon(Icons.block, size: 17),
                    label: Text('Max attempts reached'),
                  )
                else if (access.status == _AccessStatus.upcoming)
                  Chip(
                    avatar: const Icon(Icons.schedule, size: 17),
                    label: Text('Starts ${_formatDate(access.start!)}'),
                  )
                else if (access.status == _AccessStatus.closed)
                  const Chip(
                    avatar: Icon(Icons.lock_outline, size: 17),
                    label: Text('Start window closed'),
                  )
                else
                  FilledButton.icon(
                    onPressed: () => context.push(
                      '/my-courses/$courseId/exams/${exam.id}/take$_onlineQuery',
                    ),
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: const Text('Take exam'),
                    style: FilledButton.styleFrom(backgroundColor: _green),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 15, color: const Color(0xFF64748B)),
      const SizedBox(width: 5),
      Text(
        text,
        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
      ),
    ],
  );
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, required this.color});
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .1),
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      text,
      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color),
    ),
  );
}

class _StateCard extends StatelessWidget {
  const _StateCard({
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
    margin: const EdgeInsets.only(top: 20),
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 38, color: const Color(0xFF94A3B8)),
        const SizedBox(height: 10),
        Text(
          title,
          style: const TextStyle(color: _navy, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 5),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Color(0xFF64748B)),
        ),
        ?action,
      ],
    ),
  );
}

enum _AccessStatus { open, upcoming, closed }

class _Access {
  const _Access(this.status, this.start);
  final _AccessStatus status;
  final DateTime? start;
}

_Access _access(String? value, int duration) {
  final start = value == null ? null : DateTime.tryParse(value)?.toLocal();
  if (start == null) {
    return const _Access(_AccessStatus.open, null);
  }
  final now = DateTime.now();
  if (now.isBefore(start)) {
    return _Access(_AccessStatus.upcoming, start);
  }
  if (now.isAfter(start.add(Duration(seconds: duration * 30)))) {
    return _Access(_AccessStatus.closed, start);
  }
  return _Access(_AccessStatus.open, start);
}

String _formatDate(DateTime value) =>
    DateFormat('MMM d, y • h:mm a').format(value);
String _number(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);
