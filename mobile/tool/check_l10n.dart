// Checks lib/l10n/app_<language>.arb against English (app_en.arb):
//   * every English key exists in each language, and no extra keys
//   * each translation keeps the same {placeholders}
//   * Arabic/Urdu text is wrapped in a right-to-left isolate
//     (\u2067 ... \u2069) so it reads right-to-left in the app's
//     left-to-right layout
//
//   dart run tool/check_l10n.dart          report problems
//   dart run tool/check_l10n.dart --fix    also add missing RTL isolates
import 'dart:convert';
import 'dart:io';

const _rtl = {'ar', 'ur'};
const _rli = '\u2067';
const _pdi = '\u2069';
final _arabicScript = RegExp(
  '[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]',
);

/// Top-level argument names, ignoring plural branch text like `one {...}`.
Set<String> _arguments(String text) {
  final names = <String>{};
  for (final match in RegExp(r'\{\s*(\w+)').allMatches(text)) {
    final before = text.substring(0, match.start).trimRight();
    final word = RegExp(r'(\S+)$').firstMatch(before)?.group(1);
    if (word != null &&
        RegExp(r'^(zero|one|two|few|many|other|=\d+)$').hasMatch(word)) {
      continue;
    }
    names.add(match.group(1)!);
  }
  return names;
}

Map<String, dynamic> _read(File file) =>
    jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;

void main(List<String> args) {
  final fix = args.contains('--fix');
  final dir = Directory('lib/l10n');
  final english = _read(File('${dir.path}/app_en.arb'));
  final keys = english.keys.where((k) => !k.startsWith('@')).toList();
  var problems = 0;

  for (final file in dir.listSync().whereType<File>()) {
    final name = file.uri.pathSegments.last;
    final match = RegExp(r'^app_(\w+)\.arb$').firstMatch(name);
    if (match == null || match.group(1) == 'en') continue;
    final language = match.group(1)!;
    final messages = _read(file);
    var changed = false;

    for (final key in keys) {
      final value = messages[key];
      if (value is! String) {
        stderr.writeln('[$language] missing: $key');
        problems++;
        continue;
      }
      final expected = _arguments(english[key] as String);
      final actual = _arguments(value);
      if (expected.length != actual.length || !expected.containsAll(actual)) {
        stderr.writeln('[$language] placeholders differ: $key');
        problems++;
      }
      if (_rtl.contains(language) &&
          _arabicScript.hasMatch(value) &&
          !(value.startsWith(_rli) && value.endsWith(_pdi))) {
        if (fix) {
          final bare = value.replaceAll(_rli, '').replaceAll(_pdi, '');
          messages[key] = '$_rli$bare$_pdi';
          changed = true;
        } else {
          stderr.writeln('[$language] missing RTL isolate: $key (use --fix)');
          problems++;
        }
      }
    }
    for (final key in messages.keys) {
      if (!key.startsWith('@') && !english.containsKey(key)) {
        stderr.writeln('[$language] not in English: $key');
        problems++;
      }
    }

    if (changed) {
      final body = const JsonEncoder.withIndent('  ')
          .convert(messages)
          .replaceAll(_rli, r'\u2067')
          .replaceAll(_pdi, r'\u2069');
      file.writeAsStringSync('$body\n');
      stdout.writeln('Fixed RTL isolates in $name');
    }
  }

  if (problems > 0) {
    stderr.writeln('\n$problems translation problem(s).');
    exit(1);
  }
  stdout.writeln('Translations OK (${keys.length} keys).');
}
