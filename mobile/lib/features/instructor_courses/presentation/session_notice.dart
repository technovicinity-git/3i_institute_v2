import 'package:flutter/material.dart';

/// What enrolled learners will receive when an instructor adds, edits or
/// deletes a session. Mirrors the backend rules in
/// backend/src/modules/notification/events.ts (sessionScheduled,
/// sessionUpdated, sessionCancelled) and the web app's session-notice.ts, so
/// the confirmation never promises something that won't be sent.
class SessionNotice {
  const SessionNotice({
    required this.title,
    required this.message,
    required this.notify,
    required this.email,
    required this.confirmLabel,
    this.destructive = false,
  });

  final String title;
  final String message;

  /// False for a plain confirmation that notifies nobody.
  final bool notify;

  /// True when learners also get an email, not only the in-app notification.
  final bool email;
  final String confirmLabel;
  final bool destructive;

  /// Deleting a session nobody will hear about still needs a confirmation.
  static const plainDelete = SessionNotice(
    title: 'Delete this session?',
    message: "This can't be undone.",
    notify: false,
    email: false,
    confirmLabel: 'Delete',
    destructive: true,
  );
}

class SessionFields {
  const SessionFields({
    required this.title,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.meetingLink,
    required this.notes,
  });

  final String title;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String meetingLink;
  final String notes;

  bool get startsInFuture => scheduledAt.isAfter(DateTime.now());
  bool get endsInPast => scheduledAt
      .add(Duration(minutes: durationMinutes))
      .isBefore(DateTime.now());
}

String _learners(int count) =>
    '$count enrolled ${count == 1 ? 'learner' : 'learners'}';

/// Returns null when nobody will be notified (no learners, a past session,
/// or nothing changed). Pass only [after] for an add, only [before] for a
/// delete, and both for an edit.
SessionNotice? describeSessionNotice({
  SessionFields? before,
  SessionFields? after,
  required int learnerCount,
}) {
  if (learnerCount <= 0) return null;
  final who = _learners(learnerCount);

  if (before == null && after != null) {
    if (!after.startsInFuture) return null;
    return SessionNotice(
      title: 'Notify learners about this class?',
      message:
          '$who will get a notification and an email about this new class.',
      notify: true,
      email: true,
      confirmLabel: 'Add & notify',
    );
  }

  if (before != null && after == null) {
    if (!before.startsInFuture) return null;
    return SessionNotice(
      title: 'Cancel this class?',
      message:
          '$who will get a notification and an email that this class has '
          "been cancelled. This can't be undone.",
      notify: true,
      email: true,
      confirmLabel: 'Delete & notify',
      destructive: true,
    );
  }

  if (before == null || after == null || after.endsInPast) return null;

  final timeChanged =
      !before.scheduledAt.isAtSameMomentAs(after.scheduledAt) ||
      before.durationMinutes != after.durationMinutes;
  if (timeChanged) {
    return SessionNotice(
      title: 'Notify learners about the new time?',
      message:
          '$who will get a notification and an email with the new class time.',
      notify: true,
      email: true,
      confirmLabel: 'Save & notify',
    );
  }

  final linkChanged =
      before.meetingLink != after.meetingLink && after.meetingLink.isNotEmpty;
  if (linkChanged) {
    final verb = before.meetingLink.isEmpty ? 'added' : 'updated';
    return SessionNotice(
      title: 'Notify learners about the join link?',
      message:
          '$who will get a notification that the join link was $verb. '
          'No email is sent for link changes.',
      notify: true,
      email: false,
      confirmLabel: 'Save & notify',
    );
  }

  if (before.title != after.title || before.notes != after.notes) {
    return SessionNotice(
      title: 'Notify learners about this update?',
      message:
          '$who will get an in-app notification that the class details '
          'were updated. No email is sent for these changes.',
      notify: true,
      email: false,
      confirmLabel: 'Save & notify',
    );
  }

  return null;
}

/// Shows the confirmation; resolves to true when the instructor confirms.
Future<bool> confirmSessionNotice(
  BuildContext context,
  SessionNotice notice,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(notice.title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(notice.message),
          if (notice.notify) ...[
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                const _ChannelChip(
                  icon: Icons.notifications_none,
                  label: 'In-app notification',
                ),
                if (notice.email)
                  const _ChannelChip(icon: Icons.mail_outline, label: 'Email'),
              ],
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Go back'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          style: notice.destructive
              ? FilledButton.styleFrom(backgroundColor: Colors.red)
              : null,
          child: Text(notice.confirmLabel),
        ),
      ],
    ),
  );
  return confirmed == true;
}

class _ChannelChip extends StatelessWidget {
  const _ChannelChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: const Color(0xFFF1F5F9),
      borderRadius: BorderRadius.circular(999),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF0C1F33)),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0C1F33),
          ),
        ),
      ],
    ),
  );
}
