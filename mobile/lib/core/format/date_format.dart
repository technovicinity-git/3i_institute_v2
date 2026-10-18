import 'package:intl/intl.dart';

/// The one place dates and times are formatted for display. Mirrors
/// `formatDate` in the web app (frontend/src/lib/date-format.ts).
///
/// South Asian convention in every language: day before month, 12-hour clock
/// with AM/PM — "18 Oct 2026, 3:45 PM". Month and weekday names and digits
/// come from the language (e.g. "১৮ অক্টো, ২০২৬" in Bengali).
///
/// Learner screens use the app language (`Intl.defaultLocale`, set in
/// app.dart). English-only screens (instructor) pass `locale: 'en'`.
/// Dates sent to the API (`yyyy-MM-dd`) don't go through here.
enum DateStyle {
  /// 18 Oct 2026
  date,

  /// 18 October 2026
  longDate,

  /// Sun, 18 Oct 2026
  weekdayDate,

  /// Sunday, 18 October 2026
  fullDate,

  /// 18 Oct 2026, 3:45 PM
  dateTime,

  /// Sun, 18 Oct 2026, 3:45 PM
  weekdayDateTime,

  /// Sunday, 18 October 2026, 3:45 PM
  fullDateTime,

  /// 18 Oct
  dayMonth,

  /// 18 Oct, 3:45 PM
  dayMonthTime,

  /// Sun, 18 Oct
  weekdayDayMonth,

  /// 3:45 PM
  time,

  /// Sunday
  weekday,

  /// Oct
  month,

  /// 18
  day,
}

String _pattern(DateStyle style, String comma) => switch (style) {
  DateStyle.date => 'd MMM y',
  DateStyle.longDate => 'd MMMM y',
  DateStyle.weekdayDate => 'EEE${comma}d MMM y',
  DateStyle.fullDate => 'EEEE${comma}d MMMM y',
  DateStyle.dateTime => 'd MMM y${comma}h:mm a',
  DateStyle.weekdayDateTime => 'EEE${comma}d MMM y${comma}h:mm a',
  DateStyle.fullDateTime => 'EEEE${comma}d MMMM y${comma}h:mm a',
  DateStyle.dayMonth => 'd MMM',
  DateStyle.dayMonthTime => 'd MMM${comma}h:mm a',
  DateStyle.weekdayDayMonth => 'EEE${comma}d MMM',
  DateStyle.time => 'h:mm a',
  DateStyle.weekday => 'EEEE',
  DateStyle.month => 'MMM',
  DateStyle.day => 'd',
};

final _latinPeriod = RegExp(r'\b(am|pm)\b');
final _urduPeriod = RegExp(r'(\d )([ap])$');

/// Formats [value] for display in the viewer's local time, e.g.
/// `formatDate(date, DateStyle.dateTime)`. A null [value] returns [fallback].
String formatDate(
  DateTime? value, [
  DateStyle style = DateStyle.date,
  String? locale,
  String fallback = '—',
]) {
  if (value == null) return fallback;
  final language = (locale ?? Intl.getCurrentLocale())
      .split(RegExp('[_-]'))
      .first;
  // Urdu and Arabic separate with the Arabic comma.
  final comma = language == 'ur' || language == 'ar' ? '، ' : ', ';
  final text = DateFormat(
    _pattern(style, comma),
    locale,
  ).format(value.toLocal());
  // "3:45 PM" — Latin am/pm is upper-cased; other scripts are left as is.
  final upper = text.replaceAllMapped(_latinPeriod, (m) => m[0]!.toUpperCase());
  // intl's Urdu data abbreviates to "a"/"p"; use AM/PM like the web app.
  return language == 'ur'
      ? upper.replaceAllMapped(
          _urduPeriod,
          (m) => '${m[1]}${m[2] == 'a' ? 'AM' : 'PM'}',
        )
      : upper;
}
