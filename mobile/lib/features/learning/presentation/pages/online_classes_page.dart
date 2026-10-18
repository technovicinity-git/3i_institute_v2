import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../certificates/domain/certificate.dart';
import '../../../certificates/presentation/certificates_providers.dart';
import '../../../certificates/presentation/pages/certificates_page.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/learning_models.dart';
import '../learning_providers.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../../core/format/date_format.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);

class OnlineClassesPage extends ConsumerStatefulWidget {
  const OnlineClassesPage({super.key});
  @override
  ConsumerState<OnlineClassesPage> createState() => _OnlineClassesPageState();
}

class _OnlineClassesPageState extends ConsumerState<OnlineClassesPage> {
  final _search = TextEditingController();
  String _query = '';
  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Center(
        child: Text(context.l10n.classesSelectProfile),
      );
    }
    final classesAsync = ref.watch(enrolledCoursesProvider(profile.id));
    return classesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _EmptyState(
        icon: Icons.cloud_off_outlined,
        title: context.l10n.classesLoadFailed,
        action: TextButton(
          onPressed: () => ref.invalidate(enrolledCoursesProvider(profile.id)),
          child: Text(context.l10n.commonTryAgain),
        ),
      ),
      data: (allCourses) {
        final classes = allCourses
            .where((c) => c.type == 'ONLINE_CLASS')
            .toList(growable: false);
        final filtered = classes
            .where(
              (c) => '${c.title} ${c.instructorName}'.toLowerCase().contains(
                _query.trim().toLowerCase(),
              ),
            )
            .toList(growable: false);
        return RefreshIndicator(
          color: _navy,
          onRefresh: () =>
              ref.refresh(enrolledCoursesProvider(profile.id).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
            children: [
              Text(
                context.l10n.classesTitle,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: const Color(0xFF0C1F33),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                context.l10n.classesCount(classes.length),
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              if (classes.isNotEmpty) ...[
                const SizedBox(height: 20),
                TextField(
                  controller: _search,
                  onChanged: (v) => setState(() => _query = v),
                  decoration: InputDecoration(
                    hintText: context.l10n.learnSearch,
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              if (classes.isEmpty)
                _EmptyState(
                  icon: Icons.video_library_outlined,
                  title: context.l10n.classesNone,
                  description: context.l10n.classesNoneBody,
                  action: FilledButton(
                    onPressed: () => context.go('/courses'),
                    child: Text(context.l10n.learnBrowse),
                  ),
                )
              else if (filtered.isEmpty)
                _EmptyState(
                  icon: Icons.search_off,
                  title: context.l10n.classesNoMatch,
                  description: context.l10n.classesNoMatchBody,
                )
              else
                ...filtered.map((course) => _OnlineClassCard(course: course)),
            ],
          ),
        );
      },
    );
  }
}

class _OnlineClassCard extends ConsumerWidget {
  const _OnlineClassCard({required this.course});
  final EnrolledCourse course;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(activeLearnerProfileProvider);
    final certificates = profile == null
        ? null
        : ref.watch(learnerCertificatesProvider(profile.id)).asData?.value;
    final completionCertificate = certificates
        ?.where(
          (c) => c.courseId == course.courseId && c.type == 'COMPLETION',
        )
        .firstOrNull;
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 14),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: SizedBox(
                    width: 96,
                    height: 78,
                    child:
                        course.thumbnailUrl == null ||
                            course.thumbnailUrl!.isEmpty
                        ? const ColoredBox(
                            color: _navy,
                            child: Icon(
                              Icons.menu_book,
                              color: Colors.white70,
                              size: 32,
                            ),
                          )
                        : Image.network(
                            course.thumbnailUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => const ColoredBox(
                              color: _navy,
                              child: Icon(
                                Icons.menu_book,
                                color: Colors.white70,
                                size: 32,
                              ),
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 5,
                        children: [
                          _Badge(text: _level(context.l10n, course.level)),
                          const _Badge(text: 'LIVE', live: true),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 17,
                          color: Color(0xFF0C1F33),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        course.instructorName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (course.nextSession != null)
              Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: _gold,
                      size: 19,
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            course.nextSession!.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFF0C1F33),
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            _formatDateTime(context.l10n, course.nextSession!.scheduledAt),
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              Padding(
                padding: EdgeInsets.symmetric(vertical: 6),
                child: Text(
                  context.l10n.classesNoUpcoming,
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                ),
              ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.only(top: 12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => context.push(
                        Uri(
                          path: '/chat',
                          queryParameters: {
                            'courseId': course.courseId,
                            'courseTitle': course.title,
                            if (course.batchId?.isNotEmpty == true)
                              'batchId': course.batchId!,
                            'batchName': course.batchName ?? context.l10n.classesBatch,
                          },
                        ).toString(),
                      ),
                      icon: const Icon(Icons.chat_bubble_outline, size: 18),
                      label: Text(context.l10n.classesChat),
                      style: FilledButton.styleFrom(backgroundColor: _navy),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _CourseActionsMenu(
                    course: course,
                    completionCertificate: completionCertificate,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CourseActionsMenu extends StatelessWidget {
  const _CourseActionsMenu({required this.course, this.completionCertificate});
  final EnrolledCourse course;
  final LearnerCertificate? completionCertificate;

  @override
  Widget build(BuildContext context) => PopupMenuButton<String>(
    tooltip: context.l10n.classesMoreActions,
    color: Colors.white,
    position: PopupMenuPosition.under,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    onSelected: (value) => switch (value) {
      'details' => context.push('/courses/${course.courseId}'),
      'sessions' => context.push('/online-classes/${course.batchId}'),
      'exams' => context.push(
        '/my-courses/${course.courseId}/exams?online=true',
      ),
      'certificate' => printCertificatePdf(context, completionCertificate!),
      _ => null,
    },
    itemBuilder: (_) => [
      PopupMenuItem(
        value: 'details',
        child: _MenuRow(icon: Icons.open_in_new, label: context.l10n.classesDetails, color: _navy),
      ),
      if (course.batchId?.isNotEmpty == true)
        PopupMenuItem(
          value: 'sessions',
          child: _MenuRow(
            icon: Icons.calendar_month_outlined,
            label: context.l10n.classesSessions,
            color: _gold,
          ),
        ),
      PopupMenuItem(
        value: 'exams',
        child: _MenuRow(
          icon: Icons.description_outlined,
          label: context.l10n.classesExams,
          color: _navy,
        ),
      ),
      if (completionCertificate != null)
        PopupMenuItem(
          value: 'certificate',
          child: _MenuRow(
            icon: Icons.download_outlined,
            label: context.l10n.classesCertificate,
            color: _green,
            labelColor: _green,
          ),
        ),
    ],
    child: Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: const Color(0xFFE3E8EF)),
      ),
      child: const Icon(Icons.more_vert, size: 18, color: Color(0xFF64748B)),
    ),
  );
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.icon,
    required this.label,
    required this.color,
    this.labelColor = const Color(0xFF0C1F33),
  });
  final IconData icon;
  final String label;
  final Color color, labelColor;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Icon(icon, size: 18, color: color),
      const SizedBox(width: 10),
      Text(label, style: TextStyle(color: labelColor)),
    ],
  );
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, this.live = false});
  final String text;
  final bool live;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: live ? const Color(0xFF7C3AED) : Colors.white,
      borderRadius: BorderRadius.circular(5),
      border: live ? null : Border.all(color: const Color(0xFFE3E8EF)),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w700,
        color: live ? Colors.white : const Color(0xFF0C1F33),
      ),
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    this.description,
    this.action,
  });
  final IconData icon;
  final String title;
  final String? description;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 26),
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, color: const Color(0xFF94A3B8), size: 38),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _navy, fontWeight: FontWeight.w600),
        ),
        if (description != null) ...[
          const SizedBox(height: 6),
          Text(
            description!,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
        ],
        if (action != null) ...[const SizedBox(height: 10), action!],
      ],
    ),
  );
}

String _level(AppLocalizations l10n, String value) => switch (value.toLowerCase()) {
  '1' || 'beginner' => l10n.levelBeginnerCaps,
  '2' || 'intermediate' => l10n.levelIntermediateCaps,
  '3' || 'advanced' => l10n.levelAdvancedCaps,
  _ => l10n.levelAllCaps,
};
String _formatDateTime(AppLocalizations l10n, String value) {
  final date = DateTime.tryParse(value)?.toLocal();
  if (date == null) return l10n.classesDateTba;
  return '${formatDate(date, DateStyle.weekdayDayMonth)} • ${formatDate(date, DateStyle.time)}';
}
