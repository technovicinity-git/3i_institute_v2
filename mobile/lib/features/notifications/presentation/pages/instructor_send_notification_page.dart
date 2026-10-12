import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../instructor_courses/domain/entities/instructor_course.dart';
import '../../../instructor_courses/presentation/providers/instructor_courses_providers.dart';
import '../../data/broadcast_repository.dart';
import '../notifications_providers.dart';

const _navy = Color(0xFF0D2B45);
const _ink = Color(0xFF0C1F33);
const _text = Color(0xFF334155);
const _muted = Color(0xFF64748B);
const _faint = Color(0xFF94A3B8);
const _border = Color(0xFFE3E8EF);
const _gold = Color(0xFFB8912F);
const _titleMax = 100;
const _bodyMax = 1000;

/// Notify the students of one course, or one batch of an online class.
class InstructorSendNotificationPage extends ConsumerStatefulWidget {
  const InstructorSendNotificationPage({super.key});
  @override
  ConsumerState<InstructorSendNotificationPage> createState() =>
      _InstructorSendNotificationPageState();
}

class _InstructorSendNotificationPageState
    extends ConsumerState<InstructorSendNotificationPage> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  String _courseId = '';
  bool _byBatch = false;
  String _batchId = '';
  final Set<String> _channels = {'IN_APP'};
  bool _sending = false;

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final coursesAsync = ref.watch(instructorCoursesProvider);
    final courses = coursesAsync.asData?.value ?? const <InstructorCourse>[];
    final course = courses.where((c) => c.id == _courseId).firstOrNull;
    // Online classes (and mixed courses) are taught in batches.
    final hasBatches = course != null && course.type != 'REGULAR';
    final batchesAsync = hasBatches
        ? ref.watch(instructorCourseBatchesProvider(_courseId))
        : null;
    final batches = (batchesAsync?.asData?.value ?? const [])
        .where((b) => b.status != 'CANCELLED')
        .toList();
    final byBatch = hasBatches && _byBatch;
    final batch = batches.where((b) => b.id == _batchId).firstOrNull;
    final ready = course != null && (!byBatch || batch != null);

    final previewAsync = ready
        ? ref.watch(
            broadcastPreviewProvider(
              byBatch ? '$_courseId|$_batchId' : _courseId,
            ),
          )
        : null;
    final preview = previewAsync?.asData?.value;
    final pushAvailable = preview?.pushConfigured ?? true;
    final activeChannels = _channels
        .where((c) => c != 'PUSH' || pushAvailable)
        .toList();
    final recipients = preview?.recipientCount ?? 0;
    final canSend =
        ready &&
        !_sending &&
        preview != null &&
        recipients > 0 &&
        activeChannels.isNotEmpty &&
        _title.text.trim().isNotEmpty &&
        _body.text.trim().isNotEmpty;

    final audienceLabel = course == null
        ? 'your students'
        : byBatch && batch != null
        ? 'students in ${batch.name} (${course.title})'
        : 'all students of ${course.title}';

    return RefreshIndicator(
      onRefresh: () async {
        ref
          ..invalidate(instructorCoursesProvider)
          ..invalidate(sentBroadcastsProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Send Notification',
            style: TextStyle(fontFamily: 'serif', fontSize: 27, color: _ink),
          ),
          const Text(
            'Notify the students of one of your courses.',
            style: TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          _Card(
            children: [
              const _Step(number: 1, title: 'Who should receive it?'),
              const _Label('Course'),
              DropdownButtonFormField<String>(
                initialValue: course == null ? null : _courseId,
                isExpanded: true,
                hint: Text(
                  coursesAsync.isLoading
                      ? 'Loading courses…'
                      : 'Select a course',
                ),
                decoration: _inputDecoration(),
                items: [
                  for (final c in courses)
                    DropdownMenuItem(
                      value: c.id,
                      child: Text(
                        '${c.title}${c.type == 'REGULAR' ? '' : ' · Online class'}',
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
                onChanged: _sending
                    ? null
                    : (id) => setState(() {
                        _courseId = id ?? '';
                        _byBatch = false;
                        _batchId = '';
                      }),
              ),
              if (coursesAsync.hasValue && courses.isEmpty)
                const _Hint("You don't have any courses yet."),
              if (hasBatches) ...[
                const SizedBox(height: 14),
                _OptionTile(
                  icon: Icons.people_outline,
                  label: 'All students',
                  description: 'Everyone enrolled in this course.',
                  selected: !_byBatch,
                  onTap: () => setState(() => _byBatch = false),
                ),
                const SizedBox(height: 10),
                _OptionTile(
                  icon: Icons.layers_outlined,
                  label: 'Specific batch',
                  description: 'Only students in one batch.',
                  selected: _byBatch,
                  onTap: () => setState(() => _byBatch = true),
                ),
                if (_byBatch) ...[
                  const SizedBox(height: 14),
                  const _Label('Batch'),
                  DropdownButtonFormField<String>(
                    initialValue: batch == null ? null : _batchId,
                    isExpanded: true,
                    hint: Text(
                      batchesAsync?.isLoading == true
                          ? 'Loading batches…'
                          : 'Select a batch',
                    ),
                    decoration: _inputDecoration(),
                    items: [
                      for (final b in batches)
                        DropdownMenuItem(
                          value: b.id,
                          child: Text(
                            '${b.name} · ${b.status.toLowerCase()}',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                    ],
                    onChanged: _sending
                        ? null
                        : (id) => setState(() => _batchId = id ?? ''),
                  ),
                  if (batchesAsync?.hasValue == true && batches.isEmpty)
                    const _Hint('This course has no batches yet.'),
                ],
              ],
              const SizedBox(height: 22),
              const _Step(number: 2, title: 'How should it be delivered?'),
              _OptionTile(
                icon: Icons.notifications_none,
                label: 'In-app',
                description:
                    'Appears in the notification bell on web and mobile.',
                selected: _channels.contains('IN_APP'),
                checkbox: true,
                onTap: () => setState(() => _toggleChannel('IN_APP')),
              ),
              const SizedBox(height: 10),
              _OptionTile(
                icon: Icons.phone_iphone,
                label: 'Push',
                description: pushAvailable
                    ? 'Pops up on phones that allowed notifications.'
                    : 'Not configured on the server yet.',
                selected: pushAvailable && _channels.contains('PUSH'),
                enabled: pushAvailable,
                checkbox: true,
                onTap: () => setState(() => _toggleChannel('PUSH')),
              ),
              if (activeChannels.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text(
                    'Choose at least one channel.',
                    style: TextStyle(fontSize: 12, color: Colors.red),
                  ),
                ),
              const SizedBox(height: 22),
              const _Step(number: 3, title: 'Message'),
              _CountedLabel('Title', _title.text.length, _titleMax),
              TextField(
                controller: _title,
                enabled: !_sending,
                maxLength: _titleMax,
                onChanged: (_) => setState(() {}),
                decoration: _inputDecoration(
                  hint: 'e.g. Class rescheduled to Friday',
                ).copyWith(counterText: ''),
              ),
              const SizedBox(height: 12),
              _CountedLabel('Message', _body.text.length, _bodyMax),
              TextField(
                controller: _body,
                enabled: !_sending,
                maxLength: _bodyMax,
                minLines: 4,
                maxLines: 8,
                onChanged: (_) => setState(() {}),
                decoration: _inputDecoration(
                  hint: 'Write your message…',
                ).copyWith(counterText: ''),
              ),
              const SizedBox(height: 16),
              _MessagePreview(title: _title.text, body: _body.text),
              const Divider(height: 32, color: _border),
              _RecipientSummary(
                ready: ready,
                loading: previewAsync?.isLoading ?? false,
                error: previewAsync?.hasError ?? false,
                preview: preview,
                pushSelected: activeChannels.contains('PUSH'),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 48,
                child: FilledButton.icon(
                  onPressed: canSend
                      ? () => _confirmAndSend(
                          courseId: _courseId,
                          batchId: byBatch ? _batchId : null,
                          recipients: recipients,
                          channels: activeChannels,
                          audienceLabel: audienceLabel,
                        )
                      : null,
                  style: FilledButton.styleFrom(backgroundColor: _navy),
                  icon: _sending
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send, size: 18),
                  label: Text(_sending ? 'Sending…' : 'Send notification'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),
          const _SentHistory(),
        ],
      ),
    );
  }

  void _toggleChannel(String channel) {
    if (!_channels.remove(channel)) _channels.add(channel);
  }

  Future<void> _confirmAndSend({
    required String courseId,
    required String? batchId,
    required int recipients,
    required List<String> channels,
    required String audienceLabel,
  }) async {
    final channelText = channels
        .map((c) => c == 'IN_APP' ? 'in-app' : 'push')
        .join(' and ');
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.campaign_outlined, color: _navy),
        title: Text(
          'Send to $recipients recipient${recipients == 1 ? '' : 's'}?',
        ),
        content: Text(
          "This $channelText notification goes to $audienceLabel. It can't "
          'be recalled once sent.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: _navy),
            child: const Text('Send now'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _sending = true);
    try {
      final result = await ref
          .read(broadcastRepositoryProvider)
          .send(
            courseId: courseId,
            batchId: batchId,
            title: _title.text.trim(),
            body: _body.text.trim(),
            channels: channels,
          );
      _title.clear();
      _body.clear();
      ref.invalidate(sentBroadcastsProvider);
      _notify(result.summary);
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to send notification'));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _notify(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }
}

InputDecoration _inputDecoration({String? hint}) => InputDecoration(
  hintText: hint,
  isDense: true,
  filled: true,
  fillColor: Colors.white,
  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
  border: OutlineInputBorder(
    borderRadius: BorderRadius.circular(8),
    borderSide: const BorderSide(color: _border),
  ),
  enabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(8),
    borderSide: const BorderSide(color: _border),
  ),
);

class _Card extends StatelessWidget {
  const _Card({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
    ),
  );
}

class _Step extends StatelessWidget {
  const _Step({required this.number, required this.title});
  final int number;
  final String title;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(
      children: [
        CircleAvatar(
          radius: 10,
          backgroundColor: _navy,
          child: Text(
            '$number',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: _text,
          ),
        ),
      ],
    ),
  );
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: _text,
      ),
    ),
  );
}

class _CountedLabel extends StatelessWidget {
  const _CountedLabel(this.text, this.count, this.max);
  final String text;
  final int count, max;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: _text,
            ),
          ),
        ),
        Text(
          '$count/$max',
          style: const TextStyle(fontSize: 12, color: _faint),
        ),
      ],
    ),
  );
}

class _Hint extends StatelessWidget {
  const _Hint(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 6),
    child: Text(text, style: const TextStyle(fontSize: 12, color: _faint)),
  );
}

/// Selectable card for the audience and channel choices.
class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.icon,
    required this.label,
    required this.description,
    required this.selected,
    required this.onTap,
    this.enabled = true,
    this.checkbox = false,
  });
  final IconData icon;
  final String label, description;
  final bool selected, enabled, checkbox;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Opacity(
    opacity: enabled ? 1 : .5,
    child: Material(
      color: selected ? _navy.withValues(alpha: .03) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: selected ? _navy : _border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: enabled ? onTap : null,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: selected ? _navy : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 18,
                  color: selected ? Colors.white : _muted,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: _ink,
                      ),
                    ),
                    Text(
                      description,
                      style: const TextStyle(fontSize: 12, color: _muted),
                    ),
                  ],
                ),
              ),
              Icon(
                checkbox
                    ? (selected
                          ? Icons.check_box
                          : Icons.check_box_outline_blank)
                    : (selected
                          ? Icons.radio_button_checked
                          : Icons.radio_button_off),
                color: selected ? _navy : _faint,
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class _MessagePreview extends StatelessWidget {
  const _MessagePreview({required this.title, required this.body});
  final String title, body;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFFFBF9F4),
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'PREVIEW',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: _muted,
            letterSpacing: .5,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
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
                  Container(
                    width: 20,
                    height: 20,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: _navy,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: const Text(
                      '3i',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    '3i Institute · now',
                    style: TextStyle(fontSize: 11, color: _faint),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title.trim().isEmpty ? 'Notification title' : title.trim(),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                body.trim().isEmpty
                    ? 'Your message will appear here.'
                    : body.trim(),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: _muted),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Push notifications on phones may cut long messages short. The '
          'full text is always shown in the app.',
          style: TextStyle(fontSize: 11, height: 1.4, color: _faint),
        ),
      ],
    ),
  );
}

class _RecipientSummary extends StatelessWidget {
  const _RecipientSummary({
    required this.ready,
    required this.loading,
    required this.error,
    required this.preview,
    required this.pushSelected,
  });
  final bool ready, loading, error, pushSelected;
  final BroadcastPreview? preview;

  @override
  Widget build(BuildContext context) {
    if (!ready) {
      return const Text(
        'Choose who to notify first.',
        style: TextStyle(fontSize: 13, color: _faint),
      );
    }
    if (error) {
      return const Text(
        "Couldn't count recipients. Pull down to retry.",
        style: TextStyle(fontSize: 13, color: Colors.red),
      );
    }
    final p = preview;
    if (loading || p == null) {
      return const Row(
        children: [
          SizedBox.square(
            dimension: 14,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: 8),
          Text(
            'Counting recipients…',
            style: TextStyle(fontSize: 13, color: _muted),
          ),
        ],
      );
    }
    if (p.recipientCount == 0) {
      return const Text(
        'No one to notify in this audience yet.',
        style: TextStyle(fontSize: 13, color: Color(0xFFEA580C)),
      );
    }
    const bold = TextStyle(fontWeight: FontWeight.w600, color: _ink);
    return Text.rich(
      TextSpan(
        style: const TextStyle(fontSize: 13, color: _muted),
        children: [
          const TextSpan(text: 'Reaches '),
          TextSpan(text: '${p.recipientCount}', style: bold),
          TextSpan(text: p.recipientCount == 1 ? ' person' : ' people'),
          if (pushSelected) ...[
            const TextSpan(text: ' · '),
            TextSpan(text: '${p.pushDeviceCount}', style: bold),
            TextSpan(
              text:
                  ' device${p.pushDeviceCount == 1 ? '' : 's'} with push enabled',
            ),
          ],
        ],
      ),
    );
  }
}

/// "Sent notifications" history with load-more paging.
class _SentHistory extends ConsumerStatefulWidget {
  const _SentHistory();
  @override
  ConsumerState<_SentHistory> createState() => _SentHistoryState();
}

class _SentHistoryState extends ConsumerState<_SentHistory> {
  int _pages = 1;

  @override
  Widget build(BuildContext context) {
    final pages = [
      for (var p = 1; p <= _pages; p++) ref.watch(sentBroadcastsProvider(p)),
    ];
    final items = [for (final page in pages) ...?page.asData?.value.items];
    final first = pages.first;
    final last = pages.last;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Row(
          children: [
            Icon(Icons.history, color: _gold, size: 20),
            SizedBox(width: 8),
            Text(
              'Sent notifications',
              style: TextStyle(fontFamily: 'serif', fontSize: 20, color: _ink),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (first.isLoading && items.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (first.hasError)
          TextButton(
            onPressed: () => ref.invalidate(sentBroadcastsProvider),
            child: const Text("Couldn't load history. Tap to retry."),
          )
        else if (items.isEmpty)
          const Text(
            "You haven't sent any notifications yet.",
            style: TextStyle(color: _muted),
          )
        else ...[
          for (final b in items) ...[
            _SentBroadcastCard(broadcast: b),
            const SizedBox(height: 10),
          ],
          if (last.asData?.value.hasMore == true)
            OutlinedButton(
              onPressed: () => setState(() => _pages++),
              child: const Text('Load more'),
            )
          else if (last.isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ],
    );
  }
}

class _SentBroadcastCard extends StatelessWidget {
  const _SentBroadcastCard({required this.broadcast});
  final SentBroadcast broadcast;

  @override
  Widget build(BuildContext context) {
    final b = broadcast;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            b.title,
            style: const TextStyle(fontWeight: FontWeight.w600, color: _ink),
          ),
          const SizedBox(height: 3),
          Text(
            b.body,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 13, height: 1.4, color: _muted),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _Chip(Icons.people_outline, b.audienceText),
              for (final c in b.channels)
                _Chip(
                  c == 'PUSH' ? Icons.phone_iphone : Icons.notifications_none,
                  c == 'PUSH' ? 'Push' : 'In-app',
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            [
              '${b.recipientCount} recipient${b.recipientCount == 1 ? '' : 's'}',
              if (b.channels.contains('PUSH'))
                'push ${b.pushSentCount}/${b.pushDeviceCount}',
              if (b.createdAt != null)
                DateFormat('MMM d, y · h:mm a').format(b.createdAt!),
            ].join(' · '),
            style: const TextStyle(fontSize: 11, color: _faint),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.icon, this.label);
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: const Color(0xFFF1F5F9),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: _muted),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, color: _text),
          ),
        ),
      ],
    ),
  );
}
