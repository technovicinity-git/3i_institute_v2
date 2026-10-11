import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../instructor_dashboard/domain/entities/instructor_dashboard_data.dart';
import '../../../instructor_dashboard/domain/grading.dart';
import '../providers/instructor_courses_providers.dart';

const _navy = Color(0xFF0C1F33);
const _deepNavy = Color(0xFF12304E);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _gold = Color(0xFFB8912F);
const _red = Color(0xFFDC2626);

/// Every exam submission waiting for manual grading, oldest first.
class InstructorGradingPage extends ConsumerStatefulWidget {
  const InstructorGradingPage({super.key});
  @override
  ConsumerState<InstructorGradingPage> createState() =>
      _InstructorGradingPageState();
}

class _InstructorGradingPageState extends ConsumerState<InstructorGradingPage> {
  String _courseId = '';
  String _examId = '';
  bool _overdueOnly = false;

  @override
  Widget build(BuildContext context) {
    final pending = ref.watch(instructorPendingAttemptsProvider);
    final all = pending.asData?.value ?? const <InstructorPendingAttempt>[];

    // Filter options come from the pending attempts themselves, so only
    // courses and exams with something to grade are offered.
    final courses = {for (final a in all) a.courseId: a.courseTitle};
    final exams = {
      for (final a in all)
        if (_courseId.isEmpty || a.courseId == _courseId) a.examId: a.examTitle,
    };
    final filtered = all
        .where(
          (a) =>
              (_courseId.isEmpty || a.courseId == _courseId) &&
              (_examId.isEmpty || a.examId == _examId) &&
              (!_overdueOnly || isGradingOverdue(a.submittedAt)),
        )
        .toList();
    final overdueCount = all
        .where((a) => isGradingOverdue(a.submittedAt))
        .length;

    return RefreshIndicator(
      onRefresh: () => ref.refresh(instructorPendingAttemptsProvider.future),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Needs Grading',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          const SizedBox(height: 2),
          Text.rich(
            TextSpan(
              text:
                  '${all.length} submission${all.length == 1 ? '' : 's'} '
                  'waiting, oldest first',
              children: [
                if (overdueCount > 0)
                  TextSpan(
                    text: ' · $overdueCount overdue',
                    style: const TextStyle(color: _red),
                  ),
              ],
            ),
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          ...pending.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _StateCard(
                icon: Icons.error_outline,
                title: 'Could not load submissions.',
                action: TextButton(
                  onPressed: () =>
                      ref.invalidate(instructorPendingAttemptsProvider),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (all.isEmpty)
                const _StateCard(
                  icon: Icons.check_circle_outline,
                  iconColor: Color(0xFF22A146),
                  title: 'All caught up',
                  message: 'There are no exam submissions waiting for grading.',
                )
              else ...[
                _FilterDropdown(
                  value: _courseId,
                  allLabel: 'All courses',
                  options: courses,
                  onChanged: (v) => setState(() {
                    _courseId = v;
                    _examId = '';
                  }),
                ),
                const SizedBox(height: 10),
                _FilterDropdown(
                  value: _examId,
                  allLabel: 'All exams',
                  options: exams,
                  onChanged: (v) => setState(() => _examId = v),
                ),
                CheckboxListTile(
                  value: _overdueOnly,
                  onChanged: (v) => setState(() => _overdueOnly = v ?? false),
                  title: Text(
                    'Overdue only ($gradingOverdueDays+ days)',
                    style: const TextStyle(fontSize: 14, color: _navy),
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  activeColor: _deepNavy,
                ),
                const SizedBox(height: 6),
                if (filtered.isEmpty)
                  const _StateCard(
                    icon: Icons.filter_alt_off_outlined,
                    title: 'No submissions match these filters.',
                  )
                else
                  Container(
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: _border),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: Column(
                      children: [
                        for (final (i, attempt) in filtered.indexed) ...[
                          if (i > 0) const Divider(height: 1, color: _border),
                          PendingAttemptTile(attempt: attempt),
                        ],
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// One pending submission row. Tapping opens its grade page.
class PendingAttemptTile extends StatelessWidget {
  const PendingAttemptTile({required this.attempt, super.key});
  final InstructorPendingAttempt attempt;

  @override
  Widget build(BuildContext context) {
    final overdue = isGradingOverdue(attempt.submittedAt);
    return Material(
      color: overdue ? const Color(0xFFFEF2F2) : Colors.white,
      child: InkWell(
        onTap: () => context.push(
          '/instructor/courses/${attempt.courseId}/exams/${attempt.examId}/attempts/${attempt.id}/grade',
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              CircleAvatar(
                radius: 17,
                backgroundColor: overdue
                    ? const Color(0xFFFEE2E2)
                    : const Color(0xFFF9F6F0),
                child: Icon(
                  overdue
                      ? Icons.warning_amber_rounded
                      : Icons.description_outlined,
                  size: 17,
                  color: overdue ? _red : _gold,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      attempt.learnerName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: _navy,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${attempt.examTitle}'
                      '${attempt.attemptNumber > 1 ? ' (attempt ${attempt.attemptNumber})' : ''}'
                      ' • ${attempt.courseTitle}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: _muted),
                    ),
                    Text(
                      gradingWaitingLabel(attempt.submittedAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: overdue ? _red : const Color(0xFF94A3B8),
                        fontWeight: overdue
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: _deepNavy,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Grade',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Icon(Icons.chevron_right, size: 16, color: Colors.white),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterDropdown extends StatelessWidget {
  const _FilterDropdown({
    required this.value,
    required this.allLabel,
    required this.options,
    required this.onChanged,
  });
  final String value, allLabel;
  final Map<String, String> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) => DropdownButtonFormField<String>(
    initialValue: options.containsKey(value) ? value : '',
    isExpanded: true,
    decoration: InputDecoration(
      isDense: true,
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: _border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: _border),
      ),
    ),
    items: [
      DropdownMenuItem(value: '', child: Text(allLabel)),
      for (final e in options.entries)
        DropdownMenuItem(
          value: e.key,
          child: Text(e.value, overflow: TextOverflow.ellipsis),
        ),
    ],
    onChanged: (v) => onChanged(v ?? ''),
  );
}

class _StateCard extends StatelessWidget {
  const _StateCard({
    required this.icon,
    required this.title,
    this.message,
    this.iconColor = const Color(0xFFCBD5E1),
    this.action,
  });
  final IconData icon;
  final String title;
  final String? message;
  final Color iconColor;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: iconColor),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
        ),
        if (message != null) ...[
          const SizedBox(height: 5),
          Text(
            message!,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: _muted),
          ),
        ],
        ?action,
      ],
    ),
  );
}
