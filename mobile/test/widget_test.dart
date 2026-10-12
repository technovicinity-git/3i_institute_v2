import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:three_i_mobile/features/content/presentation/widgets/simple_markdown.dart';
import 'package:three_i_mobile/features/instructor_dashboard/domain/grading.dart';

Widget _wrap(Widget child) => MaterialApp(
  home: Scaffold(body: SingleChildScrollView(child: child)),
);

/// All text in the tree, including the spans inside rich text.
String _allText(WidgetTester tester) => tester
    .widgetList<RichText>(find.byType(RichText))
    .map((w) => w.text.toPlainText())
    .join('\n');

void main() {
  group('SimpleMarkdown', () {
    testWidgets('renders headings, paragraphs and lists', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const SimpleMarkdown(
            '# Privacy Policy\n'
            '\n'
            'We keep your data safe.\n'
            '\n'
            '- First point\n'
            '- Second point\n'
            '\n'
            '1. Step one\n'
            '2. Step two',
          ),
        ),
      );

      final text = _allText(tester);
      expect(text, contains('Privacy Policy'));
      expect(text, contains('We keep your data safe.'));
      expect(text, contains('First point'));
      expect(text, contains('Second point'));
      // Numbered lists are renumbered from 1.
      expect(find.text('1.'), findsOneWidget);
      expect(find.text('2.'), findsOneWidget);
      // Bullets for the unordered list.
      expect(find.text('•'), findsNWidgets(2));
      // The Markdown markers themselves are not shown.
      expect(text, isNot(contains('# ')));
    });

    testWidgets('strips inline markers for bold, italic and links', (
      tester,
    ) async {
      await tester.pumpWidget(
        _wrap(
          const SimpleMarkdown(
            'Read **carefully**, *please*, then [contact us](https://example.com).',
          ),
        ),
      );

      final text = _allText(tester);
      expect(text, contains('Read carefully, please, then contact us.'));
      expect(text, isNot(contains('**')));
      expect(text, isNot(contains('](')));
    });

    testWidgets('shows a horizontal rule for ---', (tester) async {
      await tester.pumpWidget(
        _wrap(const SimpleMarkdown('Above\n\n---\n\nBelow')),
      );

      expect(find.byType(Divider), findsOneWidget);
    });
  });

  group('grading helpers', () {
    String ago(Duration d) =>
        DateTime.now().subtract(d).toUtc().toIso8601String();

    test('flags submissions waiting $gradingOverdueDays+ days as overdue', () {
      expect(isGradingOverdue(ago(const Duration(hours: 5))), isFalse);
      expect(
        isGradingOverdue(ago(const Duration(days: gradingOverdueDays))),
        isTrue,
      );
      expect(isGradingOverdue('not a date'), isFalse);
    });

    test('describes how long a submission has been waiting', () {
      expect(
        gradingWaitingLabel(ago(const Duration(minutes: 10))),
        'Submitted just now',
      );
      expect(
        gradingWaitingLabel(ago(const Duration(hours: 3))),
        'Submitted 3 hrs ago',
      );
      expect(
        gradingWaitingLabel(ago(const Duration(days: 4, hours: 1))),
        'Waiting 4 days',
      );
    });
  });
}
