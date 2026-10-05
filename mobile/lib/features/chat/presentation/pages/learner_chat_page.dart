import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../learning/domain/learning_models.dart';
import '../../../learning/presentation/learning_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../chat_providers.dart';
import '../../data/chat_repository.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);

class LearnerChatPage extends ConsumerStatefulWidget {
  const LearnerChatPage({
    required this.courseId,
    required this.courseTitle,
    required this.batchId,
    required this.batchName,
    super.key,
  });
  final String courseId, courseTitle, batchName;
  final String? batchId;
  @override
  ConsumerState<LearnerChatPage> createState() => _LearnerChatPageState();
}

class _LearnerChatPageState extends ConsumerState<LearnerChatPage> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  List<ChatMessage> _messages = const [];
  ChatSocketSession? _session;
  bool _loading = true, _connected = false, _autoScroll = true;
  String? _error, _socketRoomKey;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_handleScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _initializeChat());
  }

  @override
  void dispose() {
    _scroll.removeListener(_handleScroll);
    _session?.close();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _initializeChat() async {
    final profile = ref.read(activeLearnerProfileProvider);
    if (widget.courseId.isEmpty || profile == null) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = profile == null
              ? 'Select a learner profile to join this class chat.'
              : 'Course not specified.';
        });
      }
      return;
    }
    final roomKey = '${widget.courseId}|${widget.batchId ?? ''}|${profile.id}';
    if (_socketRoomKey == roomKey) return;
    _socketRoomKey = roomKey;
    try {
      final repo = ref.read(chatRepositoryProvider);
      final history = await repo.getMessages(widget.courseId, widget.batchId);
      if (mounted) {
        setState(() {
          _messages = history;
          _loading = false;
        });
      }
      _scheduleScroll();
      final token = await ref.read(apiClientProvider).readAccessToken();
      if (token == null || token.isEmpty) {
        throw StateError('Your session has expired. Please sign in again.');
      }
      if (!mounted) return;
      _session = repo.connect(
        token: token,
        courseId: widget.courseId,
        batchId: widget.batchId,
        learnerProfileId: profile.id,
        onConnection: (connected) {
          if (mounted) setState(() => _connected = connected);
        },
        onHistory: (messages) {
          if (mounted) {
            setState(() {
              _messages = messages;
              _loading = false;
            });
          }
          _scheduleScroll();
        },
        onMessage: (message) {
          if (mounted) {
            setState(() {
              if (!_messages.any((m) => m.id == message.id)) {
                _messages = [..._messages, message];
              }
            });
          }
          _scheduleScroll();
        },
        onError: (message) {
          if (mounted) setState(() => _error = message);
        },
      );
    } catch (error) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Unable to connect to class chat. Please try again.';
        });
      }
    }
  }

  void _scheduleScroll() {
    if (!_autoScroll) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients && _autoScroll) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 240),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleScroll() {
    if (!_scroll.hasClients) return;
    final distance = _scroll.position.maxScrollExtent - _scroll.position.pixels;
    final next = distance < 80;
    if (_autoScroll != next) setState(() => _autoScroll = next);
  }

  void _sendMessage() {
    final text = _input.text.trim();
    final profile = ref.read(activeLearnerProfileProvider);
    if (text.isEmpty || !_connected || profile == null) return;
    if (text.length > 2000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Messages can be up to 2,000 characters.'),
        ),
      );
      return;
    }
    _session?.send(message: text, learnerProfileId: profile.id);
    _input.clear();
    _autoScroll = true;
  }

  Future<void> _report(ChatMessage message) async {
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Report message'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Why should this message be reviewed?'),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              minLines: 2,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Explain the issue...',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () =>
                Navigator.pop(context, reasonController.text.trim()),
            child: const Text('Submit report'),
          ),
        ],
      ),
    );
    reasonController.dispose();
    if (reason == null || reason.isEmpty) return;
    try {
      await ref.read(chatRepositoryProvider).reportMessage(message.id, reason);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Message reported for review.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not report the message. Please try again.'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    final account = ref.watch(authControllerProvider).asData?.value;
    final sessionAsync = ref.watch(
      nextLiveSessionProvider(widget.batchId ?? ''),
    );
    final session = sessionAsync.asData?.value;
    final currentName = profile?.displayName ?? account?.fullName ?? 'Learner';
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(18, 17, 14, 17),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFE3E8EF))),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.tag, color: _gold),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.courseTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 19,
                        color: Color(0xFF0C1F33),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${widget.batchName} • Class chat',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _ConnectionBadge(connected: _connected),
            ],
          ),
        ),
        if (session != null) _NextClassBar(session: session),
        if (_error != null && _messages.isNotEmpty)
          MaterialBanner(
            content: Text(_error!),
            leading: const Icon(Icons.info_outline),
            actions: [
              TextButton(
                onPressed: () => setState(() => _error = null),
                child: const Text('Dismiss'),
              ),
            ],
          ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: _green))
              : _error != null && _messages.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.wifi_off,
                          color: Color(0xFF94A3B8),
                          size: 34,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF64748B)),
                        ),
                        TextButton(
                          onPressed: () {
                            _socketRoomKey = null;
                            setState(() {
                              _loading = true;
                              _error = null;
                            });
                            _initializeChat();
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _messages.isEmpty
              ? const _ChatEmptyState()
              : ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.fromLTRB(15, 16, 15, 18),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    final previous = index > 0 ? _messages[index - 1] : null;
                    final date = DateTime.tryParse(
                      message.createdAt,
                    )?.toLocal();
                    final previousDate = previous == null
                        ? null
                        : DateTime.tryParse(previous.createdAt)?.toLocal();
                    final showDate =
                        date != null &&
                        (previousDate == null || !_sameDay(date, previousDate));
                    final isSelf = message.learnerProfileId != null
                        ? message.learnerProfileId == profile?.id
                        : message.senderId == account?.id;
                    final showName =
                        previous == null ||
                        previous.senderId != message.senderId ||
                        showDate;
                    return Column(
                      children: [
                        if (showDate) _DateDivider(date: date),
                        _MessageBubble(
                          message: message,
                          isSelf: isSelf,
                          showName: showName,
                          currentName: currentName,
                          currentAvatarUrl: profile?.avatarUrl,
                          onReport: isSelf ? null : () => _report(message),
                        ),
                      ],
                    );
                  },
                ),
        ),
        SafeArea(
          top: false,
          child: Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE3E8EF))),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: _input,
                    enabled: _connected,
                    minLines: 1,
                    maxLines: 4,
                    textCapitalization: TextCapitalization.sentences,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: InputDecoration(
                      hintText: _connected
                          ? 'Type a message...'
                          : 'Connecting...',
                      filled: true,
                      fillColor: const Color(0xFFFBF9F4),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 9),
                IconButton.filled(
                  onPressed: _connected ? _sendMessage : null,
                  tooltip: 'Send message',
                  style: IconButton.styleFrom(
                    backgroundColor: _green,
                    foregroundColor: _navy,
                  ),
                  icon: const Icon(Icons.arrow_upward),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ConnectionBadge extends StatelessWidget {
  const _ConnectionBadge({required this.connected});
  final bool connected;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: connected ? _green.withValues(alpha: .1) : const Color(0xFFF1F3F5),
      borderRadius: BorderRadius.circular(30),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          connected ? Icons.wifi : Icons.wifi_off,
          size: 14,
          color: connected ? _green : const Color(0xFF64748B),
        ),
        const SizedBox(width: 5),
        Text(
          connected ? 'Live' : 'Offline',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: connected ? _green : const Color(0xFF64748B),
          ),
        ),
      ],
    ),
  );
}

class _NextClassBar extends StatelessWidget {
  const _NextClassBar({required this.session});
  final LiveSession session;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    decoration: const BoxDecoration(
      color: Color(0xFFF9F6F0),
      border: Border(bottom: BorderSide(color: Color(0xFFE3E8EF))),
    ),
    child: Row(
      children: [
        Container(
          width: 37,
          height: 37,
          decoration: BoxDecoration(
            color: _green,
            borderRadius: BorderRadius.circular(9),
          ),
          child: const Icon(
            Icons.video_call_outlined,
            color: Colors.white,
            size: 20,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'NEXT LIVE CLASS',
                style: TextStyle(
                  color: Color(0xFF157A34),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: .5,
                ),
              ),
              Text(
                session.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF0C1F33),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${_time(session.scheduledAt)} • ${session.durationMinutes} min',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
              ),
            ],
          ),
        ),
        if (session.meetingLink?.isNotEmpty == true)
          IconButton(
            onPressed: () async {
              final uri = Uri.tryParse(session.meetingLink!);
              if (uri != null) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.open_in_new, color: _green),
            tooltip: 'Join class',
          ),
      ],
    ),
  );
}

class _ChatEmptyState extends StatelessWidget {
  const _ChatEmptyState();
  @override
  Widget build(BuildContext context) => const Center(
    child: Padding(
      padding: EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 31,
            backgroundColor: Color(0xFFF9F6F0),
            child: Icon(Icons.tag, color: _gold, size: 30),
          ),
          SizedBox(height: 12),
          Text(
            'No messages yet. Say hello to your classmates!',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    ),
  );
}

class _DateDivider extends StatelessWidget {
  const _DateDivider({required this.date});
  final DateTime date;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 16),
    child: Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFFBF9F4),
          border: Border.all(color: const Color(0xFFE3E8EF)),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          DateFormat('EEEE, MMMM d, y').format(date),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Color(0xFF64748B),
          ),
        ),
      ),
    ),
  );
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.isSelf,
    required this.showName,
    required this.currentName,
    required this.currentAvatarUrl,
    required this.onReport,
  });
  final ChatMessage message;
  final bool isSelf, showName;
  final String currentName;
  final String? currentAvatarUrl;
  final VoidCallback? onReport;
  @override
  Widget build(BuildContext context) {
    final time = DateTime.tryParse(message.createdAt)?.toLocal();
    final displayName = isSelf ? currentName : message.displayName;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: isSelf
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        children: [
          if (!isSelf)
            _Avatar(
              name: displayName,
              url: message.avatarUrl,
              instructor: message.isInstructor,
            ),
          if (!isSelf) const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: isSelf
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                if (showName)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isSelf && time != null)
                          Text(
                            DateFormat('h:mm a').format(time),
                            style: const TextStyle(
                              fontSize: 10,
                              color: Color(0xFF475569),
                            ),
                          ),
                        if (isSelf) const SizedBox(width: 5),
                        Text(
                          displayName,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                        if (!isSelf && message.isInstructor) ...[
                          const SizedBox(width: 5),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: _green,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'INSTRUCTOR',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 8,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                        if (!isSelf && time != null) ...[
                          const SizedBox(width: 6),
                          Text(
                            DateFormat('h:mm a').format(time),
                            style: const TextStyle(
                              fontSize: 10,
                              color: Color(0xFF475569),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    if (onReport != null)
                      PopupMenuButton<String>(
                        tooltip: 'Message actions',
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 36),
                        iconSize: 17,
                        icon: const Icon(
                          Icons.more_horiz,
                          color: Color(0xFF64748B),
                        ),
                        onSelected: (_) => onReport!(),
                        itemBuilder: (_) => const [
                          PopupMenuItem(
                            value: 'report',
                            child: Row(
                              children: [
                                Icon(Icons.flag_outlined, size: 18),
                                SizedBox(width: 8),
                                Text('Report message'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 9,
                        ),
                        decoration: BoxDecoration(
                          color: isSelf
                              ? _green
                              : message.isInstructor
                              ? const Color(0xFFF2FBF4)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: isSelf
                              ? null
                              : Border.all(
                                  color: message.isInstructor
                                      ? _green.withValues(alpha: .3)
                                      : const Color(0xFFE3E8EF),
                                ),
                        ),
                        child: Text(
                          message.message,
                          style: const TextStyle(
                            fontSize: 14,
                            height: 1.45,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (isSelf) const SizedBox(width: 8),
          if (isSelf)
            _Avatar(name: displayName, url: currentAvatarUrl, self: true),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.name,
    this.url,
    this.self = false,
    this.instructor = false,
  });
  final String name;
  final String? url;
  final bool self, instructor;
  @override
  Widget build(BuildContext context) {
    final initial = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0])
        .join()
        .toUpperCase();
    return ClipOval(
      child: SizedBox(
        width: 30,
        height: 30,
        child: url != null && url!.isNotEmpty
            ? Image.network(
                url!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _fallback(initial),
              )
            : _fallback(initial),
      ),
    );
  }

  Widget _fallback(String initials) => ColoredBox(
    color: self || instructor ? _green : const Color(0xFFE3E8EF),
    child: Center(
      child: Text(
        initials.isEmpty ? 'L' : initials,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: instructor ? Colors.white : _navy,
        ),
      ),
    ),
  );
}

bool _sameDay(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;
String _time(String value) {
  final date = DateTime.tryParse(value)?.toLocal();
  return date == null
      ? 'Time to be announced'
      : '${DateFormat('EEE, MMM d').format(date)} at ${DateFormat('h:mm a').format(date)}';
}
