import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

const _ink = Color(0xFF0C1F33);
const _body = Color(0xFF334155);
const _link = Color(0xFF22A146);

/// Renders the same Markdown subset as the web: `#`/`##`/`###` headings,
/// paragraphs, `-` and `1.` lists, `---` rules, **bold**, *italic* and
/// [links](url).
class SimpleMarkdown extends StatelessWidget {
  const SimpleMarkdown(this.source, {super.key});
  final String source;

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[];
    final paragraph = <String>[];
    var orderedIndex = 0;

    void flush() {
      if (paragraph.isEmpty) return;
      children.add(_Inline(paragraph.join(' ')));
      paragraph.clear();
    }

    for (final raw in source.replaceAll('\r\n', '\n').split('\n')) {
      final line = raw.trim();
      final heading = RegExp(r'^(#{1,3})\s+(.*)$').firstMatch(line);
      final bullet = RegExp(r'^[-*]\s+(.*)$').firstMatch(line);
      final numbered = RegExp(r'^\d+[.)]\s+(.*)$').firstMatch(line);

      if (numbered == null) orderedIndex = 0;
      if (line.isEmpty) {
        flush();
      } else if (RegExp(r'^(-{3,}|\*{3,})$').hasMatch(line)) {
        flush();
        children.add(const Divider(height: 24));
      } else if (heading != null) {
        flush();
        final level = heading.group(1)!.length;
        children.add(
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: _Inline(
              heading.group(2)!,
              style: TextStyle(
                fontFamily: level < 3 ? 'serif' : null,
                fontSize: level == 1
                    ? 22
                    : level == 2
                    ? 18
                    : 15,
                fontWeight: level == 3 ? FontWeight.w700 : FontWeight.w500,
                color: _ink,
                height: 1.3,
              ),
            ),
          ),
        );
      } else if (bullet != null || numbered != null) {
        flush();
        final marker = bullet != null ? '•' : '${++orderedIndex}.';
        children.add(
          Padding(
            padding: const EdgeInsets.only(left: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 22,
                  child: Text(
                    marker,
                    style: const TextStyle(color: _body, height: 1.6),
                  ),
                ),
                Expanded(child: _Inline((bullet ?? numbered)!.group(1)!)),
              ],
            ),
          ),
        );
      } else {
        paragraph.add(line);
      }
    }
    flush();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final (i, child) in children.indexed) ...[
          if (i > 0) const SizedBox(height: 10),
          child,
        ],
      ],
    );
  }
}

class _Inline extends StatelessWidget {
  const _Inline(this.text, {this.style});
  final String text;
  final TextStyle? style;

  static final _token = RegExp(
    r'(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))',
  );

  @override
  Widget build(BuildContext context) {
    final spans = <InlineSpan>[];
    var last = 0;
    for (final match in _token.allMatches(text)) {
      if (match.start > last) {
        spans.add(TextSpan(text: text.substring(last, match.start)));
      }
      final token = match.group(0)!;
      final link = RegExp(r'^\[([^\]]+)\]\(([^)\s]+)\)$').firstMatch(token);
      if (token.startsWith('**')) {
        spans.add(
          TextSpan(
            text: token.substring(2, token.length - 2),
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
        );
      } else if (link != null) {
        final uri = Uri.tryParse(link.group(2)!);
        final safe =
            uri != null &&
            ['http', 'https', 'mailto', 'tel'].contains(uri.scheme);
        spans.add(
          TextSpan(
            text: link.group(1),
            style: safe
                ? const TextStyle(
                    color: _link,
                    decoration: TextDecoration.underline,
                  )
                : null,
            recognizer: safe
                ? (TapGestureRecognizer()
                    ..onTap = () =>
                        launchUrl(uri, mode: LaunchMode.externalApplication))
                : null,
          ),
        );
      } else {
        spans.add(
          TextSpan(
            text: token.substring(1, token.length - 1),
            style: const TextStyle(fontStyle: FontStyle.italic),
          ),
        );
      }
      last = match.end;
    }
    if (last < text.length) spans.add(TextSpan(text: text.substring(last)));

    return Text.rich(
      TextSpan(children: spans),
      style: style ?? const TextStyle(fontSize: 15, height: 1.6, color: _body),
    );
  }
}
