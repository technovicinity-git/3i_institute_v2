import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../domain/entities/instructor_dashboard_data.dart';
import '../providers/instructor_dashboard_providers.dart';

class InstructorDashboardPage extends ConsumerWidget {
  const InstructorDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(instructorDashboardProvider);
    return dashboard.when(
      loading: () => const Center(
        child: CircularProgressIndicator(color: Color(0xFF12304E)),
      ),
      error: (error, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.cloud_off_outlined,
                size: 44,
                color: Color(0xFF64748B),
              ),
              const SizedBox(height: 12),
              const Text(
                'Could not load your dashboard',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF12304E),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Check your connection and try again.',
                style: TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: () => ref.invalidate(instructorDashboardProvider),
                child: const Text('Try again'),
              ),
            ],
          ),
        ),
      ),
      data: (data) => RefreshIndicator(
        color: const Color(0xFF12304E),
        onRefresh: () => ref.refresh(instructorDashboardProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Instructor Dashboard',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: 'serif',
                color: const Color(0xFF0C1F33),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Overview of your courses and students.',
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            if (data.stats.pendingGrading > 0) ...[
              const SizedBox(height: 20),
              _PendingAlert(count: data.stats.pendingGrading),
            ],
            const SizedBox(height: 20),
            _StatsGrid(stats: data.stats),
            const SizedBox(height: 24),
            _SectionCard(
              title: 'Your Courses',
              actionLabel: 'View all',
              onAction: () => _openSection(context, 'My Courses'),
              child: _courses(data.recentCourses),
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Upcoming Classes',
              actionLabel: 'View all',
              onAction: () => _openSection(context, 'Live Classes'),
              child: _classes(context, data.upcomingClasses),
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Recent Enrolments',
              actionLabel: 'View all students',
              onAction: () => _openSection(context, 'Students'),
              child: _enrolments(data.recentEnrolments),
            ),
            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _courses(List<InstructorCourseSummary> courses) => courses.isEmpty
      ? const _EmptyMessage('No courses yet.')
      : Column(
          children: [
            for (var i = 0; i < courses.length; i++) ...[
              if (i > 0) const Divider(height: 16, color: Color(0xFFF0F2F4)),
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(9),
                    child: SizedBox(
                      width: 52,
                      height: 52,
                      child: courses[i].thumbnailUrl == null
                          ? const ColoredBox(
                              color: Color(0xFFF9F6F0),
                              child: Icon(
                                Icons.menu_book_outlined,
                                color: Color(0xFFB8912F),
                              ),
                            )
                          : Image.network(
                              courses[i].thumbnailUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => const ColoredBox(
                                color: Color(0xFFF9F6F0),
                                child: Icon(
                                  Icons.menu_book_outlined,
                                  color: Color(0xFFB8912F),
                                ),
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          courses[i].title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                        Text(
                          '${courses[i].enrolmentCount} students',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.star, size: 16, color: Color(0xFFB8912F)),
                  const SizedBox(width: 3),
                  Text(
                    courses[i].averageRating?.toStringAsFixed(1) ?? 'New',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ],
        );

  Widget _classes(BuildContext context, List<InstructorClassSummary> classes) =>
      classes.isEmpty
      ? const _EmptyMessage('No upcoming sessions.')
      : Column(
          children: [
            for (var i = 0; i < classes.length; i++) ...[
              if (i > 0) const Divider(height: 16, color: Color(0xFFF0F2F4)),
              Row(
                children: [
                  const CircleAvatar(
                    radius: 19,
                    backgroundColor: Color(0xFFF9F6F0),
                    child: Icon(
                      Icons.schedule,
                      size: 18,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          classes[i].title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                        Text(
                          _dateTime(classes[i].scheduledAt),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (classes[i].meetingLink != null)
                    IconButton(
                      tooltip: 'Open meeting',
                      onPressed: () =>
                          _openMeeting(context, classes[i].meetingLink!),
                      icon: const Icon(
                        Icons.open_in_new,
                        color: Color(0xFF22A146),
                        size: 20,
                      ),
                    ),
                ],
              ),
            ],
          ],
        );

  Widget _enrolments(List<InstructorEnrolmentSummary> enrolments) =>
      enrolments.isEmpty
      ? const _EmptyMessage('No enrolments yet.')
      : Column(
          children: [
            for (var i = 0; i < enrolments.length; i++) ...[
              if (i > 0) const Divider(height: 16, color: Color(0xFFF0F2F4)),
              Row(
                children: [
                  const CircleAvatar(
                    radius: 17,
                    backgroundColor: Color(0xFFF9F6F0),
                    child: Icon(
                      Icons.person_add_alt_1,
                      size: 17,
                      color: Color(0xFFB8912F),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          enrolments[i].learnerName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                        Text(
                          'Enrolled in ${enrolments[i].courseTitle}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _timeAgo(enrolments[i].enrolledAt),
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ],
          ],
        );

  Future<void> _openMeeting(BuildContext context, String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null ||
        !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (context.mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to open the meeting link.')),
        );
    }
  }

  String _dateTime(String raw) {
    final date = DateTime.tryParse(raw)?.toLocal();
    return date == null
        ? 'Time to be confirmed'
        : '${DateFormat('MMM d').format(date)} · ${DateFormat('h:mm a').format(date)}';
  }

  String _timeAgo(String raw) {
    final date = DateTime.tryParse(raw)?.toLocal();
    if (date == null) return '';
    final hours = DateTime.now().difference(date).inHours;
    if (hours < 1) return 'Just now';
    if (hours < 24) return '$hours hr ago';
    final days = hours ~/ 24;
    if (days < 7) return '$days d ago';
    return DateFormat('MMM d').format(date);
  }

  void _openSection(BuildContext context, String title) {
    final path = switch (title) {
      'My Courses' => '/instructor/courses',
      'Live Classes' => '/instructor/live-classes',
      _ => '/instructor/students',
    };
    context.go(path);
  }
}

class _PendingAlert extends StatelessWidget {
  const _PendingAlert({required this.count});
  final int count;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF8E5),
      border: Border.all(color: const Color(0xFFF1D98A)),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Row(
      children: [
        const Icon(Icons.error_outline, color: Color(0xFFB8912F)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'You have $count exam ${count == 1 ? 'attempt' : 'attempts'} waiting for grading.',
            style: const TextStyle(color: Color(0xFF755B16), height: 1.35),
          ),
        ),
      ],
    ),
  );
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});
  final InstructorDashboardStats stats;

  @override
  Widget build(BuildContext context) {
    final items = [
      (
        'My Courses',
        stats.totalCourses,
        Icons.menu_book_outlined,
        const Color(0xFF22A146),
      ),
      (
        'Total Students',
        stats.totalStudents,
        Icons.people_outline,
        const Color(0xFF2563EB),
      ),
      (
        'Upcoming Sessions',
        stats.upcomingSessions,
        Icons.video_library_outlined,
        const Color(0xFF7C3AED),
      ),
      (
        'Certificates',
        stats.totalCertificates,
        Icons.workspace_premium_outlined,
        const Color(0xFFB8912F),
      ),
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 760 ? 4 : 2;
        final width = (constraints.maxWidth - (columns - 1) * 10) / columns;
        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            for (final item in items)
              SizedBox(
                width: width,
                child: Container(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE9EDF1)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: item.$4,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Icon(item.$3, color: Colors.white, size: 21),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${item.$2}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0C1F33),
                              ),
                            ),
                            Text(
                              item.$1,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.actionLabel,
    required this.onAction,
    required this.child,
  });
  final String title, actionLabel;
  final VoidCallback onAction;
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE9EDF1)),
      borderRadius: BorderRadius.circular(13),
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
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: Color(0xFF0C1F33),
                ),
              ),
            ),
            TextButton(
              onPressed: onAction,
              child: Text(
                actionLabel,
                style: const TextStyle(color: Color(0xFF22A146), fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        child,
      ],
    ),
  );
}

class _EmptyMessage extends StatelessWidget {
  const _EmptyMessage(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Text(
      text,
      style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
    ),
  );
}

class InstructorSectionPlaceholderPage extends StatelessWidget {
  const InstructorSectionPlaceholderPage({required this.title, super.key});
  final String title;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.construction_outlined,
            color: Color(0xFFB8912F),
            size: 42,
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(color: const Color(0xFF12304E)),
          ),
          const SizedBox(height: 6),
          const Text(
            'This instructor section will be available in a later phase.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B)),
          ),
        ],
      ),
    ),
  );
}
