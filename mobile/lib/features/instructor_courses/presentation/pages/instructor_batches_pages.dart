import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../domain/entities/instructor_batch.dart';
import '../../domain/entities/instructor_course.dart';
import '../providers/instructor_courses_providers.dart';

class InstructorBatchesPage extends ConsumerWidget {
  const InstructorBatchesPage({required this.courseId, super.key});
  final String courseId;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final batches = ref.watch(instructorCourseBatchesProvider(courseId));
    final courses = ref.watch(instructorCoursesProvider);
    final course = courses.asData?.value
        .where((c) => c.id == courseId)
        .firstOrNull;
    return batches.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _BatchRetry(
        onRetry: () =>
            ref.invalidate(instructorCourseBatchesProvider(courseId)),
      ),
      data: (items) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: () => context.go('/instructor/courses'),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to courses'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          if (course != null) _CourseActionStrip(course: course),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Batches',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 27,
                    color: Color(0xFF0C1F33),
                  ),
                ),
              ),
              FilledButton.icon(
                onPressed: () => context.push(
                  '/instructor/courses/$courseId/batches/create',
                ),
                icon: const Icon(Icons.add),
                label: const Text('Create'),
              ),
            ],
          ),
          Text(
            '${items.length} batches for this course',
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          if (items.isEmpty)
            const _EmptyBatchList()
          else
            for (final batch in items)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _BatchCard(
                  batch: batch,
                  onClose: () => _closeBatch(context, ref, batch),
                ),
              ),
        ],
      ),
    );
  }

  Future<void> _closeBatch(
    BuildContext context,
    WidgetRef ref,
    InstructorBatch batch,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Close this batch?'),
        content: Text('Learners will no longer be able to join ${batch.name}.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Close Batch'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await ref.read(instructorCoursesRepositoryProvider).closeBatch(batch.id);
      ref.invalidate(instructorCourseBatchesProvider(courseId));
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Could not close batch.')));
      }
    }
  }
}

class _BatchCard extends StatelessWidget {
  const _BatchCard({required this.batch, required this.onClose});
  final InstructorBatch batch;
  final VoidCallback onClose;
  @override
  Widget build(BuildContext context) {
    final next =
        batch.sessions
            .where(
              (s) =>
                  DateTime.tryParse(s.scheduledAt)?.isAfter(DateTime.now()) ==
                  true,
            )
            .toList()
          ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
    final color = switch (batch.status) {
      'UPCOMING' => const Color(0xFF2563EB),
      'ACTIVE' => const Color(0xFF22A146),
      'CANCELLED' => Colors.red,
      _ => const Color(0xFF64748B),
    };
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE3E8EF)),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  batch.name,
                  style: const TextStyle(
                    fontSize: 17,
                    fontFamily: 'serif',
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0C1F33),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: .1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  batch.status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              Chip(
                avatar: const Icon(Icons.people_outline, size: 16),
                label: Text('${batch.enrolmentCount}/${batch.capacity}'),
              ),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  '/instructor/courses/${batch.courseId}/batches/${batch.id}',
                ),
                icon: const Icon(Icons.visibility_outlined, size: 17),
                label: const Text('Sessions'),
              ),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  '/instructor/courses/${batch.courseId}/batches/${batch.id}/edit',
                ),
                icon: const Icon(Icons.edit_outlined, size: 17),
                label: const Text('Edit'),
              ),
              if (batch.status == 'UPCOMING')
                OutlinedButton.icon(
                  onPressed: onClose,
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                  icon: const Icon(Icons.cancel_outlined, size: 17),
                  label: const Text('Close'),
                ),
              FilledButton.tonalIcon(
                onPressed: () => _openChat(context, batch),
                icon: const Icon(Icons.chat_outlined, size: 17),
                label: const Text('Chat'),
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            children: [
              const Icon(
                Icons.calendar_month_outlined,
                size: 17,
                color: Color(0xFF64748B),
              ),
              const SizedBox(width: 7),
              Text(
                '${batch.sessions.length} sessions',
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              if (next.isNotEmpty) ...[
                const SizedBox(width: 14),
                const Icon(Icons.schedule, size: 17, color: Color(0xFF64748B)),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    'Next: ${_dateTime(next.first.scheduledAt)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  void _openChat(BuildContext context, InstructorBatch batch) => context.push(
    '/instructor/chat?courseId=${batch.courseId}&courseTitle=${Uri.encodeComponent(batch.courseTitle)}&batchId=${batch.id}&batchName=${Uri.encodeComponent(batch.name)}',
  );
}

class InstructorBatchCreatePage extends ConsumerStatefulWidget {
  const InstructorBatchCreatePage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<InstructorBatchCreatePage> createState() =>
      _InstructorBatchCreatePageState();
}

class _InstructorBatchCreatePageState
    extends ConsumerState<InstructorBatchCreatePage> {
  final _name = TextEditingController(),
      _capacity = TextEditingController(text: '30');
  final _sessions = <_SessionDraft>[_SessionDraft()];
  bool _saving = false;
  @override
  void dispose() {
    _name.dispose();
    _capacity.dispose();
    for (final s in _sessions) {
      s.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final existing = ref.watch(instructorExistingSessionsProvider);
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        TextButton.icon(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.chevron_left),
          label: const Text('Back to batches'),
          style: TextButton.styleFrom(alignment: Alignment.centerLeft),
        ),
        const Text(
          'Create Batch',
          style: TextStyle(
            fontFamily: 'serif',
            fontSize: 28,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _name,
          maxLength: 255,
          decoration: const InputDecoration(
            labelText: 'Batch Name *',
            hintText: 'e.g. January Cohort',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _capacity,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Capacity *',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            const Expanded(
              child: Text(
                'Sessions *',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
              ),
            ),
            TextButton.icon(
              onPressed: () => setState(() => _sessions.add(_SessionDraft())),
              icon: const Icon(Icons.add),
              label: const Text('Add Session'),
            ),
          ],
        ),
        for (var i = 0; i < _sessions.length; i++)
          _SessionDraftCard(
            index: i,
            draft: _sessions[i],
            conflict: _hasConflict(
              _sessions[i],
              existing.asData?.value ?? const [],
            ),
            onRemove: _sessions.length > 1
                ? () => setState(() {
                    _sessions.removeAt(i).dispose();
                  })
                : null,
          ),
        const SizedBox(height: 18),
        FilledButton(
          onPressed: _saving
              ? null
              : () => _create(existing.asData?.value ?? const []),
          child: Text(_saving ? 'Creating…' : 'Create Batch'),
        ),
      ],
    );
  }

  bool _hasConflict(
    _SessionDraft draft,
    List<InstructorExistingSession> existing,
  ) {
    final start = draft.scheduledAt;
    if (start == null) return false;
    final end = start.add(
      Duration(minutes: int.tryParse(draft.duration.text) ?? 60),
    );
    return existing.any((session) {
      final otherStart = DateTime.tryParse(session.scheduledAt)?.toLocal();
      if (otherStart == null) return false;
      final otherEnd = otherStart.add(
        Duration(minutes: session.durationMinutes),
      );
      return start.isBefore(otherEnd) && otherStart.isBefore(end);
    });
  }

  Future<void> _create(List<InstructorExistingSession> existing) async {
    final capacity = int.tryParse(_capacity.text.trim());
    if (_name.text.trim().isEmpty ||
        _name.text.length > 255 ||
        capacity == null ||
        capacity < 1 ||
        capacity > 1000) {
      _notify('Enter a batch name and capacity from 1 to 1000.');
      return;
    }
    for (var i = 0; i < _sessions.length; i++) {
      final s = _sessions[i];
      final duration = int.tryParse(s.duration.text);
      if (s.title.text.trim().isEmpty ||
          s.scheduledAt == null ||
          duration == null ||
          duration < 15 ||
          duration > 480) {
        _notify(
          'Complete session ${i + 1}; duration must be 15 to 480 minutes.',
        );
        return;
      }
      final meetingUri = Uri.tryParse(s.meeting.text);
      if (s.meeting.text.isNotEmpty &&
          (meetingUri?.hasScheme != true || meetingUri?.host.isEmpty == true)) {
        _notify('Enter a valid meeting link for session ${i + 1}.');
        return;
      }
    }
    setState(() => _saving = true);
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .createBatch(
            courseId: widget.courseId,
            name: _name.text.trim(),
            capacity: capacity,
            sessions: _sessions
                .map(
                  (s) => {
                    'title': s.title.text.trim(),
                    'scheduledAt': s.scheduledAt!.toUtc().toIso8601String(),
                    'durationMinutes': int.parse(s.duration.text),
                    'meetingLink': s.meeting.text.trim().isEmpty
                        ? null
                        : s.meeting.text.trim(),
                    'notes': s.notes.text.trim().isEmpty
                        ? null
                        : s.notes.text.trim(),
                  },
                )
                .toList(),
          );
      ref.invalidate(instructorCourseBatchesProvider(widget.courseId));
      if (mounted) context.go('/instructor/courses/${widget.courseId}/batches');
    } catch (error) {
      if (mounted) {
        _notify(
          error.toString().contains('409')
              ? 'This session conflicts with another scheduled session.'
              : 'Could not create batch. Try again.',
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _notify(String text) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
}

class InstructorBatchEditPage extends ConsumerStatefulWidget {
  const InstructorBatchEditPage({
    required this.courseId,
    required this.batchId,
    super.key,
  });
  final String courseId, batchId;
  @override
  ConsumerState<InstructorBatchEditPage> createState() =>
      _InstructorBatchEditPageState();
}

class _InstructorBatchEditPageState
    extends ConsumerState<InstructorBatchEditPage> {
  final _name = TextEditingController(), _capacity = TextEditingController();
  bool _loaded = false, _saving = false;
  @override
  void dispose() {
    _name.dispose();
    _capacity.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final batch = ref.watch(instructorBatchProvider(widget.batchId));
    return batch.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => const Center(child: Text('Could not load batch')),
      data: (value) {
        if (!_loaded) {
          _loaded = true;
          _name.text = value.name;
          _capacity.text = '${value.capacity}';
        }
        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            TextButton.icon(
              onPressed: () =>
                  context.go('/instructor/courses/${widget.courseId}/batches'),
              icon: const Icon(Icons.chevron_left),
              label: const Text('Back to batches'),
              style: TextButton.styleFrom(alignment: Alignment.centerLeft),
            ),
            const Text(
              'Edit Batch',
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 28,
                color: Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _name,
              maxLength: 255,
              decoration: const InputDecoration(
                labelText: 'Batch Name *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _capacity,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Capacity *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 22),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? 'Saving…' : 'Save Changes'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _save() async {
    final cap = int.tryParse(_capacity.text);
    if (_name.text.trim().isEmpty || cap == null || cap < 1 || cap > 1000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Enter a name and capacity from 1 to 1000.'),
        ),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .updateBatch(widget.batchId, name: _name.text.trim(), capacity: cap);
      ref.invalidate(instructorCourseBatchesProvider(widget.courseId));
      ref.invalidate(instructorBatchProvider(widget.batchId));
      if (mounted) context.go('/instructor/courses/${widget.courseId}/batches');
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not update batch.')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

class InstructorBatchDetailPage extends ConsumerStatefulWidget {
  const InstructorBatchDetailPage({
    required this.courseId,
    required this.batchId,
    super.key,
  });
  final String courseId, batchId;
  @override
  ConsumerState<InstructorBatchDetailPage> createState() =>
      _InstructorBatchDetailPageState();
}

class _InstructorBatchDetailPageState
    extends ConsumerState<InstructorBatchDetailPage> {
  @override
  Widget build(BuildContext context) {
    final batchAsync = ref.watch(instructorBatchProvider(widget.batchId));
    return batchAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _BatchRetry(
        onRetry: () => ref.invalidate(instructorBatchProvider(widget.batchId)),
      ),
      data: (batch) {
        final sessions = [...batch.sessions]
          ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            TextButton.icon(
              onPressed: () =>
                  context.go('/instructor/courses/${widget.courseId}/batches'),
              icon: const Icon(Icons.chevron_left),
              label: const Text('Back to batches'),
              style: TextButton.styleFrom(alignment: Alignment.centerLeft),
            ),
            Text(
              batch.name,
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 28,
                color: Color(0xFF0C1F33),
              ),
            ),
            Wrap(
              spacing: 14,
              children: [
                Text('${batch.enrolmentCount}/${batch.capacity} enrolled'),
                Text('${sessions.length} sessions'),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              children: [
                FilledButton.tonalIcon(
                  onPressed: () => context.push(
                    '/instructor/chat?courseId=${widget.courseId}&courseTitle=${Uri.encodeComponent(batch.courseTitle)}&batchId=${batch.id}&batchName=${Uri.encodeComponent(batch.name)}',
                  ),
                  icon: const Icon(Icons.chat),
                  label: const Text('Open Chat'),
                ),
                FilledButton.icon(
                  onPressed: () => _sessionDialog(batch, null),
                  icon: const Icon(Icons.add),
                  label: const Text('Add Session'),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (sessions.isEmpty)
              _emptySessions(context, batch)
            else
              for (var i = 0; i < sessions.length; i++)
                _SessionTile(
                  index: i,
                  session: sessions[i],
                  onEdit: () => _sessionDialog(batch, sessions[i]),
                ),
          ],
        );
      },
    );
  }

  Widget _emptySessions(BuildContext context, InstructorBatch batch) =>
      Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE3E8EF)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.calendar_month_outlined,
              size: 40,
              color: Color(0xFFCBD5E1),
            ),
            const SizedBox(height: 8),
            const Text('No sessions yet.'),
            TextButton.icon(
              onPressed: () => _sessionDialog(batch, null),
              icon: const Icon(Icons.add),
              label: const Text('Add First Session'),
            ),
          ],
        ),
      );
  Future<void> _sessionDialog(
    InstructorBatch batch,
    InstructorBatchSession? session,
  ) async {
    final draft = _SessionDraft.fromSession(session);
    final form = GlobalKey<FormState>();
    var deleting = false;
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(session == null ? 'Add New Session' : 'Edit Session'),
          content: SizedBox(
            width: 480,
            child: SingleChildScrollView(
              child: Form(
                key: form,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: draft.title,
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Session title is required'
                          : null,
                      decoration: const InputDecoration(
                        labelText: 'Session Title *',
                      ),
                    ),
                    _SessionDatePicker(draft: draft),
                    TextField(
                      controller: draft.duration,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Duration (minutes)',
                      ),
                    ),
                    TextField(
                      controller: draft.meeting,
                      decoration: const InputDecoration(
                        labelText: 'Meeting Link',
                      ),
                    ),
                    TextField(
                      controller: draft.notes,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Notes'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            if (session != null)
              TextButton(
                onPressed: deleting
                    ? null
                    : () async {
                        if (!deleting) {
                          setDialogState(() => deleting = true);
                          return;
                        }
                        try {
                          await ref
                              .read(instructorCoursesRepositoryProvider)
                              .deleteSession(session.id);
                          _invalidate();
                          if (dialogContext.mounted) {
                            Navigator.pop(dialogContext);
                          }
                        } catch (_) {
                          setDialogState(() => deleting = false);
                        }
                      },
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                child: Text(deleting ? 'Confirm Delete?' : 'Delete'),
              ),
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                if (!form.currentState!.validate() ||
                    draft.scheduledAt == null) {
                  return;
                }
                final duration = int.tryParse(draft.duration.text);
                if (duration == null || duration < 15 || duration > 480) return;
                final input = {
                  'title': draft.title.text.trim(),
                  'scheduledAt': draft.scheduledAt!.toUtc().toIso8601String(),
                  'durationMinutes': duration,
                  'meetingLink': draft.meeting.text.trim(),
                  'notes': draft.notes.text.trim(),
                };
                try {
                  if (session == null) {
                    await ref
                        .read(instructorCoursesRepositoryProvider)
                        .addSession(batch.id, input);
                  } else {
                    await ref
                        .read(instructorCoursesRepositoryProvider)
                        .updateSession(session.id, input);
                  }
                  _invalidate();
                  if (dialogContext.mounted) Navigator.pop(dialogContext);
                } catch (_) {
                  if (dialogContext.mounted) {
                    ScaffoldMessenger.of(dialogContext).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Could not save session. Check for schedule conflicts.',
                        ),
                      ),
                    );
                  }
                }
              },
              child: Text(session == null ? 'Add Session' : 'Save Changes'),
            ),
          ],
        ),
      ),
    );
    draft.dispose();
  }

  void _invalidate() {
    ref.invalidate(instructorBatchProvider(widget.batchId));
    ref.invalidate(instructorCourseBatchesProvider(widget.courseId));
    ref.invalidate(instructorExistingSessionsProvider);
  }
}

class _SessionTile extends StatelessWidget {
  const _SessionTile({
    required this.index,
    required this.session,
    required this.onEdit,
  });
  final int index;
  final InstructorBatchSession session;
  final VoidCallback onEdit;
  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(session.scheduledAt)?.toLocal();
    final isPast = date?.isBefore(DateTime.now()) ?? false;
    return Card(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Color(0xFFF9F6F0),
                  child: Icon(Icons.schedule, color: Color(0xFFB8912F)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Session ${index + 1}: ${session.title}',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${date == null ? 'Date to be confirmed' : DateFormat('EEE, MMM d, yyyy · h:mm a').format(date)} · ${session.durationMinutes} min',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined),
                ),
              ],
            ),
            if (session.notes?.isNotEmpty == true)
              Padding(
                padding: const EdgeInsets.only(left: 58),
                child: Text(
                  session.notes!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            Wrap(
              spacing: 4,
              children: [
                if (session.meetingLink?.isNotEmpty == true && !isPast)
                  TextButton.icon(
                    onPressed: () => _openLink(context, session.meetingLink!),
                    icon: const Icon(Icons.video_call_outlined),
                    label: const Text('Join'),
                  ),
                TextButton.icon(
                  onPressed: () =>
                      context.push('/instructor/attendance/${session.id}'),
                  icon: const Icon(Icons.people_outline),
                  label: const Text('Attendance'),
                ),
                if (isPast)
                  const Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Completed',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SessionDatePicker extends StatefulWidget {
  const _SessionDatePicker({required this.draft});
  final _SessionDraft draft;
  @override
  State<_SessionDatePicker> createState() => _SessionDatePickerState();
}

class _SessionDatePickerState extends State<_SessionDatePicker> {
  @override
  Widget build(BuildContext context) => ListTile(
    contentPadding: EdgeInsets.zero,
    title: const Text('Date & Time *'),
    subtitle: Text(
      widget.draft.scheduledAt == null
          ? 'Select session date and time'
          : DateFormat(
              'EEE, MMM d, yyyy · h:mm a',
            ).format(widget.draft.scheduledAt!),
    ),
    trailing: const Icon(Icons.edit_calendar),
    onTap: _select,
  );
  Future<void> _select() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: widget.draft.scheduledAt ?? now.add(const Duration(days: 1)),
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 10),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(widget.draft.scheduledAt ?? now),
    );
    if (time != null) {
      setState(
        () => widget.draft.scheduledAt = DateTime(
          date.year,
          date.month,
          date.day,
          time.hour,
          time.minute,
        ),
      );
    }
  }
}

class _SessionDraft {
  _SessionDraft({String titleValue = '', this.scheduledAt}) {
    title.text = titleValue;
  }
  factory _SessionDraft.fromSession(InstructorBatchSession? session) =>
      _SessionDraft(
          titleValue: session?.title ?? '',
          scheduledAt: DateTime.tryParse(session?.scheduledAt ?? '')?.toLocal(),
        )
        ..duration.text = '${session?.durationMinutes ?? 60}'
        ..meeting.text = session?.meetingLink ?? ''
        ..notes.text = session?.notes ?? '';
  final title = TextEditingController();
  final duration = TextEditingController(text: '60');
  final meeting = TextEditingController();
  final notes = TextEditingController();
  DateTime? scheduledAt;
  void dispose() {
    title.dispose();
    duration.dispose();
    meeting.dispose();
    notes.dispose();
  }
}

class _SessionDraftCard extends StatelessWidget {
  const _SessionDraftCard({
    required this.index,
    required this.draft,
    required this.conflict,
    required this.onRemove,
  });
  final int index;
  final _SessionDraft draft;
  final bool conflict;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) => Card(
    color: conflict ? const Color(0xFFFFF9E8) : Colors.white,
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Session ${index + 1}',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              if (onRemove != null)
                IconButton(
                  onPressed: onRemove,
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                ),
            ],
          ),
          if (conflict)
            const ListTile(
              dense: true,
              leading: Icon(Icons.warning_amber, color: Color(0xFFB8912F)),
              title: Text(
                'This session overlaps with another scheduled session.',
                style: TextStyle(fontSize: 12),
              ),
            ),
          TextField(
            controller: draft.title,
            decoration: const InputDecoration(
              labelText: 'Title *',
              border: OutlineInputBorder(),
            ),
          ),
          _SessionDatePicker(draft: draft),
          TextField(
            controller: draft.duration,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Duration (minutes)',
              border: OutlineInputBorder(),
            ),
          ),
          TextField(
            controller: draft.meeting,
            decoration: const InputDecoration(
              labelText: 'Meeting Link (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          TextField(
            controller: draft.notes,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Notes (optional)',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    ),
  );
}

class _CourseActionStrip extends StatelessWidget {
  const _CourseActionStrip({required this.course});
  final InstructorCourse course;
  @override
  Widget build(BuildContext context) {
    final id = course.id;
    final items = <(String, IconData, String)>[
      ('Details', Icons.edit_outlined, '/instructor/courses/$id/edit'),
      if (course.type == 'REGULAR')
        (
          'Materials',
          Icons.video_library_outlined,
          '/instructor/courses/$id/materials',
        ),
      if (course.type == 'ONLINE_CLASS')
        (
          'Batches',
          Icons.calendar_month_outlined,
          '/instructor/courses/$id/batches',
        ),
      ('Questions', Icons.help_outline, '/instructor/courses/$id/questions'),
      ('Exams', Icons.description_outlined, '/instructor/courses/$id/exams'),
      ('Students', Icons.people_outline, '/instructor/courses/$id/students'),
      if (course.type == 'ONLINE_CLASS')
        (
          'Assignments',
          Icons.assignment_outlined,
          '/instructor/courses/$id/assignments',
        ),
      ('View Course', Icons.visibility_outlined, '/courses/$id'),
    ];
    return SizedBox(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(right: 7),
              child: ActionChip(
                avatar: Icon(item.$2, size: 16),
                label: Text(item.$1),
                onPressed: () => context.go(item.$3),
              ),
            ),
        ],
      ),
    );
  }
}

class _EmptyBatchList extends StatelessWidget {
  const _EmptyBatchList();
  @override
  Widget build(BuildContext context) => const Padding(
    padding: EdgeInsets.all(28),
    child: Column(
      children: [
        Icon(Icons.calendar_month_outlined, size: 42, color: Color(0xFFCBD5E1)),
        SizedBox(height: 10),
        Text(
          'No batches yet. Create your first batch.',
          style: TextStyle(color: Color(0xFF64748B)),
        ),
      ],
    ),
  );
}

class _BatchRetry extends StatelessWidget {
  const _BatchRetry({required this.onRetry});
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: TextButton(
      onPressed: onRetry,
      child: const Text('Could not load batches. Tap to retry'),
    ),
  );
}

String _dateTime(String raw) {
  final date = DateTime.tryParse(raw)?.toLocal();
  return date == null
      ? 'To be scheduled'
      : DateFormat('MMM d, h:mm a').format(date);
}

Future<void> _openLink(BuildContext context, String value) async {
  final uri = Uri.tryParse(value);
  if (uri == null ||
      !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open meeting link.')),
      );
    }
  }
}
