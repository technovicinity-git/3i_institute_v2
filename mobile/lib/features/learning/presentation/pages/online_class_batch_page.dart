import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../certificates/presentation/certificates_providers.dart';
import '../../../certificates/presentation/pages/certificates_page.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/learning_models.dart';
import '../learning_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _navy = Color(0xFF12304E);
const _ink = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _faint = Color(0xFF94A3B8);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _gold = Color(0xFFB8912F);
const _cream = Color(0xFFF9F6F0);

enum _SessionStatus { live, startingSoon, upcoming, completed }

extension on _SessionStatus {
  String label(AppLocalizations l10n) => switch (this) {
    _SessionStatus.live => l10n.scheduleStatusLive,
    _SessionStatus.startingSoon => l10n.scheduleStatusSoon,
    _SessionStatus.upcoming => l10n.scheduleStatusUpcoming,
    _SessionStatus.completed => l10n.scheduleStatusCompleted,
  };

  String sectionLabel(AppLocalizations l10n) => switch (this) {
    _SessionStatus.live => l10n.scheduleStatusLive,
    _SessionStatus.startingSoon => l10n.scheduleStatusSoon,
    _SessionStatus.upcoming => l10n.scheduleSectionUpcoming,
    _SessionStatus.completed => l10n.scheduleSectionCompleted,
  };

  Color get foreground => switch (this) {
    _SessionStatus.live => _green,
    _SessionStatus.startingSoon => const Color(0xFFA16207),
    _SessionStatus.upcoming => const Color(0xFF2563EB),
    _SessionStatus.completed => _muted,
  };

  Color get background => switch (this) {
    _SessionStatus.live => _green.withValues(alpha: 0.1),
    _SessionStatus.startingSoon => const Color(0xFFFEFCE8),
    _SessionStatus.upcoming => const Color(0xFF2563EB).withValues(alpha: 0.1),
    _SessionStatus.completed => const Color(0xFFF1F5F9),
  };

  Color get dot => switch (this) {
    _SessionStatus.live => _green,
    _SessionStatus.startingSoon => const Color(0xFFEAB308),
    _SessionStatus.upcoming => const Color(0xFF2563EB),
    _SessionStatus.completed => _faint,
  };
}

/// Determine the current status of a session relative to [now].
_SessionStatus _statusOf(BatchSession session, DateTime now) {
  final start = DateTime.tryParse(session.scheduledAt)?.toLocal();
  if (start == null) return _SessionStatus.upcoming;
  final end = start.add(Duration(minutes: session.durationMinutes));
  final minutesUntilStart = start.difference(now).inSeconds / 60;

  if (!now.isBefore(start) && !now.isAfter(end)) return _SessionStatus.live;
  if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
    return _SessionStatus.startingSoon;
  }
  if (minutesUntilStart > 30) return _SessionStatus.upcoming;
  return _SessionStatus.completed;
}

class OnlineClassBatchPage extends ConsumerStatefulWidget {
  const OnlineClassBatchPage({super.key, required this.batchId});
  final String batchId;
  @override
  ConsumerState<OnlineClassBatchPage> createState() =>
      _OnlineClassBatchPageState();
}

class _OnlineClassBatchPageState extends ConsumerState<OnlineClassBatchPage> {
  // Keep the current time in state so session statuses update without a
  // manual refresh.
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
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Center(
        child: Text(context.l10n.scheduleSelectProfile),
      );
    }
    final key = '${profile.id}|${widget.batchId}';
    final batchAsync = ref.watch(learnerBatchProvider(key));
    final certificates =
        ref.watch(learnerCertificatesProvider(profile.id)).asData?.value;

    return batchAsync.when(
      loading: () => ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        children: [
          _Header(title: context.l10n.scheduleTitle),
          Padding(
            padding: EdgeInsets.only(top: 60),
            child: Center(child: CircularProgressIndicator(color: _navy)),
          ),
        ],
      ),
      error: (error, _) => ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        children: [
          _Header(title: context.l10n.scheduleTitle),
          _StateCard(
            icon: Icons.error_outline,
            iconColor: Colors.red,
            title: context.l10n.scheduleUnavailable,
            message:
                context.l10n.scheduleUnavailableBody,
            action: TextButton(
              onPressed: () => ref.invalidate(learnerBatchProvider(key)),
              child: Text(context.l10n.commonTryAgain),
            ),
          ),
        ],
      ),
      data: (batch) {
        final statuses = {
          for (final s in batch.sessions) s.id: _statusOf(s, _now),
        };
        final completionCertificate = certificates
            ?.where(
              (c) => c.courseId == batch.courseId && c.type == 'COMPLETION',
            )
            .firstOrNull;

        // A batch is upcoming only while every scheduled session is still in
        // the future. Once any session has started or finished, it's ongoing.
        final isUpcomingBatch = batch.sessions.isNotEmpty
            ? batch.sessions.every(
                (s) =>
                    DateTime.tryParse(s.scheduledAt)?.toLocal().isAfter(_now) ??
                    true,
              )
            : batch.status != 'ACTIVE';

        final count = batch.sessions.length;
        return RefreshIndicator(
          color: _navy,
          onRefresh: () => ref.refresh(learnerBatchProvider(key).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
            children: [
              _Header(
                title: context.l10n.scheduleTitle,
                subtitle: context.l10n.scheduleScheduled(count),
              ),
              _BatchSummary(
                batch: batch,
                isUpcomingBatch: isUpcomingBatch,
                onChat: () => context.push(
                  Uri(
                    path: '/chat',
                    queryParameters: {
                      'courseId': batch.courseId,
                      'courseTitle': batch.courseTitle,
                      'batchId': widget.batchId,
                      'batchName': batch.name,
                    },
                  ).toString(),
                ),
                onCertificate: completionCertificate == null
                    ? null
                    : () => printCertificatePdf(context, completionCertificate),
              ),
              const SizedBox(height: 24),
              if (batch.sessions.isEmpty)
                _StateCard(
                  icon: Icons.calendar_month_outlined,
                  title: context.l10n.scheduleNone,
                  message:
                      context.l10n.scheduleNoneHint,
                )
              else
                for (final status in _SessionStatus.values)
                  if (batch.sessions.any((s) => statuses[s.id] == status))
                    _Section(
                      status: status,
                      children: [
                        for (final (index, session) in batch.sessions.indexed)
                          if (statuses[session.id] == status)
                            _SessionCard(
                              session: session,
                              number: index + 1,
                              status: status,
                            ),
                      ],
                    ),
            ],
          ),
        );
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title, this.subtitle});
  final String title;
  final String? subtitle;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 18),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextButton.icon(
          onPressed: () => context.go('/online-classes'),
          icon: const Icon(Icons.chevron_left, size: 18),
          label: Text(context.l10n.scheduleBack),
          style: TextButton.styleFrom(
            alignment: Alignment.centerLeft,
            foregroundColor: _muted,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: _ink,
            fontWeight: FontWeight.w600,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 4),
          Text(subtitle!, style: const TextStyle(color: _muted)),
        ],
      ],
    ),
  );
}

class _BatchSummary extends StatelessWidget {
  const _BatchSummary({
    required this.batch,
    required this.isUpcomingBatch,
    required this.onChat,
    this.onCertificate,
  });
  final LearnerBatch batch;
  final bool isUpcomingBatch;
  final VoidCallback onChat;
  final VoidCallback? onCertificate;

  @override
  Widget build(BuildContext context) {
    final enrolled = DateTime.tryParse(batch.enrolledAt)?.toLocal();
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _border),
      ),
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
                  child: _Thumbnail(url: batch.thumbnailUrl),
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
                        const _Tag(
                          text: 'LIVE',
                          foreground: Colors.white,
                          background: Color(0xFF7C3AED),
                        ),
                        isUpcomingBatch
                            ? const _Tag(
                                text: 'UPCOMING',
                                foreground: Color(0xFF9A7624),
                                background: _cream,
                              )
                            : _Tag(
                                text: 'ONGOING',
                                foreground: _green,
                                background: _green.withValues(alpha: 0.1),
                              ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      batch.courseTitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 17,
                        color: _ink,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: [
              _Meta(icon: Icons.calendar_view_month_outlined, text: batch.name),
              _Meta(icon: Icons.school_outlined, text: batch.instructorName),
              if (enrolled != null)
                _Meta(
                  icon: Icons.calendar_today_outlined,
                  text: context.l10n.scheduleEnrolledOn(DateFormat.yMMMd().format(enrolled)),
                ),
            ],
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
                    onPressed: onChat,
                    icon: const Icon(Icons.chat_bubble_outline, size: 18),
                    label: Text(context.l10n.classesChat),
                    style: FilledButton.styleFrom(backgroundColor: _navy),
                  ),
                ),
                if (onCertificate != null) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: onCertificate,
                      icon: const Icon(Icons.download_outlined, size: 18),
                      label: Text(context.l10n.classesCertificate),
                      style: FilledButton.styleFrom(backgroundColor: _green),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.status, required this.children});
  final _SessionStatus status;
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: status.dot,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              status.sectionLabel(context.l10n),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: _ink,
              ),
            ),
            const SizedBox(width: 10),
            const Expanded(child: Divider(color: _border, height: 1)),
            const SizedBox(width: 10),
            Text(
              context.l10n.batchSessions(children.length),
              style: const TextStyle(fontSize: 12, color: _muted),
            ),
          ],
        ),
        const SizedBox(height: 14),
        ...children,
      ],
    ),
  );
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.session,
    required this.number,
    required this.status,
  });
  final BatchSession session;
  final int number;
  final _SessionStatus status;

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(session.scheduledAt)?.toLocal();
    final isLive = status == _SessionStatus.live;
    final isJoinable = isLive || status == _SessionStatus.startingSoon;
    final isCompleted = status == _SessionStatus.completed;
    final hasLink = session.meetingLink?.isNotEmpty == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLive ? _green.withValues(alpha: 0.4) : _border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Date box
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: isCompleted ? const Color(0xFFF8FAFC) : _cream,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      date == null
                          ? '--'
                          : DateFormat('MMM').format(date).toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.4,
                        color: isCompleted ? _faint : _gold,
                      ),
                    ),
                    Text(
                      date == null ? '--' : '${date.day}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isCompleted ? _muted : _ink,
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
                      runSpacing: 5,
                      children: [
                        _Tag(
                          text: context.l10n.scheduleSessionNumber(number).toUpperCase(),
                          foreground: _ink,
                          background: Colors.white,
                          outlined: true,
                        ),
                        _Tag(
                          text: status.label(context.l10n).toUpperCase(),
                          foreground: status.foreground,
                          background: status.background,
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      session.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isCompleted ? _muted : _ink,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 12,
                      runSpacing: 4,
                      children: [
                        _Meta(
                          icon: Icons.calendar_today_outlined,
                          text: date == null
                              ? context.l10n.classesDateTba
                              : DateFormat.yMMMEd().format(date),
                        ),
                        if (date != null)
                          _Meta(
                            icon: Icons.schedule,
                            text:
                                '${DateFormat.jm().format(date)} • ${context.l10n.commonMinutes(session.durationMinutes)}',
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Action
          if (isJoinable && hasLink)
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => _openMeeting(context, session.meetingLink!),
                icon: const Icon(Icons.open_in_new, size: 17),
                label: Text(isLive ? context.l10n.scheduleJoin : context.l10n.scheduleJoinSoon),
                style: FilledButton.styleFrom(
                  backgroundColor: isLive ? _green : _navy,
                ),
              ),
            )
          else
            Align(
              alignment: Alignment.centerRight,
              child: isJoinable
                  ? Text(
                      context.l10n.scheduleNoLink,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFCA8A04),
                      ),
                    )
                  : isCompleted
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle_outline, size: 15, color: _faint),
                        SizedBox(width: 4),
                        Text(
                          context.l10n.scheduleCompleted,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _faint,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      context.l10n.scheduleNotStarted,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _faint,
                      ),
                    ),
            ),
          // Notes
          if (session.notes?.isNotEmpty == true) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.l10n.batchSessionNotes.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                      color: _faint,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    session.notes!,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.6,
                      color: _muted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _openMeeting(BuildContext context, String link) async {
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
}

class _Thumbnail extends StatelessWidget {
  const _Thumbnail({this.url});
  final String? url;
  static const _fallback = ColoredBox(
    color: _navy,
    child: Icon(Icons.menu_book, color: Colors.white70, size: 32),
  );
  @override
  Widget build(BuildContext context) => url == null || url!.isEmpty
      ? _fallback
      : Image.network(
          url!,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback,
        );
}

class _Tag extends StatelessWidget {
  const _Tag({
    required this.text,
    required this.foreground,
    required this.background,
    this.outlined = false,
  });
  final String text;
  final Color foreground, background;
  final bool outlined;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: background,
      borderRadius: BorderRadius.circular(5),
      border: outlined ? Border.all(color: _border) : null,
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w700,
        color: foreground,
      ),
    ),
  );
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 13, color: _muted),
      const SizedBox(width: 4),
      Flexible(
        child: Text(
          text,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 12, color: _muted),
        ),
      ),
    ],
  );
}

class _StateCard extends StatelessWidget {
  const _StateCard({
    required this.icon,
    required this.title,
    required this.message,
    this.iconColor = const Color(0xFFCBD5E1),
    this.action,
  });
  final IconData icon;
  final Color iconColor;
  final String title, message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: iconColor),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w600, color: _ink),
        ),
        const SizedBox(height: 5),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: _muted),
        ),
        ?action,
      ],
    ),
  );
}
