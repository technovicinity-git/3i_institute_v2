import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:three_i_mobile/core/format/date_format.dart';

void main() {
  setUpAll(() async {
    for (final locale in ['en', 'bn', 'hi', 'ur', 'ar']) {
      await initializeDateFormatting(locale);
    }
  });

  final afternoon = DateTime(2026, 10, 18, 15, 5);
  final morning = DateTime(2026, 1, 3, 9, 30);

  test('English: day before month, 12-hour clock', () {
    expect(formatDate(afternoon, DateStyle.date, 'en'), '18 Oct 2026');
    expect(formatDate(afternoon, DateStyle.longDate, 'en'), '18 October 2026');
    expect(
      formatDate(afternoon, DateStyle.weekdayDate, 'en'),
      'Sun, 18 Oct 2026',
    );
    expect(
      formatDate(afternoon, DateStyle.fullDate, 'en'),
      'Sunday, 18 October 2026',
    );
    expect(
      formatDate(afternoon, DateStyle.dateTime, 'en'),
      '18 Oct 2026, 3:05 PM',
    );
    expect(
      formatDate(afternoon, DateStyle.dayMonthTime, 'en'),
      '18 Oct, 3:05 PM',
    );
    expect(
      formatDate(afternoon, DateStyle.weekdayDayMonth, 'en'),
      'Sun, 18 Oct',
    );
    expect(formatDate(morning, DateStyle.time, 'en'), '9:30 AM');
    expect(formatDate(afternoon, DateStyle.month, 'en'), 'Oct');
    expect(formatDate(afternoon, DateStyle.day, 'en'), '18');
  });

  test('other languages keep the same order', () {
    for (final locale in ['bn', 'hi', 'ur', 'ar']) {
      final text = formatDate(afternoon, DateStyle.dateTime, locale);
      // ignore: avoid_print
      print(
        '$locale: $text | ${formatDate(morning, DateStyle.weekdayDate, locale)}',
      );
      expect(text, isNotEmpty);
    }
    expect(formatDate(afternoon, DateStyle.weekdayDate, 'ur'), contains('، '));
    expect(formatDate(afternoon, DateStyle.weekdayDate, 'ar'), contains('، '));
    expect(formatDate(afternoon, DateStyle.time, 'ur'), '3:05 PM');
    expect(formatDate(morning, DateStyle.dateTime, 'ur'), endsWith('9:30 AM'));
  });

  test('null uses the fallback', () {
    expect(formatDate(null), '—');
    expect(
      formatDate(null, DateStyle.date, 'en', 'No deadline'),
      'No deadline',
    );
  });
}
