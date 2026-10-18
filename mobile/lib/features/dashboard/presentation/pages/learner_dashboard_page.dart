import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/entities/dashboard_data.dart';
import '../providers/dashboard_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _navy = Color(0xFF12304E);
const _ink = Color(0xFF0C1F33);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);
const _blue = Color(0xFF2563EB);
const _red = Color(0xFFDC2626);
const _muted = Color(0xFF64748B);
const _faint = Color(0xFF94A3B8);
const _border = Color(0xFFE3E8EF);
const _cream = Color(0xFFF9F6F0);

class LearnerDashboardPage extends ConsumerWidget {
  const LearnerDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(context.l10n.dashChooseProfile),
            const SizedBox(height: 10),
            FilledButton(
              onPressed: () => context.go('/profiles'),
              child: Text(context.l10n.dashChooseProfileButton),
            ),
          ],
        ),
      );
    }

    final dashboard = ref.watch(activeLearnerDashboardProvider);
    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => _DashboardError(
        message: apiErrorMessage(error, fallback: context.l10n.dashLoadFailed),
        onRetry: () => ref.invalidate(learnerDashboardProvider(profile.id)),
        onSwitchProfile: () => context.go('/profiles'),
      ),
      data: (data) => _DashboardContent(
        data: data,
        onRefresh: () => ref
            .refresh(learnerDashboardProvider(profile.id).future)
            .then<void>((_) {}),
      ),
    );
  }
}

class _DashboardContent extends StatefulWidget {
  const _DashboardContent({required this.data, required this.onRefresh});
  final DashboardData data;
  final Future<void> Function() onRefresh;

  @override
  State<_DashboardContent> createState() => _DashboardContentState();
}

class _DashboardContentState extends State<_DashboardContent> {
  // Keep "live now" / "starting soon" accurate without a refresh.
  DateTime _now = DateTime.now();
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(
      const Duration(minutes: 1),
      (_) => setState(() => _now = DateTime.now()),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.data;
    final happeningNow = data.liveClasses
        .where((c) => _classStatus(c, _now) != _ClassStatus.later)
        .firstOrNull;
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 850;
        return RefreshIndicator(
          onRefresh: widget.onRefresh,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.all(constraints.maxWidth < 600 ? 16 : 28),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1440),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _Greeting(data: data),
                    if (happeningNow != null) ...[
                      const SizedBox(height: 16),
                      _HappeningNowBanner(liveClass: happeningNow, now: _now),
                    ],
                    const SizedBox(height: 18),
                    _StatsGrid(stats: data.stats),
                    const SizedBox(height: 18),
                    _TwoColumn(
                      wide: wide,
                      left: _ContinueLearning(
                        courses: data.continueLearning,
                        hasCourses:
                            data.stats.coursesInProgress +
                                data.stats.coursesCompleted >
                            0,
                      ),
                      right: Column(
                        children: [
                          _LiveClasses(classes: data.liveClasses, now: _now),
                          const SizedBox(height: 18),
                          _Deadlines(deadlines: data.deadlines),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    _TwoColumn(
                      wide: wide,
                      equal: true,
                      left: _WeeklyActivityChart(weeks: data.weeklyActivity),
                      right: _RecentResults(results: data.recentResults),
                    ),
                    if (data.notes.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      _RecentNotes(notes: data.notes),
                    ],
                    if (data.recommended.isNotEmpty) ...[
                      const SizedBox(height: 22),
                      _Recommendations(courses: data.recommended),
                    ],
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _TwoColumn extends StatelessWidget {
  const _TwoColumn({
    required this.wide,
    required this.left,
    required this.right,
    this.equal = false,
  });
  final bool wide, equal;
  final Widget left, right;

  @override
  Widget build(BuildContext context) => wide
      ? Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(flex: equal ? 1 : 3, child: left),
            const SizedBox(width: 18),
            Expanded(flex: equal ? 1 : 2, child: right),
          ],
        )
      : Column(children: [left, const SizedBox(height: 18), right]);
}

// ─── Greeting & live banner ───

class _Greeting extends StatelessWidget {
  const _Greeting({required this.data});
  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final hour = DateTime.now().hour;
    final l10n = context.l10n;
    final greeting = hour < 12
        ? l10n.dashGreetingMorning(data.learnerName)
        : hour < 17
        ? l10n.dashGreetingAfternoon(data.learnerName)
        : l10n.dashGreetingEvening(data.learnerName);
    final stats = data.stats;
    final hasCourses = stats.coursesInProgress + stats.coursesCompleted > 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greeting,
          style: const TextStyle(
            fontFamily: 'serif',
            fontSize: 26,
            color: _ink,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          !hasCourses
              ? l10n.dashFindFirstCourse
              : stats.studiedToday
              ? l10n.dashNiceWork
              : l10n.dashPickUp,
          style: const TextStyle(color: _muted),
        ),
      ],
    );
  }
}

enum _ClassStatus { live, soon, later }

_ClassStatus _classStatus(UpcomingLiveClass c, DateTime now) {
  final start = c.scheduledAt;
  if (start == null) return _ClassStatus.later;
  final end = start.add(Duration(minutes: c.durationMinutes));
  if (!now.isBefore(start) && !now.isAfter(end)) return _ClassStatus.live;
  if (start.difference(now).inMinutes <= 30) return _ClassStatus.soon;
  return _ClassStatus.later;
}

class _HappeningNowBanner extends StatelessWidget {
  const _HappeningNowBanner({required this.liveClass, required this.now});
  final UpcomingLiveClass liveClass;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final live = _classStatus(liveClass, now) == _ClassStatus.live;
    final link = liveClass.meetingLink;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: live ? _green : _navy,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.sensors, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  live
                      ? context.l10n.dashClassLiveNow
                      : context.l10n.dashClassStartsAt(_time(context.l10n, liveClass.scheduledAt)),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  '${liveClass.title} • ${liveClass.courseTitle}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          FilledButton(
            onPressed: link != null
                ? () => _openLink(context, link)
                : () => context.push('/online-classes/${liveClass.batchId}'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: _ink,
            ),
            child: Text(link != null ? context.l10n.dashJoin : context.l10n.dashView),
          ),
        ],
      ),
    );
  }
}

// ─── Stats ───

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});
  final DashboardStats stats;

  @override
  Widget build(BuildContext context) {
    final items = [
      _StatItem(
        icon: Icons.menu_book_outlined,
        color: _blue,
        value: stats.coursesInProgress,
        label: context.l10n.dashStatInProgress,
        sub: context.l10n.dashStatCompletedCount(stats.coursesCompleted),
      ),
      _StatItem(
        icon: Icons.check_circle_outline,
        color: _green,
        value: stats.lessonsCompleted,
        label: context.l10n.dashStatLessons,
        sub: context.l10n.dashStatThisWeek(stats.lessonsThisWeek),
      ),
      _StatItem(
        icon: Icons.workspace_premium_outlined,
        color: _gold,
        value: stats.certificatesEarned,
        label: context.l10n.dashStatCertificates,
        sub: context.l10n.dashStatViewCertificates,
        route: '/certificates',
      ),
      _StatItem(
        icon: Icons.local_fire_department_outlined,
        color: const Color(0xFFF97316),
        value: stats.currentStreak,
        label: context.l10n.dashStatStreak,
        sub: stats.currentStreak > 0 && !stats.studiedToday
            ? context.l10n.dashStatKeepStreak
            : context.l10n.dashStatBest(stats.longestStreak),
      ),
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 900 ? 4 : 2;
        final width = (constraints.maxWidth - (columns - 1) * 12) / columns;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final item in items)
              SizedBox(
                width: width,
                child: _StatCard(item: item),
              ),
          ],
        );
      },
    );
  }
}

class _StatItem {
  const _StatItem({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
    required this.sub,
    this.route,
  });
  final IconData icon;
  final Color color;
  final int value;
  final String label, sub;
  final String? route;
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.item});
  final _StatItem item;

  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: const BorderSide(color: _border),
    ),
    child: InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: item.route == null ? null : () => context.go(item.route!),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: item.color.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(item.icon, size: 19, color: item.color),
            ),
            const SizedBox(height: 10),
            Text(
              '${item.value}',
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 26,
                color: _ink,
              ),
            ),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, color: _muted),
            ),
            const SizedBox(height: 6),
            Text(
              item.sub,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: item.route != null ? _green : _faint,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

// ─── Continue learning ───

class _ContinueLearning extends StatelessWidget {
  const _ContinueLearning({required this.courses, required this.hasCourses});
  final List<ContinueLearningCourse> courses;
  final bool hasCourses;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: context.l10n.dashContinueTitle,
    actionLabel: context.l10n.dashViewAll,
    actionRoute: '/my-courses',
    child: courses.isEmpty
        ? _EmptyState(
            icon: Icons.school_outlined,
            message: hasCourses
                ? context.l10n.dashAllFinished
                : context.l10n.dashNotStarted,
            actionLabel: context.l10n.dashBrowseCourses,
            onActionRoute: '/courses',
          )
        : Column(
            children: [
              for (final (i, course) in courses.indexed) ...[
                if (i > 0) const Divider(height: 22, color: Color(0xFFF1F5F9)),
                _ContinueLearningRow(course: course),
              ],
            ],
          ),
  );
}

class _ContinueLearningRow extends StatelessWidget {
  const _ContinueLearningRow({required this.course});
  final ContinueLearningCourse course;

  String get _route {
    if (course.isOnlineClass && course.batchId != null) {
      return '/online-classes/${course.batchId}';
    }
    if (course.nextLessonId != null) {
      return '/my-courses/${course.id}/lessons/${course.nextLessonId}';
    }
    return '/my-courses';
  }

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: () => context.push(_route),
    borderRadius: BorderRadius.circular(10),
    child: Row(
      children: [
        _CourseThumbnail(url: course.thumbnailUrl, width: 76, height: 54),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                course.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                course.nextLessonTitle != null
                    ? context.l10n.dashNext('${course.nextLessonTitle}')
                    : course.isOnlineClass
                    ? context.l10n.dashLiveOnline
                    : context.l10n.dashNoLessons,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: _muted),
              ),
              if (course.totalLessons > 0) ...[
                const SizedBox(height: 7),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: course.progress / 100,
                          minHeight: 6,
                          color: _green,
                          backgroundColor: const Color(0xFFF1F5F9),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${course.completedLessons}/${course.totalLessons}',
                      style: const TextStyle(fontSize: 11, color: _muted),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(width: 10),
        FilledButton(
          onPressed: () => context.push(_route),
          style: FilledButton.styleFrom(
            backgroundColor: _navy,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            visualDensity: VisualDensity.compact,
          ),
          child: Text(
            course.isOnlineClass
                ? context.l10n.dashSchedule
                : course.completedLessons > 0
                ? context.l10n.dashResume
                : context.l10n.dashStart,
            style: const TextStyle(fontSize: 12),
          ),
        ),
      ],
    ),
  );
}

// ─── Live classes ───

class _LiveClasses extends StatelessWidget {
  const _LiveClasses({required this.classes, required this.now});
  final List<UpcomingLiveClass> classes;
  final DateTime now;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: context.l10n.dashLiveTitle,
    actionLabel: context.l10n.dashViewAll,
    actionRoute: '/online-classes',
    child: classes.isEmpty
        ? _EmptyMessage(context.l10n.dashLiveNone)
        : Column(
            children: [
              for (final (i, c) in classes.indexed) ...[
                if (i > 0) const SizedBox(height: 12),
                _LiveClassRow(liveClass: c, status: _classStatus(c, now)),
              ],
            ],
          ),
  );
}

class _LiveClassRow extends StatelessWidget {
  const _LiveClassRow({required this.liveClass, required this.status});
  final UpcomingLiveClass liveClass;
  final _ClassStatus status;

  @override
  Widget build(BuildContext context) {
    final date = liveClass.scheduledAt;
    final link = liveClass.meetingLink;
    final joinable = status != _ClassStatus.later && link != null;
    return Row(
      children: [
        Container(
          width: 44,
          height: 48,
          decoration: BoxDecoration(
            color: _cream,
            borderRadius: BorderRadius.circular(9),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                date == null
                    ? '--'
                    : DateFormat.MMM().format(date).toUpperCase(),
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: _gold,
                ),
              ),
              Text(
                date == null ? '--' : '${date.day}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _ink,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                liveClass.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: _ink,
                ),
              ),
              Text(
                '${status == _ClassStatus.live ? context.l10n.dashLiveNow : _time(context.l10n, date)} • ${liveClass.courseTitle}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  color: status == _ClassStatus.live ? _green : _muted,
                  fontWeight: status == _ClassStatus.live
                      ? FontWeight.w600
                      : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        joinable
            ? FilledButton(
                onPressed: () => _openLink(context, link),
                style: FilledButton.styleFrom(
                  backgroundColor: _green,
                  visualDensity: VisualDensity.compact,
                ),
                child: Text(context.l10n.dashJoin, style: const TextStyle(fontSize: 12)),
              )
            : OutlinedButton(
                onPressed: () =>
                    context.push('/online-classes/${liveClass.batchId}'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _navy,
                  visualDensity: VisualDensity.compact,
                ),
                child: Text(context.l10n.dashView, style: const TextStyle(fontSize: 12)),
              ),
      ],
    );
  }
}

// ─── Deadlines ───

class _Deadlines extends StatelessWidget {
  const _Deadlines({required this.deadlines});
  final List<DashboardDeadline> deadlines;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: context.l10n.dashDeadlinesTitle,
    child: deadlines.isEmpty
        ? _EmptyMessage(context.l10n.dashDeadlinesNone)
        : Column(
            children: [for (final d in deadlines) _DeadlineRow(deadline: d)],
          ),
  );
}

class _DeadlineRow extends StatelessWidget {
  const _DeadlineRow({required this.deadline});
  final DashboardDeadline deadline;

  @override
  Widget build(BuildContext context) {
    final urgent = deadline.daysRemaining <= 1;
    final due = deadline.daysRemaining <= 0
        ? context.l10n.dashDueToday
        : deadline.daysRemaining == 1
        ? context.l10n.dashDueTomorrow
        : context.l10n.dashDueIn(deadline.daysRemaining);
    return _TapRow(
      route: deadline.isExam
          ? '/my-courses/${deadline.courseId}/exams'
          : '/my-courses/${deadline.courseId}/assignments',
      leading: CircleAvatar(
        radius: 17,
        backgroundColor: urgent
            ? const Color(0xFFFEF2F2)
            : const Color(0xFFF1F5F9),
        child: Icon(
          urgent
              ? Icons.warning_amber_rounded
              : deadline.isExam
              ? Icons.description_outlined
              : Icons.assignment_outlined,
          size: 17,
          color: urgent ? _red : _muted,
        ),
      ),
      title: deadline.title,
      subtitle: TextSpan(
        children: [
          TextSpan(
            text: due,
            style: TextStyle(
              color: urgent ? _red : _muted,
              fontWeight: urgent ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          TextSpan(
            text:
                ' • ${deadline.isExam ? context.l10n.dashExam : context.l10n.dashAssignment} · ${deadline.courseTitle}',
          ),
        ],
      ),
      trailing: const Icon(Icons.chevron_right, size: 18, color: _faint),
    );
  }
}

// ─── Activity chart ───

class _WeeklyActivityChart extends StatelessWidget {
  const _WeeklyActivityChart({required this.weeks});
  final List<WeeklyActivity> weeks;

  @override
  Widget build(BuildContext context) {
    final maxValue = weeks.fold<int>(
      1,
      (max, w) => w.lessonsCompleted > max ? w.lessonsCompleted : max,
    );
    final total = weeks.fold<int>(0, (sum, w) => sum + w.lessonsCompleted);
    return _DashboardPanel(
      title: context.l10n.dashActivityTitle,
      subtitle:
          context.l10n.dashActivitySubtitle(total, weeks.length),
      child: SizedBox(
        height: 150,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            for (final (i, week) in weeks.indexed)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        week.lessonsCompleted > 0
                            ? '${week.lessonsCompleted}'
                            : '',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _muted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        height: week.lessonsCompleted == 0
                            ? 4
                            : 100 * week.lessonsCompleted / maxValue,
                        constraints: const BoxConstraints(maxWidth: 34),
                        decoration: BoxDecoration(
                          color: (i == weeks.length - 1 ? _green : _navy)
                              .withValues(
                                alpha: week.lessonsCompleted == 0 ? .15 : 1,
                              ),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        i == weeks.length - 1
                            ? context.l10n.dashThisWeekShort
                            : week.weekStart == null
                            ? ''
                            : DateFormat.MMMd().format(week.weekStart!),
                        maxLines: 1,
                        overflow: TextOverflow.clip,
                        style: TextStyle(
                          fontSize: 9,
                          color: i == weeks.length - 1 ? _green : _faint,
                          fontWeight: i == weeks.length - 1
                              ? FontWeight.w600
                              : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Recent results ───

class _RecentResults extends StatelessWidget {
  const _RecentResults({required this.results});
  final List<DashboardResult> results;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: context.l10n.dashResultsTitle,
    actionLabel: context.l10n.dashViewAll,
    actionRoute: '/exams',
    child: results.isEmpty
        ? _EmptyMessage(
            context.l10n.dashResultsNone,
          )
        : Column(children: [for (final r in results) _ResultRow(result: r)]),
  );
}

class _ResultRow extends StatelessWidget {
  const _ResultRow({required this.result});
  final DashboardResult result;

  @override
  Widget build(BuildContext context) {
    final (icon, label, color) = switch (result.status) {
      'PASSED' => (Icons.check_circle_outline, context.l10n.dashResultPassed, _green),
      'FAILED' => (Icons.cancel_outlined, context.l10n.dashResultFailed, _red),
      'GRADED' => (Icons.check_circle_outline, context.l10n.dashResultGraded, _blue),
      _ => (Icons.hourglass_bottom, context.l10n.dashResultAwaiting, const Color(0xFFA16207)),
    };
    final score = result.score;
    return _TapRow(
      route: result.isExam && result.examId != null
          ? '/my-courses/${result.courseId}/exams/${result.examId}/result'
          : '/my-courses/${result.courseId}/assignments',
      leading: CircleAvatar(
        radius: 17,
        backgroundColor: color.withValues(alpha: .1),
        child: Icon(icon, size: 17, color: color),
      ),
      title: result.title,
      subtitle: TextSpan(
        text:
            '${result.isExam ? context.l10n.dashExam : context.l10n.dashAssignment} · ${result.courseTitle}'
            '${result.submittedAt == null ? '' : ' • ${_ago(context.l10n, result.submittedAt!)}'}',
      ),
      trailing: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (score != null)
            Text(
              '${_number(score)}/${result.totalMarks}',
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: _ink,
                fontSize: 13,
              ),
            ),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Notes ───

class _RecentNotes extends StatelessWidget {
  const _RecentNotes({required this.notes});
  final List<DashboardNote> notes;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: context.l10n.dashNotesTitle,
    child: Column(
      children: [
        for (final (i, note) in notes.indexed) ...[
          if (i > 0) const SizedBox(height: 10),
          InkWell(
            onTap: () => context.push(
              '/my-courses/${note.courseId}/lessons/${note.lessonId}',
            ),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(12, 6, 6, 6),
              decoration: const BoxDecoration(
                border: Border(left: BorderSide(color: _gold, width: 3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    note.courseTitle.toUpperCase(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: _gold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    note.lessonTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _ink,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    note.text,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.45,
                      color: Color(0xFF4B5563),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    ),
  );
}

// ─── Recommendations ───

class _Recommendations extends StatelessWidget {
  const _Recommendations({required this.courses});
  final List<RecommendedCourse> courses;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Row(
        children: [
          Expanded(
            child: Text(
              context.l10n.dashRecommended,
              style: TextStyle(fontFamily: 'serif', fontSize: 18, color: _ink),
            ),
          ),
          TextButton(
            onPressed: () => context.go('/courses'),
            style: TextButton.styleFrom(foregroundColor: _green),
            child: Text(context.l10n.dashBrowseAll),
          ),
        ],
      ),
      const SizedBox(height: 8),
      SizedBox(
        height: 236,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: courses.length,
          separatorBuilder: (_, _) => const SizedBox(width: 12),
          itemBuilder: (context, i) =>
              _RecommendedCourseCard(course: courses[i]),
        ),
      ),
    ],
  );
}

class _RecommendedCourseCard extends StatelessWidget {
  const _RecommendedCourseCard({required this.course});
  final RecommendedCourse course;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 240,
    child: Material(
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: _border),
      ),
      child: InkWell(
        onTap: () => context.push('/courses/${course.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                _CourseThumbnail(
                  url: course.thumbnailUrl,
                  width: 240,
                  height: 120,
                  radius: 0,
                ),
                if (course.type == 'ONLINE_CLASS')
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Text(
                        context.l10n.dashLiveBadge,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 15,
                      height: 1.25,
                      color: _ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    course.instructor,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: _muted),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: _gold),
                      const SizedBox(width: 3),
                      Text(
                        course.rating?.toStringAsFixed(1) ?? context.l10n.commonNewRating,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _ink,
                        ),
                      ),
                      if (course.ratingCount > 0)
                        Text(
                          ' (${course.ratingCount})',
                          style: const TextStyle(fontSize: 11, color: _faint),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

// ─── Shared pieces ───

class _TapRow extends StatelessWidget {
  const _TapRow({
    required this.route,
    required this.leading,
    required this.title,
    required this.subtitle,
    required this.trailing,
  });
  final String route;
  final Widget leading, trailing;
  final String title;
  final TextSpan subtitle;

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: () => context.push(route),
    borderRadius: BorderRadius.circular(8),
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          leading,
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _ink,
                  ),
                ),
                Text.rich(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: _muted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          trailing,
        ],
      ),
    ),
  );
}

class _CourseThumbnail extends StatelessWidget {
  const _CourseThumbnail({
    required this.url,
    required this.width,
    required this.height,
    this.radius = 9,
  });
  final String? url;
  final double width, height, radius;

  @override
  Widget build(BuildContext context) {
    const fallback = ColoredBox(
      color: _navy,
      child: Center(child: Icon(Icons.menu_book, color: Colors.white54)),
    );
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: width,
        height: height,
        child: url == null
            ? fallback
            : Image.network(
                url!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => fallback,
              ),
      ),
    );
  }
}

class _DashboardPanel extends StatelessWidget {
  const _DashboardPanel({
    required this.title,
    required this.child,
    this.subtitle,
    this.actionLabel,
    this.actionRoute,
  });
  final String title;
  final String? subtitle, actionLabel, actionRoute;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: _border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontFamily: 'serif',
                  fontSize: 18,
                  color: _ink,
                ),
              ),
            ),
            if (actionLabel != null && actionRoute != null)
              GestureDetector(
                onTap: () => context.go(actionRoute!),
                child: Text(
                  actionLabel!,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _green,
                  ),
                ),
              ),
          ],
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 3),
          Text(subtitle!, style: const TextStyle(fontSize: 11, color: _muted)),
        ],
        const SizedBox(height: 12),
        child,
      ],
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.message,
    required this.actionLabel,
    required this.onActionRoute,
  });
  final IconData icon;
  final String message, actionLabel, onActionRoute;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: const Color(0xFFFBF9F4),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(
      children: [
        Icon(icon, size: 34, color: _gold),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w600, color: _ink),
        ),
        TextButton(
          onPressed: () => context.go(onActionRoute),
          style: TextButton.styleFrom(foregroundColor: _green),
          child: Text(actionLabel),
        ),
      ],
    ),
  );
}

class _EmptyMessage extends StatelessWidget {
  const _EmptyMessage(this.message);
  final String message;

  @override
  Widget build(BuildContext context) =>
      Text(message, style: const TextStyle(fontSize: 13, color: _muted));
}

class _DashboardError extends StatelessWidget {
  const _DashboardError({
    required this.message,
    required this.onRetry,
    required this.onSwitchProfile,
  });
  final String message;
  final VoidCallback onRetry;
  final VoidCallback onSwitchProfile;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_outlined, size: 42, color: _faint),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              FilledButton.tonal(
                onPressed: onRetry,
                child: Text(context.l10n.commonTryAgain),
              ),
              TextButton(
                onPressed: onSwitchProfile,
                child: Text(context.l10n.dashSwitchProfile),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

Future<void> _openLink(BuildContext context, String link) async {
  final uri = Uri.tryParse(link);
  if (uri != null &&
      await launchUrl(uri, mode: LaunchMode.externalApplication)) {
    return;
  }
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(context.l10n.scheduleLinkFailed)),
    );
  }
}

String _time(AppLocalizations l10n, DateTime? date) =>
    date == null ? l10n.dashTimeTba : DateFormat.jm().format(date);

String _ago(AppLocalizations l10n, DateTime date) {
  final diff = DateTime.now().difference(date);
  if (diff.inHours < 1) return l10n.notifJustNow;
  if (diff.inHours < 24) return l10n.notifHoursAgo(diff.inHours);
  if (diff.inDays < 7) return l10n.notifDaysAgo(diff.inDays);
  return DateFormat.MMMd().format(date);
}

String _number(num value) => value == value.roundToDouble()
    ? value.toStringAsFixed(0)
    : value.toStringAsFixed(1);
