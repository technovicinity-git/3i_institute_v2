import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/entities/dashboard_data.dart';
import '../providers/dashboard_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE7E9E8);

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
            const Text('Choose a learner profile to view this dashboard.'),
            const SizedBox(height: 10),
            FilledButton(
              onPressed: () => context.go('/profiles'),
              child: const Text('Choose profile'),
            ),
          ],
        ),
      );
    }

    final dashboard = ref.watch(activeLearnerDashboardProvider);
    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => _DashboardError(
        message: apiErrorMessage(error, fallback: 'Failed to load dashboard.'),
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

class _DashboardContent extends StatelessWidget {
  const _DashboardContent({required this.data, required this.onRefresh});
  final DashboardData data;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) => RefreshIndicator(
      onRefresh: onRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(constraints.maxWidth < 600 ? 16 : 28),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1440),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _StatsGrid(stats: data.stats),
                const SizedBox(height: 22),
                _MainDashboardRow(data: data),
                const SizedBox(height: 22),
                _ProgressAndNotes(data: data),
                const SizedBox(height: 24),
                _Recommendations(courses: data.recommended),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});
  final DashboardStats stats;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final columns = constraints.maxWidth >= 1000
          ? 4
          : constraints.maxWidth >= 540
          ? 2
          : 1;
      final width = (constraints.maxWidth - (columns - 1) * 12) / columns;
      final items = [
        _StatItem(
          icon: Icons.menu_book_outlined,
          value: '${stats.coursesInProgress}',
          label: 'Courses in Progress',
          badge: '+${stats.coursesInProgressDelta} This week',
          badgeColor: _green,
        ),
        _StatItem(
          icon: Icons.access_time,
          value: _number(stats.hoursLearned),
          label: 'Hours learned this month',
          badge: '${stats.hoursLearnedDelta}% of Goal',
          badgeColor: _green,
        ),
        _StatItem(
          icon: Icons.workspace_premium_outlined,
          value: '${stats.certificatesEarned}',
          label: 'Certificates Earned',
          badge: '${stats.certificatesPending} pending',
          badgeColor: _gold,
        ),
        _StatItem(
          icon: Icons.local_fire_department_outlined,
          value: '${stats.currentStreak} Days',
          label: 'Current Streak',
          badge: stats.currentStreak >= stats.streakRecord
              ? 'Personal Record'
              : 'Record: ${stats.streakRecord} days',
          badgeColor: _green,
        ),
      ];
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

class _StatItem {
  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.badge,
    required this.badgeColor,
  });
  final IconData icon;
  final String value;
  final String label;
  final String badge;
  final Color badgeColor;
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.item});
  final _StatItem item;

  @override
  Widget build(BuildContext context) => Container(
    constraints: const BoxConstraints(minHeight: 145),
    padding: const EdgeInsets.all(16),
    decoration: _cardDecoration(),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(item.icon, size: 20, color: _green),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                item.badge,
                textAlign: TextAlign.end,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: item.badgeColor,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          item.value,
          style: const TextStyle(
            fontFamily: 'serif',
            fontSize: 27,
            color: _navy,
          ),
        ),
        Text(item.label, style: const TextStyle(fontSize: 11, color: _muted)),
      ],
    ),
  );
}

class _MainDashboardRow extends StatelessWidget {
  const _MainDashboardRow({required this.data});
  final DashboardData data;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final continueCard = _ContinueLearning(courses: data.continueLearning);
      final rightColumn = Column(
        children: [
          _LiveClasses(classes: data.liveClasses),
          const SizedBox(height: 18),
          _Deadlines(deadlines: data.deadlines),
        ],
      );
      if (constraints.maxWidth < 850) {
        return Column(
          children: [continueCard, const SizedBox(height: 18), rightColumn],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 3, child: continueCard),
          const SizedBox(width: 18),
          Expanded(flex: 2, child: rightColumn),
        ],
      );
    },
  );
}

class _ContinueLearning extends StatelessWidget {
  const _ContinueLearning({required this.courses});
  final List<ContinueLearningCourse> courses;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: 'Continue learning',
    child: courses.isEmpty
        ? const _EmptyState(
            icon: Icons.menu_book_outlined,
            message: 'No courses enrolled yet.',
            actionLabel: 'Explore courses',
            onActionRoute: '/courses',
          )
        : Column(
            children: [
              for (var index = 0; index < courses.length; index++) ...[
                if (index > 0) const Divider(height: 20),
                _ContinueLearningRow(course: courses[index]),
              ],
            ],
          ),
  );
}

class _ContinueLearningRow extends StatelessWidget {
  const _ContinueLearningRow({required this.course});
  final ContinueLearningCourse course;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final compact = constraints.maxWidth < 570;
      return InkWell(
        onTap: () => context.push('/courses/${course.id}'),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
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
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _navy,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      course.moduleInfo,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: _muted),
                    ),
                    const SizedBox(height: 7),
                    _ProgressTrack(value: course.progress / 100),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '${course.progress}%',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: _navy,
                ),
              ),
              if (!compact) ...[
                const SizedBox(width: 12),
                const Icon(Icons.chevron_right, color: _muted, size: 19),
              ],
            ],
          ),
        ),
      );
    },
  );
}

class _LiveClasses extends StatelessWidget {
  const _LiveClasses({required this.classes});
  final List<UpcomingLiveClass> classes;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: 'Upcoming live classes',
    child: classes.isEmpty
        ? const _EmptyMessage('No upcoming live classes.')
        : Column(
            children: [
              for (var index = 0; index < classes.length; index++) ...[
                if (index > 0) const Divider(height: 18),
                _LiveClassRow(liveClass: classes[index]),
              ],
            ],
          ),
  );
}

class _LiveClassRow extends StatelessWidget {
  const _LiveClassRow({required this.liveClass});
  final UpcomingLiveClass liveClass;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Container(
        width: 42,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xFFFBF9F4),
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: _border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              liveClass.date,
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 16,
                color: _navy,
                height: 1,
              ),
            ),
            Text(
              liveClass.month.toUpperCase(),
              style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: _muted,
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
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _navy,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              '${liveClass.instructor} · ${liveClass.time}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 10, color: _muted),
            ),
          ],
        ),
      ),
      const SizedBox(width: 6),
      const Icon(Icons.video_call_outlined, size: 18, color: _green),
    ],
  );
}

class _Deadlines extends StatelessWidget {
  const _Deadlines({required this.deadlines});
  final List<DashboardDeadline> deadlines;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: 'Deadlines',
    child: deadlines.isEmpty
        ? const _EmptyMessage('No upcoming deadlines.')
        : Column(
            children: [
              for (var index = 0; index < deadlines.length; index++) ...[
                if (index > 0) const Divider(height: 18),
                _DeadlineRow(deadline: deadlines[index]),
              ],
            ],
          ),
  );
}

class _DeadlineRow extends StatelessWidget {
  const _DeadlineRow({required this.deadline});
  final DashboardDeadline deadline;

  @override
  Widget build(BuildContext context) {
    final dueLabel = deadline.daysRemaining <= 0
        ? 'Due today'
        : deadline.daysRemaining == 1
        ? 'Due tomorrow'
        : 'Due in ${deadline.daysRemaining} days';
    final color = deadline.urgent ? const Color(0xFFDC4C42) : _muted;
    return Row(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: deadline.urgent
              ? const Color(0xFFFFF0EE)
              : const Color(0xFFF4F5F5),
          child: Icon(Icons.warning_amber_rounded, size: 17, color: color),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                deadline.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: _navy,
                ),
              ),
              Text(
                dueLabel,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProgressAndNotes extends StatelessWidget {
  const _ProgressAndNotes({required this.data});
  final DashboardData data;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final progress = _WeeklyProgressChart(weeks: data.weeklyProgress);
      final notes = _RecentNotes(notes: data.notes);
      if (constraints.maxWidth < 700) {
        return Column(children: [progress, const SizedBox(height: 18), notes]);
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: progress),
          const SizedBox(width: 18),
          Expanded(child: notes),
        ],
      );
    },
  );
}

class _WeeklyProgressChart extends StatelessWidget {
  const _WeeklyProgressChart({required this.weeks});
  final List<WeeklyStudyProgress> weeks;

  @override
  Widget build(BuildContext context) {
    final maxHours = weeks.fold<double>(
      0,
      (maximum, week) => week.hours > maximum ? week.hours : maximum,
    );
    return _DashboardPanel(
      title: 'Your progress',
      subtitle: 'Weekly study hours',
      child: SizedBox(
        height: 176,
        child: weeks.isEmpty
            ? const Center(child: _EmptyMessage('Study time will appear here.'))
            : Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (final week in weeks)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              _number(week.hours),
                              style: const TextStyle(
                                fontSize: 9,
                                color: _muted,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Container(
                              width: 30,
                              height: maxHours <= 0
                                  ? 4
                                  : 116 * (week.hours / maxHours),
                              decoration: BoxDecoration(
                                color: const Color(0xFF12304E),
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(5),
                                ),
                              ),
                            ),
                            const SizedBox(height: 7),
                            Text(
                              'W${week.week}',
                              style: const TextStyle(
                                fontSize: 9,
                                color: _muted,
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

class _RecentNotes extends StatelessWidget {
  const _RecentNotes({required this.notes});
  final List<DashboardNote> notes;

  @override
  Widget build(BuildContext context) => _DashboardPanel(
    title: 'Recent notes',
    child: notes.isEmpty
        ? const _EmptyMessage('No notes yet.')
        : Column(
            children: [
              for (var index = 0; index < notes.length; index++) ...[
                if (index > 0) const Divider(height: 20),
                _NoteRow(note: notes[index]),
              ],
            ],
          ),
  );
}

class _NoteRow extends StatelessWidget {
  const _NoteRow({required this.note});
  final DashboardNote note;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.only(left: 12),
    decoration: const BoxDecoration(
      border: Border(left: BorderSide(color: _gold, width: 3)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                note.subject.toUpperCase(),
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: _gold,
                ),
              ),
            ),
            Text(
              note.timeAgo,
              style: const TextStyle(fontSize: 9, color: _muted),
            ),
          ],
        ),
        const SizedBox(height: 5),
        Text(
          note.text,
          style: const TextStyle(
            fontSize: 11,
            height: 1.4,
            color: Color(0xFF4B5563),
          ),
        ),
      ],
    ),
  );
}

class _Recommendations extends StatelessWidget {
  const _Recommendations({required this.courses});
  final List<RecommendedCourse> courses;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'Recommended for you',
        style: TextStyle(fontFamily: 'serif', fontSize: 20, color: _navy),
      ),
      const SizedBox(height: 14),
      if (courses.isEmpty)
        const _DashboardPanel(
          child: _EmptyMessage('No recommendations available right now.'),
        )
      else
        LayoutBuilder(
          builder: (context, constraints) {
            final columns = constraints.maxWidth >= 900
                ? 3
                : constraints.maxWidth >= 560
                ? 2
                : 1;
            final width = (constraints.maxWidth - 14 * (columns - 1)) / columns;
            return Wrap(
              spacing: 14,
              runSpacing: 14,
              children: [
                for (final course in courses)
                  SizedBox(
                    width: width,
                    child: _RecommendedCourseCard(course: course),
                  ),
              ],
            );
          },
        ),
    ],
  );
}

class _RecommendedCourseCard extends StatelessWidget {
  const _RecommendedCourseCard({required this.course});
  final RecommendedCourse course;

  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    child: InkWell(
      onTap: () => context.push('/courses/${course.id}'),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _CourseThumbnail(
              url: course.thumbnailUrl,
              width: double.infinity,
              height: 146,
            ),
            Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          course.level.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 9,
                            color: _green,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const Icon(Icons.star, size: 14, color: _gold),
                      const SizedBox(width: 4),
                      Text(
                        _number(course.rating),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _gold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 9),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 17,
                      height: 1.2,
                      color: _navy,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    course.instructor,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: _muted),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Learn more  →',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _green,
                    ),
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

class _CourseThumbnail extends StatelessWidget {
  const _CourseThumbnail({
    required this.url,
    required this.width,
    required this.height,
  });
  final String? url;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final imageUrl = url?.trim();
    if (imageUrl == null || imageUrl.isEmpty) {
      return Container(
        width: width,
        height: height,
        color: const Color(0xFFEFF2F0),
        alignment: Alignment.center,
        child: const Icon(
          Icons.menu_book_outlined,
          color: Color(0xFF94A3B8),
          size: 28,
        ),
      );
    }
    return Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        width: width,
        height: height,
        color: const Color(0xFFEFF2F0),
        alignment: Alignment.center,
        child: const Icon(
          Icons.menu_book_outlined,
          color: Color(0xFF94A3B8),
          size: 28,
        ),
      ),
    );
  }
}

class _ProgressTrack extends StatelessWidget {
  const _ProgressTrack({required this.value});
  final double value;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(20),
    child: LinearProgressIndicator(
      value: value.clamp(0, 1),
      minHeight: 6,
      backgroundColor: const Color(0xFFF0F2F2),
      color: _green,
    ),
  );
}

class _DashboardPanel extends StatelessWidget {
  const _DashboardPanel({this.title, this.subtitle, required this.child});
  final String? title;
  final String? subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(18),
    decoration: _cardDecoration(),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) ...[
          Text(
            title!,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 18,
              color: _navy,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 3),
            Text(
              subtitle!,
              style: const TextStyle(fontSize: 10, color: _muted),
            ),
          ],
          const SizedBox(height: 14),
        ],
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
  final String message;
  final String actionLabel;
  final String onActionRoute;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        children: [
          Icon(icon, size: 32, color: const Color(0xFF94A3B8)),
          const SizedBox(height: 6),
          Text(message, style: const TextStyle(fontSize: 12, color: _muted)),
          TextButton(
            onPressed: () => context.go(onActionRoute),
            child: Text(actionLabel),
          ),
        ],
      ),
    ),
  );
}

class _EmptyMessage extends StatelessWidget {
  const _EmptyMessage(this.message);
  final String message;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 10),
    child: Text(message, style: const TextStyle(fontSize: 12, color: _muted)),
  );
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
          const Icon(
            Icons.cloud_off_outlined,
            size: 42,
            color: Color(0xFF94A3B8),
          ),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              FilledButton.tonal(
                onPressed: onRetry,
                child: const Text('Try again'),
              ),
              TextButton(
                onPressed: onSwitchProfile,
                child: const Text('Switch profile'),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

BoxDecoration _cardDecoration() => BoxDecoration(
  color: Colors.white,
  borderRadius: BorderRadius.circular(12),
  border: Border.all(color: _border),
);

String _number(num value) => value == value.roundToDouble()
    ? value.toStringAsFixed(0)
    : value.toStringAsFixed(1);
