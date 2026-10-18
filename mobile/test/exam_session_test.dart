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
        sessionId: 's1',
        examId: 'e1',
        profileId: 'p1',
        title: 'Final',
        startedAt: DateTime(2026, 1, 1, 10),
        deadline: DateTime(2026, 1, 1, 10, 30),
        durationMinutes: 30,
        questions: const [question],
        answers: {
          'q1': ['A', 'B'],
        },
        flagged: {'q1'},
      );
      final restored = ExamSession.tryParse(jsonEncode(session.toJson()))!;
      expect(restored.sessionId, 's1');
      expect(restored.startedAt, session.startedAt);
      expect(restored.deadline, session.deadline);
      expect(restored.answers['q1'], ['A', 'B']);
      expect(restored.flagged, {'q1'});
      expect(restored.questions.single.options, ['A', 'B', 'C']);
      expect(restored.answeredCount, 1);
    });

    test('fromStart uses the server deadline, corrected for clock error', () {
      // Device clock runs 5 minutes behind the server.
      final serverNow = DateTime.now().add(const Duration(minutes: 5));
      final start = ExamStartData(
        sessionId: 's1',
        startedAt: serverNow,
        deadline: serverNow.add(const Duration(minutes: 30)),
        serverNow: serverNow,
        exam: ExamTakeInfo.fromJson(const {'id': 'e1', 'duration': 30}),
        questions: const [question],
      );
      final session = ExamSession.fromStart(start, 'p1');
      final left = session.deadline.difference(DateTime.now());
      expect(session.sessionId, 's1');
      expect(left.inSeconds, closeTo(30 * 60, 2));
    });

    test('rejects corrupt or empty data', () {
      expect(ExamSession.tryParse('not json'), isNull);
      expect(ExamSession.tryParse(jsonEncode({'version': 2})), isNull);
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
