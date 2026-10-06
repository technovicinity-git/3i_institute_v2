import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../config/app_config.dart';

/// Public web link for a course, tagged so app shares can be measured in
/// analytics. Null when [AppConfig.webBaseUrl] isn't configured.
Uri? courseShareUri(String courseId) {
  final base = AppConfig.webBaseUrl.trim();
  if (base.isEmpty) return null;
  final origin = Uri.tryParse(base.endsWith('/') ? base : '$base/');
  if (origin == null || !origin.hasScheme) return null;
  return origin
      .resolve('courses/$courseId')
      .replace(
        queryParameters: const {
          'utm_source': 'app_share',
          'utm_medium': 'share',
          'utm_campaign': 'course_share',
        },
      );
}

/// Opens the system share sheet for a course. Falls back to copying the link
/// when sharing isn't available. [anchor] positions the sheet on iPad.
Future<void> shareCourse(
  BuildContext context, {
  required String courseId,
  required String title,
  Rect? anchor,
}) async {
  final uri = courseShareUri(courseId);
  final message = [
    'Check out "$title" at 3i International Islamic Institute',
    ?uri?.toString(),
  ].join('\n');

  try {
    await SharePlus.instance.share(
      ShareParams(text: message, subject: title, sharePositionOrigin: anchor),
    );
  } catch (_) {
    await Clipboard.setData(ClipboardData(text: uri?.toString() ?? message));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            uri == null ? 'Course details copied' : 'Course link copied',
          ),
        ),
      );
    }
  }
}
