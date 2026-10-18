import '../../../core/format/date_format.dart';

/// Submissions waiting longer than this are flagged as overdue so learners
/// aren't left waiting on results and certificates.
const gradingOverdueDays = 3;

DateTime? _parse(String raw) => DateTime.tryParse(raw)?.toLocal();

bool isGradingOverdue(String submittedAt) {
  final date = _parse(submittedAt);
  return date != null &&
      DateTime.now().difference(date).inDays >= gradingOverdueDays;
}

String gradingWaitingLabel(String submittedAt) {
  final date = _parse(submittedAt);
  if (date == null) return 'Submitted';
  final diff = DateTime.now().difference(date);
  if (diff.inHours < 1) return 'Submitted just now';
  if (diff.inHours < 24) {
    return 'Submitted ${diff.inHours} hr${diff.inHours == 1 ? '' : 's'} ago';
  }
  if (diff.inDays < 30) {
    return 'Waiting ${diff.inDays} day${diff.inDays == 1 ? '' : 's'}';
  }
  return 'Submitted ${formatDate(date, DateStyle.dayMonth, 'en')}';
}
