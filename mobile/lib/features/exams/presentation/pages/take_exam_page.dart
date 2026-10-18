import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../data/exam_session_store.dart';
import '../../domain/exam_access.dart';
import '../../domain/exam_models.dart';
import '../exams_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _navy = Color(0xFF12304E);
const _ink = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _blue = Color(0xFF2D6CDF);
const _amber = Color(0xFFB45309);
const _red = Color(0xFFDC2626);

const _warningThresholds = [5 * 60, 60];

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
  String get _resultPath =>
      '/my-courses/$courseId/exams/$examId/result${onlineClass ? '?online=true' : ''}';

  @override
  ConsumerState<TakeExamPage> createState() => _TakeExamPageState();
}

class _TakeExamPageState extends ConsumerState<TakeExamPage>
    with WidgetsBindingObserver {
  // The in-progress attempt, persisted on every change so the app can be
  // closed and reopened without resetting the timer or losing answers.
  ExamSession? _session;
  String? _loadedForProfile;
  bool _sessionLoaded = false;

  final Map<String, TextEditingController> _textControllers = {};
  Timer? _ticker;
  Timer? _saveDebounce;
  DateTime _now = DateTime.now();
  bool _submitting = false;
  bool _submitted = false;
  String? _submitError;
  bool _autoSubmitFired = false;
  int? _lastRemaining;

  ExamSessionStore get _store => ref.read(examSessionStoreProvider);

  bool get _inProgress => _session != null && !_submitted;

  int get _remainingSec =>
      _session == null ? 0 : secondsUntil(_session!.deadline, _now);

  bool get _timeUp => _inProgress && _remainingSec == 0;

  bool get _locked => !_inProgress || _timeUp || _submitting;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Wall-clock tick. Time left is always derived from the stored start
    // time, so backgrounding or killing the app can't drift or reset it.
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _ticker?.cancel();
    _flushSave();
    for (final controller in _textControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _tick();
    } else {
      _flushSave();
    }
  }

  void _tick() {
    if (!mounted) return;
    setState(() => _now = DateTime.now());
    _checkTime();
  }

  void _checkTime() {
    if (!_inProgress) return;
    final remaining = _remainingSec;
    final previous = _lastRemaining;
    _lastRemaining = remaining;
    if (previous != null) {
      for (final threshold in _warningThresholds) {
        if (previous > threshold && remaining <= threshold) {
          _showSnack(
            threshold >= 120
                ? context.l10n.takeMinutesLeft(threshold ~/ 60)
                : context.l10n.takeOneMinuteLeft,
          );
        }
      }
    }
    // Auto-submit once when time runs out (also right after reopening if it
    // ran out while the app was closed).
    if (remaining == 0 && !_autoSubmitFired) {
      _autoSubmitFired = true;
      _submit(auto: true);
    }
  }

  void _ensureSessionLoaded(String profileId) {
    if (_loadedForProfile == profileId) return;
    _loadedForProfile = profileId;
    _sessionLoaded = false;
    _store.load(profileId, widget.examId).then((session) {
      if (!mounted || _loadedForProfile != profileId) return;
      setState(() {
        _session = session;
        _sessionLoaded = true;
        _now = DateTime.now();
      });
      _checkTime();
    });
  }

  void _scheduleSave({bool immediate = false}) {
    _saveDebounce?.cancel();
    if (immediate) {
      _flushSave();
    } else {
      _saveDebounce = Timer(const Duration(milliseconds: 400), _flushSave);
    }
  }

  void _flushSave() {
    _saveDebounce?.cancel();
    final session = _session;
    if (session != null && !_submitted) _store.save(session);
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _start(ExamTakeData data, String profileId) async {
    final access = ExamAccess.of(data.exam.openDate, data.exam.duration);
    if (access.status != ExamAccessStatus.open) {
      _showSnack(
        access.status == ExamAccessStatus.upcoming
            ? context.l10n.takeNotStartedToast
            : context.l10n.takeWindowClosedToast,
      );
      return;
    }
    final session = ExamSession(
      examId: widget.examId,
      profileId: profileId,
      title: data.exam.title,
      closeDate: data.exam.closeDate == null
          ? null
          : DateTime.tryParse(data.exam.closeDate!)?.toLocal(),
      startedAt: DateTime.now(),
      durationMinutes: data.exam.duration,
      questions: data.questions,
    );
    setState(() {
      _session = session;
      _now = DateTime.now();
      _autoSubmitFired = false;
      _lastRemaining = null;
    });
    await _store.save(session);
    ref.invalidate(activeExamSessionsProvider(profileId));
  }

  Future<void> _submit({bool auto = false}) async {
    final session = _session;
    if (session == null || _submitting || _submitted) return;

    if (!auto) {
      final confirmed = await _confirmSubmit(session);
      if (confirmed != true || !mounted || _submitting) return;
    }

    setState(() {
      _submitting = true;
      _submitError = null;
    });
    final answers = <String, Object>{
      for (final entry in session.answers.entries)
        if (isExamAnswered(entry.value)) entry.key: entry.value,
    };
    try {
      await ref
          .read(examsRepositoryProvider)
          .submitExam(
            examId: session.examId,
            profileId: session.profileId,
            answers: answers,
            startedAt: session.startedAt,
            // Echo back exactly which questions were shown so REGULAR dynamic
            // exams are graded against the same random set.
            questions: session.questions,
          );
      _submitted = true;
      _saveDebounce?.cancel();
      await _store.clear(session.profileId, session.examId);
      ref
        ..invalidate(
          courseExamsProvider('${widget.courseId}|${session.profileId}'),
        )
        ..invalidate(
          examResultProvider('${widget.examId}|${session.profileId}'),
        )
        ..invalidate(activeExamSessionsProvider(session.profileId));
      if (!mounted) return;
      setState(() => _submitting = false);
      _showSnack(context.l10n.takeSubmittedToast);
      context.go(widget._resultPath);
    } catch (error) {
      if (!mounted) return;
      final message = apiErrorMessage(
        error,
        fallback: context.l10n.takeSubmitError,
      );
      setState(() {
        _submitting = false;
        _submitError = message;
      });
      if (!auto) _showSnack(message);
    }
  }

  Future<bool?> _confirmSubmit(ExamSession session) {
    final total = session.questions.length;
    final answered = session.answeredCount;
    final unanswered = total - answered;
    final flagged = session.flagged
        .where((id) => session.questions.any((q) => q.id == id))
        .length;
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.l10n.takeConfirmTitle),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              unanswered > 0
                  ? context.l10n.takeConfirmUnanswered(unanswered)
                  : context.l10n.takeConfirmAll,
              style: const TextStyle(color: _muted, height: 1.4),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _SummaryStat(label: context.l10n.takeAnswered, value: answered, color: _green),
                const SizedBox(width: 8),
                _SummaryStat(
                  label: context.l10n.takeUnanswered,
                  value: unanswered,
                  color: unanswered > 0 ? _red : _muted,
                ),
                const SizedBox(width: 8),
                _SummaryStat(
                  label: context.l10n.takeFlagged,
                  value: flagged,
                  color: flagged > 0 ? _amber : _muted,
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(context.l10n.takeKeepWorking),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: _green),
            child: Text(context.l10n.takeSubmitExam),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLeave() async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.l10n.takeLeaveTitle),
        content: Text(context.l10n.takeLeaveBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(context.l10n.takeStay),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: _navy),
            child: Text(context.l10n.takeLeave),
          ),
        ],
      ),
    );
    if (leave != true || !mounted) return;
    _flushSave();
    context.go(widget._examsPath);
  }

  Future<void> _discardAndLeave() async {
    final session = _session;
    if (session != null) {
      _submitted = true;
      await _store.clear(session.profileId, session.examId);
      ref.invalidate(activeExamSessionsProvider(session.profileId));
    }
    if (mounted) context.go(widget._examsPath);
  }

  void _goTo(int index) {
    final session = _session;
    if (session == null) return;
    setState(
      () => session.current = index.clamp(0, session.questions.length - 1),
    );
    _scheduleSave();
  }

  void _setAnswer(String questionId, Object? answer, {bool debounce = false}) {
    final session = _session;
    if (session == null || _locked) return;
    setState(() {
      if (isExamAnswered(answer)) {
        session.answers[questionId] = answer!;
      } else {
        session.answers.remove(questionId);
      }
    });
    _scheduleSave(immediate: !debounce);
  }

  void _toggleFlag(String questionId) {
    final session = _session;
    if (session == null || _locked) return;
    setState(() {
      if (!session.flagged.remove(questionId)) session.flagged.add(questionId);
    });
    _scheduleSave(immediate: true);
  }

  TextEditingController _textControllerFor(ExamQuestion question) =>
      _textControllers.putIfAbsent(
        question.id,
        () => TextEditingController(
          text: _session?.answers[question.id] is String
              ? _session!.answers[question.id] as String
              : '',
        ),
      );

  void _openNavigator(ExamSession session) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => SafeArea(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(sheetContext).size.height * .8,
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  context.l10n.takeQuestions,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: _ink,
                  ),
                ),
                Text(
                  context.l10n.takeAnsweredOf(session.answeredCount, session.questions.length),
                  style: const TextStyle(color: _muted, fontSize: 13),
                ),
                const SizedBox(height: 14),
                Flexible(
                  child: _QuestionGrid(
                    session: session,
                    onSelect: (index) {
                      Navigator.pop(sheetContext);
                      _goTo(index);
                    },
                  ),
                ),
                const SizedBox(height: 12),
                const _GridLegend(),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: FilledButton.icon(
                    onPressed: _locked
                        ? null
                        : () {
                            Navigator.pop(sheetContext);
                            _submit();
                          },
                    icon: const Icon(Icons.send_outlined, size: 18),
                    label: Text(context.l10n.takeSubmitExam),
                    style: FilledButton.styleFrom(backgroundColor: _green),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Center(child: Text(context.l10n.examsSelectProfileFirst));
    }
    if (_submitted && !_submitting && _submitError == null) {
      return _CenteredStatus(
        icon: Icons.check_circle_outline,
        iconColor: _green,
        title: context.l10n.takeSubmittedTitle,
        text: context.l10n.takeTakingToResult,
        loading: true,
      );
    }
    _ensureSessionLoaded(profile.id);
    if (!_sessionLoaded) {
      return const Center(child: CircularProgressIndicator(color: _navy));
    }

    final session = _session;
    if (session != null) {
      return PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, _) {
          if (didPop || _timeUp || _submitting) return;
          _confirmLeave();
        },
        child: Stack(
          children: [_buildExam(session), if (_timeUp) _buildTimeUpOverlay()],
        ),
      );
    }

    // Before the attempt starts: the schedule gate applies only here. Once
    // started, the learner keeps going even after the start window closes.
    final asyncData = ref.watch(examQuestionsProvider(widget.examId));
    return asyncData.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _CenteredStatus(
        icon: Icons.cloud_off_outlined,
        iconColor: const Color(0xFF94A3B8),
        title: context.l10n.takeLoadFailedTitle,
        text: context.l10n.commonCheckConnection,
        actions: [
          OutlinedButton(
            onPressed: () => context.go(widget._examsPath),
            child: Text(context.l10n.examsBack),
          ),
          FilledButton(
            onPressed: () =>
                ref.invalidate(examQuestionsProvider(widget.examId)),
            style: FilledButton.styleFrom(backgroundColor: _navy),
            child: Text(context.l10n.commonTryAgain),
          ),
        ],
      ),
      data: (data) {
        final access = ExamAccess.of(
          data.exam.openDate,
          data.exam.duration,
          now: _now,
        );
        final back = OutlinedButton(
          onPressed: () => context.go(widget._examsPath),
          child: Text(context.l10n.examsBack),
        );
        if (access.status == ExamAccessStatus.upcoming) {
          return _CenteredStatus(
            icon: Icons.lock_clock_outlined,
            iconColor: const Color(0xFFB8912F),
            title: context.l10n.takeNotStartedTitle,
            text:
                context.l10n.takeNotStartedBody(_formatDate(access.start!)),
            countdownLabel: context.l10n.examsStartsIn,
            countdown: formatCountdown(secondsUntil(access.start, _now), days: context.l10n.examsCountdownDays),
            actions: [back],
          );
        }
        if (access.status == ExamAccessStatus.closed) {
          return _CenteredStatus(
            icon: Icons.lock_outline,
            iconColor: _muted,
            title: context.l10n.takeClosedTitle,
            text:
                context.l10n.takeClosedBody(_formatDate(access.windowEnd!)),
            actions: [back],
          );
        }
        if (data.questions.isEmpty) {
          return _CenteredStatus(
            icon: Icons.description_outlined,
            iconColor: const Color(0xFF94A3B8),
            title: context.l10n.takeNoQuestionsTitle,
            text: context.l10n.takeNoQuestionsBody,
            actions: [back],
          );
        }
        return _ExamIntro(
          exam: data.exam,
          questionCount: data.questions.length,
          windowEnd: access.windowEnd,
          windowLeftSec: access.windowEnd == null
              ? null
              : secondsUntil(access.windowEnd, _now),
          onStart: () => _start(data, profile.id),
          onBack: () => context.go(widget._examsPath),
        );
      },
    );
  }

  Widget _buildExam(ExamSession session) {
    final questions = session.questions;
    final index = session.current.clamp(0, questions.length - 1);
    final question = questions[index];
    final isLast = index == questions.length - 1;
    final answered = session.answeredCount;
    final flaggedCount = session.flagged
        .where((id) => questions.any((q) => q.id == id))
        .length;
    final isFlagged = session.flagged.contains(question.id);

    return SafeArea(
      child: Column(
        children: [
          // Header: title, progress and timer
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: _ink,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text.rich(
                        TextSpan(
                          text: context.l10n.takeAnsweredOf(answered, questions.length),
                          children: [
                            if (flaggedCount > 0)
                              TextSpan(
                                text: ' · ${context.l10n.takeFlaggedCount(flaggedCount)}',
                                style: const TextStyle(color: _amber),
                              ),
                          ],
                        ),
                        style: const TextStyle(fontSize: 12, color: _muted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                _TimerPill(remainingSec: _remainingSec),
                IconButton(
                  tooltip: context.l10n.takeAllQuestions,
                  onPressed: () => _openNavigator(session),
                  icon: const Icon(Icons.grid_view_rounded, color: _ink),
                ),
              ],
            ),
          ),
          LinearProgressIndicator(
            value: questions.isEmpty ? 0 : answered / questions.length,
            minHeight: 3,
            backgroundColor: _border,
            color: _green,
          ),
          Expanded(
            child: SingleChildScrollView(
              key: PageStorageKey('exam-question-$index'),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                context.l10n.takeQuestionOf(index + 1, questions.length).toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 12,
                                  letterSpacing: .4,
                                  color: _muted,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              _Chip(
                                text:
                                    context.l10n.takeMarks(question.marks),
                                color: _navy,
                              ),
                            ],
                          ),
                        ),
                        TextButton.icon(
                          onPressed: _locked
                              ? null
                              : () => _toggleFlag(question.id),
                          icon: Icon(
                            isFlagged ? Icons.flag : Icons.outlined_flag,
                            size: 18,
                          ),
                          label: Text(isFlagged ? context.l10n.takeFlagged : context.l10n.takeFlag),
                          style: TextButton.styleFrom(
                            foregroundColor: isFlagged ? _amber : _muted,
                            visualDensity: VisualDensity.compact,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      question.question,
                      style: const TextStyle(
                        fontSize: 18,
                        height: 1.45,
                        color: _ink,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 18),
                    _buildAnswer(session, question),
                  ],
                ),
              ),
            ),
          ),
          // Bottom navigation
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: _border)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            child: Row(
              children: [
                SizedBox(
                  height: 50,
                  width: 54,
                  child: OutlinedButton(
                    onPressed: index == 0 ? null : () => _goTo(index - 1),
                    style: OutlinedButton.styleFrom(padding: EdgeInsets.zero),
                    child: const Icon(Icons.chevron_left),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: isLast
                        ? FilledButton.icon(
                            onPressed: _locked ? null : () => _submit(),
                            icon: _submitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.send_outlined, size: 18),
                            label: Text(
                              _submitting ? context.l10n.takeSubmitting : context.l10n.takeReviewSubmit,
                            ),
                            style: FilledButton.styleFrom(
                              backgroundColor: _green,
                            ),
                          )
                        : FilledButton.icon(
                            onPressed: () => _goTo(index + 1),
                            iconAlignment: IconAlignment.end,
                            icon: const Icon(Icons.chevron_right),
                            label: Text(context.l10n.takeNext),
                            style: FilledButton.styleFrom(
                              backgroundColor: _navy,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnswer(ExamSession session, ExamQuestion question) {
    if (question.type == 'short_answer' || question.type == 'essay') {
      final controller = _textControllerFor(question);
      return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          TextField(
            key: ValueKey(question.id),
            controller: controller,
            enabled: !_locked,
            onChanged: (value) =>
                _setAnswer(question.id, value, debounce: true),
            minLines: question.type == 'essay' ? 7 : 4,
            maxLines: question.type == 'essay' ? 14 : 6,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              hintText: context.l10n.takeAnswerHint,
              alignLabelWithHint: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            context.l10n.takeWords(_wordCount(controller.text)),
            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
          ),
        ],
      );
    }

    if (question.options.isEmpty) {
      return Text(
        context.l10n.takeNoOptions,
        style: TextStyle(color: _muted),
      );
    }

    final isMulti = question.type == 'multi_select';
    final current = session.answers[question.id];
    final selected = isMulti
        ? (current is List ? List<String>.from(current) : <String>[])
        : (current is String ? [current] : <String>[]);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isMulti)
          Padding(
            padding: EdgeInsets.only(bottom: 10),
            child: Text(
              context.l10n.takeSelectAll,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: _muted,
              ),
            ),
          ),
        for (var i = 0; i < question.options.length; i++)
          _OptionTile(
            letter: String.fromCharCode(65 + i),
            text: question.options[i],
            selected: selected.contains(question.options[i]),
            multi: isMulti,
            enabled: !_locked,
            onTap: () {
              final option = question.options[i];
              if (isMulti) {
                final next = [...selected];
                if (!next.remove(option)) next.add(option);
                _setAnswer(question.id, next);
              } else {
                _setAnswer(question.id, option);
              }
            },
          ),
      ],
    );
  }

  Widget _buildTimeUpOverlay() {
    return Positioned.fill(
      child: ColoredBox(
        color: _ink.withValues(alpha: .55),
        child: Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(24),
            constraints: const BoxConstraints(maxWidth: 420),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
            ),
            child: _submitError == null
                ? Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer_off_outlined, size: 46, color: _navy),
                      SizedBox(height: 12),
                      Text(
                        context.l10n.takeTimesUp,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        context.l10n.takeSubmittingAnswers,
                        style: TextStyle(color: _muted),
                      ),
                      SizedBox(height: 18),
                      CircularProgressIndicator(color: _navy),
                    ],
                  )
                : Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 46, color: _red),
                      const SizedBox(height: 12),
                      Text(
                        context.l10n.takeSubmissionFailed,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _submitError!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: _muted),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        context.l10n.takeSavedOnDevice,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: FilledButton.icon(
                          onPressed: _submitting
                              ? null
                              : () => _submit(auto: true),
                          icon: _submitting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.refresh),
                          label: Text(context.l10n.takeRetrySubmit),
                          style: FilledButton.styleFrom(backgroundColor: _navy),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: _submitting ? null : _discardAndLeave,
                        child: Text(context.l10n.takeDiscardLeave),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

// ─── Pieces ──────────────────────────────────────────────────

String _formatDate(DateTime value) =>
    DateFormat.yMMMd().add_jm().format(value);

int _wordCount(String text) {
  final trimmed = text.trim();
  return trimmed.isEmpty ? 0 : trimmed.split(RegExp(r'\s+')).length;
}

class _TimerPill extends StatelessWidget {
  const _TimerPill({required this.remainingSec});
  final int remainingSec;

  @override
  Widget build(BuildContext context) {
    final critical = remainingSec <= 60;
    final warning = remainingSec <= 5 * 60;
    final color = critical ? _red : (warning ? _amber : _navy);
    return Semantics(
      label: context.l10n.takeTimeRemaining(formatCountdown(remainingSec, days: context.l10n.examsCountdownDays)),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: critical || warning
              ? color.withValues(alpha: .08)
              : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: critical || warning ? color.withValues(alpha: .3) : _border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.timer_outlined, size: 18, color: color),
            const SizedBox(width: 5),
            Text(
              formatCountdown(remainingSec, days: context.l10n.examsCountdownDays),
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 16,
                color: color,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.letter,
    required this.text,
    required this.selected,
    required this.multi,
    required this.enabled,
    required this.onTap,
  });
  final String letter, text;
  final bool selected, multi, enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Semantics(
      checked: selected,
      inMutuallyExclusiveGroup: !multi,
      child: Material(
        color: selected ? const Color(0xFFF4F8FF) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: enabled ? onTap : null,
          child: Container(
            constraints: const BoxConstraints(minHeight: 52),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? _blue : _border,
                width: selected ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected ? _blue : Colors.white,
                    shape: multi ? BoxShape.rectangle : BoxShape.circle,
                    borderRadius: multi ? BorderRadius.circular(6) : null,
                    border: Border.all(
                      color: selected ? _blue : const Color(0xFFCBD5E1),
                    ),
                  ),
                  child: selected
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text(
                          letter,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _muted,
                          ),
                        ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    text,
                    style: const TextStyle(color: _ink, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class _QuestionGrid extends StatelessWidget {
  const _QuestionGrid({required this.session, required this.onSelect});
  final ExamSession session;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) => GridView.builder(
    shrinkWrap: true,
    itemCount: session.questions.length,
    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
      maxCrossAxisExtent: 56,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
    ),
    itemBuilder: (context, i) {
      final q = session.questions[i];
      final answered = isExamAnswered(session.answers[q.id]);
      final flagged = session.flagged.contains(q.id);
      final current = i == session.current;
      return Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            child: Material(
              color: answered ? _navy : Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(
                  color: current ? _blue : (answered ? _navy : _border),
                  width: current ? 2.5 : 1,
                ),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(10),
                onTap: () => onSelect(i),
                child: Center(
                  child: Text(
                    '${i + 1}',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: answered ? Colors.white : _ink,
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (flagged)
            Positioned(
              top: -3,
              right: -3,
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      );
    },
  );
}

class _GridLegend extends StatelessWidget {
  const _GridLegend();

  @override
  Widget build(BuildContext context) {
    Widget item(Widget swatch, String label) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        swatch,
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: _muted)),
      ],
    );
    return Wrap(
      spacing: 16,
      runSpacing: 6,
      children: [
        item(
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: _navy,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          context.l10n.takeAnswered,
        ),
        item(
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFCBD5E1)),
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          context.l10n.takeNotAnswered,
        ),
        item(
          Container(
            width: 12,
            height: 12,
            decoration: const BoxDecoration(
              color: Color(0xFFF59E0B),
              shape: BoxShape.circle,
            ),
          ),
          context.l10n.takeFlagged,
        ),
      ],
    );
  }
}

class _ExamIntro extends StatelessWidget {
  const _ExamIntro({
    required this.exam,
    required this.questionCount,
    required this.windowEnd,
    required this.windowLeftSec,
    required this.onStart,
    required this.onBack,
  });
  final ExamTakeInfo exam;
  final int questionCount;
  final DateTime? windowEnd;
  final int? windowLeftSec;
  final VoidCallback onStart, onBack;

  @override
  Widget build(BuildContext context) {
    final stats = [
      (Icons.schedule, context.l10n.takeDuration, context.l10n.commonMinutes(exam.duration)),
      (Icons.quiz_outlined, context.l10n.takeQuestions, '$questionCount'),
      (Icons.workspace_premium_outlined, context.l10n.takeTotalMarks, '${exam.totalMarks}'),
      (Icons.flag_outlined, context.l10n.takePassMarkLabel, '${exam.passMark}%'),
    ];
    final rules = [
      context.l10n.takeRule1(exam.duration),
      context.l10n.takeRule2,
      context.l10n.takeRule3,
      context.l10n.takeRule4,
    ];
    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: onBack,
                    icon: const Icon(Icons.arrow_back, size: 18),
                    label: Text(context.l10n.examsBack),
                    style: TextButton.styleFrom(foregroundColor: _muted),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _Chip(
                        text: exam.type.toUpperCase(),
                        color: exam.type == 'final'
                            ? const Color(0xFFB42318)
                            : const Color(0xFF2563EB),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        exam.title,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              color: _ink,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const SizedBox(height: 16),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                        childAspectRatio: 2.1,
                        children: [
                          for (final (icon, label, value) in stats)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFBF9F4),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: _border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(icon, size: 16, color: _muted),
                                  const SizedBox(height: 4),
                                  Text(
                                    value,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                      color: _ink,
                                    ),
                                  ),
                                  Text(
                                    label,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: _muted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      if (windowEnd != null && windowLeftSec != null) ...[
                        const SizedBox(height: 14),
                        _CountdownBanner(
                          color: windowLeftSec! <= 5 * 60 ? _red : _amber,
                          icon: Icons.hourglass_bottom,
                          label: context.l10n.examsWindowClosesIn,
                          countdown: formatCountdown(windowLeftSec!, days: context.l10n.examsCountdownDays),
                          detail:
                              context.l10n.takeStartBeforeFull(_formatDate(windowEnd!)),
                        ),
                      ],
                      const SizedBox(height: 18),
                      Text(
                        context.l10n.takeBeforeYouBegin,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                      const SizedBox(height: 8),
                      for (final rule in rules)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 2),
                                child: Icon(
                                  Icons.check,
                                  size: 16,
                                  color: _green,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  rule,
                                  style: const TextStyle(
                                    color: Color(0xFF475569),
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: _border)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton.icon(
                onPressed: onStart,
                iconAlignment: IconAlignment.end,
                icon: const Icon(Icons.arrow_forward),
                label: Text(context.l10n.takeStart),
                style: FilledButton.styleFrom(backgroundColor: _green),
              ),
            ),
          ),
        ],
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
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .07),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: color.withValues(alpha: .25)),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
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

class _CenteredStatus extends StatelessWidget {
  const _CenteredStatus({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.text,
    this.countdownLabel,
    this.countdown,
    this.actions = const [],
    this.loading = false,
  });
  final IconData icon;
  final Color iconColor;
  final String title, text;
  final String? countdownLabel, countdown;
  final List<Widget> actions;
  final bool loading;

  @override
  Widget build(BuildContext context) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48, color: iconColor),
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
            style: const TextStyle(color: _muted, height: 1.4),
          ),
          if (countdown != null) ...[
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _border),
              ),
              child: Column(
                children: [
                  Text(
                    (countdownLabel ?? '').toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      letterSpacing: .5,
                      fontWeight: FontWeight.w700,
                      color: _muted,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    countdown!,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: _ink,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (loading) ...[
            const SizedBox(height: 18),
            const CircularProgressIndicator(color: _navy),
          ],
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 20),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: actions,
            ),
          ],
        ],
      ),
    ),
  );
}

class _Chip extends StatelessWidget {
  const _Chip({required this.text, required this.color});
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .08),
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      text,
      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
    ),
  );
}

class _SummaryStat extends StatelessWidget {
  const _SummaryStat({
    required this.label,
    required this.value,
    required this.color,
  });
  final String label;
  final int value;
  final Color color;
  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .07),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: .25)),
      ),
      child: Column(
        children: [
          Text(
            '$value',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    ),
  );
}
