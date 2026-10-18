enum ExamAccessStatus { open, upcoming, closed }

/// Whether a learner can currently START an exam.
///
/// ONLINE_CLASS exams are scheduled with a start time (`openDate`): the
/// learner may start any time after it, until 50% of the exam duration has
/// elapsed. REGULAR exams have no start time and are always open. Once an
/// attempt has started this no longer applies — the learner gets the full
/// duration.
class ExamAccess {
  const ExamAccess(this.status, this.start, this.windowEnd);
  final ExamAccessStatus status;

  /// Scheduled start time (null for REGULAR exams).
  final DateTime? start;

  /// Start time + 50% of the duration — no new attempts after this.
  final DateTime? windowEnd;

  factory ExamAccess.of(
    String? openDate,
    int durationMinutes, {
    DateTime? now,
  }) {
    final start = openDate == null
        ? null
        : DateTime.tryParse(openDate)?.toLocal();
    if (start == null) {
      return const ExamAccess(ExamAccessStatus.open, null, null);
    }
    final current = now ?? DateTime.now();
    final windowEnd = start.add(Duration(seconds: durationMinutes * 30));
    if (current.isBefore(start)) {
      return ExamAccess(ExamAccessStatus.upcoming, start, windowEnd);
    }
    if (current.isAfter(windowEnd)) {
      return ExamAccess(ExamAccessStatus.closed, start, windowEnd);
    }
    return ExamAccess(ExamAccessStatus.open, start, windowEnd);
  }
}

/// Seconds from [now] until [target], never negative.
int secondsUntil(DateTime? target, DateTime now) {
  if (target == null) return 0;
  final ms = target.difference(now).inMilliseconds;
  return ms <= 0 ? 0 : (ms / 1000).ceil();
}

/// 93784 → "1d 02h 03m", 3754 → "01:02:34", 754 → "12:34".
String formatCountdown(
  int totalSeconds, {
  /// Multi-day wording, e.g. `context.l10n.examsCountdownDays`.
  String Function(int days, String hours, String minutes)? days,
}) {
  final s = totalSeconds < 0 ? 0 : totalSeconds;
  final dayCount = s ~/ 86400;
  final hours = (s % 86400) ~/ 3600;
  final mins = (s % 3600) ~/ 60;
  final secs = s % 60;
  String pad(int n) => n.toString().padLeft(2, '0');
  if (dayCount > 0) {
    return days?.call(dayCount, pad(hours), pad(mins)) ??
        '${dayCount}d ${pad(hours)}h ${pad(mins)}m';
  }
  if (hours > 0) return '${pad(hours)}:${pad(mins)}:${pad(secs)}';
  return '${pad(mins)}:${pad(secs)}';
}
