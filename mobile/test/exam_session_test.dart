import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:three_i_mobile/features/exams/data/exam_session_store.dart';
import 'package:three_i_mobile/features/exams/domain/exam_access.dart';
import 'package:three_i_mobile/features/exams/domain/exam_models.dart';

void main() {
  const question = ExamQuestion(
    id: 'q1',
    type: 'multi_select',
    question: 'Pick two',
    options: ['A', 'B', 'C'],
    marks: 2,
  );

  group('ExamSession', () {
    test('round-trips through JSON with answers, flags and position', () {
      final session = ExamSession(
        examId: 'e1',
        profileId: 'p1',
        title: 'Final',
        closeDate: null,
        startedAt: DateTime(2026, 1, 1, 10),
        durationMinutes: 30,
        questions: const [question],
        answers: {
          'q1': ['A', 'B'],
        },
        flagged: {'q1'},
      );
      final restored = ExamSession.tryParse(jsonEncode(session.toJson()))!;
      expect(restored.startedAt, session.startedAt);
      expect(restored.answers['q1'], ['A', 'B']);
      expect(restored.flagged, {'q1'});
      expect(restored.questions.single.options, ['A', 'B', 'C']);
      expect(restored.answeredCount, 1);
    });

    test('deadline is the duration end, or just before an earlier close', () {
      final start = DateTime(2026, 1, 1, 10);
      ExamSession build(DateTime? close) => ExamSession(
        examId: 'e1',
        profileId: 'p1',
        title: 'Final',
        closeDate: close,
        startedAt: start,
        durationMinutes: 60,
        questions: const [question],
      );
      expect(build(null).deadline, DateTime(2026, 1, 1, 11));
      expect(
        build(DateTime(2026, 1, 1, 10, 30)).deadline,
        DateTime(2026, 1, 1, 10, 29, 50),
      );
    });

    test('rejects corrupt or empty data', () {
      expect(ExamSession.tryParse('not json'), isNull);
      expect(ExamSession.tryParse(jsonEncode({'version': 1})), isNull);
    });
  });

  group('ExamAccess', () {
    final start = DateTime(2026, 1, 1, 10);
    final openDate = start.toUtc().toIso8601String();

    test('upcoming → open → closed at 50% of the duration', () {
      expect(
        ExamAccess.of(openDate, 60, now: DateTime(2026, 1, 1, 9)).status,
        ExamAccessStatus.upcoming,
      );
      final open = ExamAccess.of(
        openDate,
        60,
        now: DateTime(2026, 1, 1, 10, 20),
      );
      expect(open.status, ExamAccessStatus.open);
      expect(open.windowEnd, DateTime(2026, 1, 1, 10, 30));
      expect(
        ExamAccess.of(openDate, 60, now: DateTime(2026, 1, 1, 10, 31)).status,
        ExamAccessStatus.closed,
      );
    });

    test('REGULAR exams without a start time are always open', () {
      expect(ExamAccess.of(null, 60).status, ExamAccessStatus.open);
    });
  });

  test('formatCountdown', () {
    expect(formatCountdown(754), '12:34');
    expect(formatCountdown(3754), '01:02:34');
    expect(formatCountdown(93784), '1d 02h 03m');
    expect(formatCountdown(-5), '00:00');
  });
}
