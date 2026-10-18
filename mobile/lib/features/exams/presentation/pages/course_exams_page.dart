import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/exam_access.dart';
import '../../domain/exam_models.dart';
import '../exams_providers.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../../core/format/date_format.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);
const _amber = Color(0xFFB45309);
const _yellow = Color(0xFFA16207);
const _red = Color(0xFFDC2626);

// Below this many seconds left, countdowns turn red.
const _urgentSec = 5 * 60;

class CourseExamsPage extends ConsumerStatefulWidget {
  const CourseExamsPage({
    required this.courseId,
    this.onlineClass = false,
    super.key,
  });
  final String courseId;
  final bool onlineClass;

  @override
  ConsumerState<CourseExamsPage> createState() => _CourseExamsPageState();
}

class _CourseExamsPageState extends ConsumerState<CourseExamsPage>
    with WidgetsBindingObserver {
  // Ticks every second so the start / start-window countdowns stay live.
  Timer? _ticker;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _ticker?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _tick();
  }

  void _tick() {
    if (mounted) setState(() => _now = DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    final courseId = widget.courseId;
    final onlineClass = widget.onlineClass;
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Center(child: Text(context.l10n.examsSelectProfileFirst));
    }
    final key = '$courseId|${profile.id}';
    final asyncExams = ref.watch(courseExamsProvider(key));
    // Attempts started on this device but not submitted yet.
    final sessionDeadlines =
        ref.watch(activeExamSessionsProvider(profile.id)).asData?.value ??
        const <String, DateTime>{};
    return asyncExams.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _StateCard(
        icon: Icons.cloud_off_outlined,
        title: context.l10n.examsLoadFailed,
        message: context.l10n.commonCheckConnection,
        action: TextButton(
          onPressed: () => ref.invalidate(courseExamsProvider(key)),
          child: Text(context.l10n.commonTryAgain),
        ),
      ),
      data: (exams) => RefreshIndicator(
        color: _navy,
        onRefresh: () {
          ref.invalidate(activeExamSessionsProvider(profile.id));
          return ref.refresh(courseExamsProvider(key).future);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          children: [
            TextButton.icon(
              onPressed: () =>
                  context.go(onlineClass ? '/online-classes' : '/my-courses'),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: Text(
                onlineClass
                    ? context.l10n.examsBackOnline
                    : context.l10n.examsBackRegular,
              ),
              style: TextButton.styleFrom(
                alignment: Alignment.centerLeft,
                foregroundColor: const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              context.l10n.examsTitle,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: const Color(0xFF0C1F33),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              context.l10n.examsAvailable(exams.length),
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),
            if (exams.isEmpty)
              _StateCard(
                icon: Icons.description_outlined,
                title: context.l10n.examsNone,
                message: context.l10n.examsNoneBody,
              )
            else
              ...exams.map(
                (exam) => _ExamCard(
                  exam: exam,
                  courseId: courseId,
                  onlineClass: onlineClass,
                  now: _now,
                  sessionDeadline: sessionDeadlines[exam.id],
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
    required this.now,
    required this.sessionDeadline,
  });
  final LearnerExam exam;
  final String courseId;
  final bool onlineClass;
  final DateTime now;

  /// Deadline of an attempt in progress on this device, if any.
  final DateTime? sessionDeadline;

  String get _onlineQuery => onlineClass ? '?online=true' : '';

  @override
  Widget build(BuildContext context) {
    final access = ExamAccess.of(exam.openDate, exam.duration, now: now);
    final maxReached =
        exam.maxAttempts != null && exam.attemptCount >= exam.maxAttempts!;
    final deadline = sessionDeadline;
    final inProgress = deadline != null;
    final attemptLeftSec = secondsUntil(deadline, now);
    final windowLeftSec = secondsUntil(access.windowEnd, now);
    final takePath = '/my-courses/$courseId/exams/${exam.id}/take$_onlineQuery';
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
                  text: switch (exam.type.toLowerCase()) {
                    'final' => context.l10n.examsTypeFinal,
                    'practice' => context.l10n.examsTypePractice,
                    _ => exam.type.toUpperCase(),
                  },
                  color: exam.type == 'final'
                      ? const Color(0xFFB42318)
                      : const Color(0xFF2563EB),
                ),
                if (exam.passed == true)
                  _Badge(text: context.l10n.examsPassed, color: _green),
                if (inProgress)
                  _Badge(text: context.l10n.examsInProgress, color: _amber),
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
                _Meta(icon: Icons.schedule, text: context.l10n.commonMinutes(exam.duration)),
                _Meta(
                  icon: Icons.quiz_outlined,
                  text: exam.maxAttempts == null
                      ? context.l10n.examsRandomQuestions
                      : context.l10n.examsQuestions(exam.questions.length),
                ),
                _Meta(
                  icon: Icons.flag_outlined,
                  text: context.l10n.examsPassMark(exam.passMark),
                ),
                _Meta(
                  icon: Icons.replay,
                  text:
                      context.l10n.examsAttempts(exam.maxAttempts == null ? '${exam.attemptCount}' : '${exam.attemptCount}/${exam.maxAttempts}'),
                ),
              ],
            ),
            if (exam.bestScore != null) ...[
              const SizedBox(height: 9),
              Text(
                context.l10n.examsBestScore(_number(exam.bestScore!), exam.totalMarks),
                style: const TextStyle(
                  color: _green,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ],
            if (inProgress)
              _CountdownBanner(
                color: attemptLeftSec <= _urgentSec ? _red : _amber,
                icon: Icons.hourglass_bottom,
                label: attemptLeftSec > 0
                    ? context.l10n.examsTimeLeft
                    : context.l10n.examsTimesUp,
                countdown: formatCountdown(attemptLeftSec, days: context.l10n.examsCountdownDays),
                detail: attemptLeftSec > 0
                    ? context.l10n.examsTimerRunning
                    : context.l10n.examsOpenToSubmit,
              )
            else if (!maxReached && access.status == ExamAccessStatus.upcoming)
              _CountdownBanner(
                color: _yellow,
                icon: Icons.event_outlined,
                label: context.l10n.examsStartsIn,
                countdown: formatCountdown(secondsUntil(access.start, now), days: context.l10n.examsCountdownDays),
                detail: context.l10n.examsOpens(_formatDate(access.start!)),
              )
            else if (!maxReached &&
                access.status == ExamAccessStatus.open &&
                access.windowEnd != null)
              _CountdownBanner(
                color: windowLeftSec <= _urgentSec ? _red : _green,
                icon: Icons.hourglass_bottom,
                label: context.l10n.examsWindowClosesIn,
                countdown: formatCountdown(windowLeftSec, days: context.l10n.examsCountdownDays),
                detail: context.l10n.examsStartBefore(_formatDate(access.windowEnd!)),
              ),
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
                    label: Text(context.l10n.examsViewResult),
                  ),
                if (inProgress)
                  FilledButton.icon(
                    onPressed: () => context.push(takePath),
                    icon: const Icon(Icons.play_circle_outline, size: 18),
                    label: Text(
                      attemptLeftSec > 0 ? context.l10n.examsResume : context.l10n.examsSubmitAnswers,
                    ),
                    style: FilledButton.styleFrom(backgroundColor: _navy),
                  )
                else if (maxReached)
                  Chip(
                    avatar: Icon(Icons.block, size: 17),
                    label: Text(context.l10n.examsMaxAttempts),
                  )
                else if (access.status == ExamAccessStatus.upcoming)
                  Chip(
                    avatar: Icon(Icons.schedule, size: 17),
                    label: Text(context.l10n.examsNotStartedYet),
                  )
                else if (access.status == ExamAccessStatus.closed)
                  Chip(
                    avatar: Icon(Icons.lock_outline, size: 17),
                    label: Text(context.l10n.examsWindowClosed),
                  )
                else
                  FilledButton.icon(
                    onPressed: () => context.push(takePath),
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: Text(context.l10n.examsTake),
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

class _CountdownBanner extends StatelessWidget {
  const _CountdownBanner({
    required this.color,
    required this.icon,
    required this.label,
    required this.countdown,
    required this.detail,
  });
  final Color color;
  final IconData icon;
  final String label, countdown, detail;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    margin: const EdgeInsets.only(top: 12),
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .07),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: color.withValues(alpha: .25)),
    ),
    child: Row(
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text.rich(
                TextSpan(
                  text: '$label ',
                  children: [
                    TextSpan(
                      text: countdown,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        fontFeatures: [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                detail,
                style: TextStyle(
                  fontSize: 12,
                  color: color.withValues(alpha: .85),
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
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

String _formatDate(DateTime value) =>
    formatDate(value, DateStyle.dateTime);
String _number(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);
