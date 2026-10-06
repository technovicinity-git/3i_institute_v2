import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../domain/entities/instructor_batch.dart';
import '../providers/instructor_courses_providers.dart';

const _navy = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);
const _warnBorder = Color(0xFFFDE68A);
const _warnText = Color(0xFFA16207);

class InstructorLiveClassesPage extends ConsumerWidget {
  const InstructorLiveClassesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessions = ref.watch(instructorExistingSessionsProvider);
    final batchCount = ref.watch(instructorBatchCountProvider).asData?.value;
    final items = sessions.asData?.value ?? const <InstructorExistingSession>[];
    final conflicts = _conflictingIds(items);

    return RefreshIndicator(
      onRefresh: () {
        ref.invalidate(instructorBatchCountProvider);
        return ref.refresh(instructorExistingSessionsProvider.future);
      },
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Live Classes',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _navy),
          ),
          Text(
            '${items.length} upcoming sessions across ${batchCount ?? 0} '
            'batches',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          if (conflicts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEFCE8),
                border: Border.all(color: _warnBorder),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.warning_amber_rounded, color: _warnText),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Schedule conflict detected',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF854D0E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${conflicts.length} sessions overlap with each '
                          'other. Please review and reschedule.',
                          style: const TextStyle(
                            fontSize: 12,
                            color: _warnText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            'Upcoming Schedule (${items.length})',
            style: const TextStyle(fontWeight: FontWeight.w600, color: _green),
          ),
          const SizedBox(height: 12),
          ...sessions.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _Message(
                text: 'Could not load sessions.',
                action: TextButton(
                  onPressed: () =>
                      ref.invalidate(instructorExistingSessionsProvider),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => items.isEmpty
                ? const [_Message(text: 'No upcoming sessions.')]
                : [
                    for (final day in _groupByDay(items)) ...[
                      _DayHeader(date: day.date, count: day.sessions.length),
                      for (final session in day.sessions)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _SessionCard(
                            session: session,
                            conflict: conflicts.contains(session.id),
                          ),
                        ),
                      const SizedBox(height: 14),
                    ],
                  ],
          ),
        ],
      ),
    );
  }
}

class _DayHeader extends StatelessWidget {
  const _DayHeader({required this.date, required this.count});
  final DateTime date;
  final int count;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(
      children: [
        Text(
          DateFormat('EEE, MMM d').format(date),
          style: const TextStyle(fontWeight: FontWeight.bold, color: _navy),
        ),
        const SizedBox(width: 10),
        const Expanded(child: Divider(color: _border)),
        const SizedBox(width: 10),
        Text(
          '$count session${count > 1 ? 's' : ''}',
          style: const TextStyle(fontSize: 12, color: _muted),
        ),
      ],
    ),
  );
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({required this.session, required this.conflict});
  final InstructorExistingSession session;
  final bool conflict;

  @override
  Widget build(BuildContext context) {
    final start = DateTime.tryParse(session.scheduledAt)?.toLocal();
    final link = session.meetingLink;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: conflict ? const Color(0xFFFFFDF2) : Colors.white,
        border: Border.all(color: conflict ? const Color(0xFFFCD34D) : _border),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.schedule, size: 16, color: _gold),
                    const SizedBox(height: 3),
                    Text(
                      start == null ? '--' : DateFormat('h:mm a').format(start),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _muted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          session.title,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _navy,
                          ),
                        ),
                        if (conflict)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.warning_amber_rounded,
                                  size: 12,
                                  color: _warnText,
                                ),
                                SizedBox(width: 3),
                                Text(
                                  'CONFLICT',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: _warnText,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${session.courseTitle} • ${session.batchName}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: _muted),
                    ),
                    const SizedBox(height: 5),
                    Wrap(
                      spacing: 12,
                      children: [
                        _Meta(Icons.schedule, '${session.durationMinutes} min'),
                        _Meta(
                          Icons.people_outline,
                          '${session.enrolmentCount} enrolled',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () => context.push(
                  '/instructor/chat?courseId=${session.courseId}'
                  '&courseTitle=${Uri.encodeComponent(session.courseTitle)}'
                  '&batchId=${session.batchId}'
                  '&batchName=${Uri.encodeComponent(session.batchName)}',
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _navy,
                  visualDensity: VisualDensity.compact,
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 16),
                label: const Text('Chat'),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: session.courseId.isEmpty || session.batchId.isEmpty
                    ? null
                    : () => context.push(
                        '/instructor/courses/${session.courseId}/batches/${session.batchId}',
                      ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _navy,
                  visualDensity: VisualDensity.compact,
                ),
                child: const Text('Details'),
              ),
              const Spacer(),
              if (link != null)
                FilledButton.icon(
                  onPressed: () => _join(context, link),
                  style: FilledButton.styleFrom(
                    backgroundColor: _green,
                    visualDensity: VisualDensity.compact,
                  ),
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text('Join'),
                )
              else
                const Text(
                  'No link yet',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFCA8A04),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _join(BuildContext context, String link) async {
    final uri = Uri.tryParse(link);
    final opened =
        uri != null &&
        await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the meeting link.')),
      );
    }
  }
}

class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.text);
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 13, color: _muted),
      const SizedBox(width: 3),
      Text(text, style: const TextStyle(fontSize: 12, color: _muted)),
    ],
  );
}

class _Message extends StatelessWidget {
  const _Message({required this.text, this.action});
  final String text;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      children: [
        const Icon(Icons.videocam_outlined, size: 42, color: Color(0xFFCBD5E1)),
        const SizedBox(height: 10),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _muted),
        ),
        ?action,
      ],
    ),
  );
}

/// Ids of sessions whose time ranges overlap another session.
Set<String> _conflictingIds(List<InstructorExistingSession> sessions) {
  final ranges = [
    for (final s in sessions)
      if (DateTime.tryParse(s.scheduledAt) case final start?)
        (
          id: s.id,
          start: start,
          end: start.add(Duration(minutes: s.durationMinutes)),
        ),
  ];
  final ids = <String>{};
  for (var i = 0; i < ranges.length; i++) {
    for (var j = i + 1; j < ranges.length; j++) {
      final a = ranges[i], b = ranges[j];
      if (a.start.isBefore(b.end) && b.start.isBefore(a.end)) {
        ids
          ..add(a.id)
          ..add(b.id);
      }
    }
  }
  return ids;
}

/// Groups sessions by local calendar day, keeping the API's time order.
List<({DateTime date, List<InstructorExistingSession> sessions})> _groupByDay(
  List<InstructorExistingSession> sessions,
) {
  final groups = <DateTime, List<InstructorExistingSession>>{};
  for (final s in sessions) {
    final start = DateTime.tryParse(s.scheduledAt)?.toLocal();
    if (start == null) continue;
    groups
        .putIfAbsent(DateTime(start.year, start.month, start.day), () => [])
        .add(s);
  }
  return [
    for (final MapEntry(key: date, value: list) in groups.entries)
      (date: date, sessions: list),
  ];
}
