import '../../../core/network/api_client.dart';

/// Who a send would reach, shown before sending.
class BroadcastPreview {
  const BroadcastPreview({
    required this.recipientCount,
    required this.pushDeviceCount,
    required this.pushConfigured,
  });
  final int recipientCount, pushDeviceCount;
  final bool pushConfigured;
}

class BroadcastResult {
  const BroadcastResult({
    required this.recipientCount,
    required this.pushDevices,
    required this.pushSent,
  });
  final int recipientCount, pushDevices, pushSent;

  String get summary {
    final people = '$recipientCount recipient${recipientCount == 1 ? '' : 's'}';
    return pushDevices > 0
        ? 'Sent to $people · push delivered to $pushSent of $pushDevices devices'
        : 'Sent to $people';
  }
}

/// A notification an instructor sent earlier.
class SentBroadcast {
  const SentBroadcast({
    required this.id,
    required this.audience,
    required this.courseTitle,
    required this.batchName,
    required this.title,
    required this.body,
    required this.channels,
    required this.recipientCount,
    required this.pushDeviceCount,
    required this.pushSentCount,
    required this.createdAt,
  });
  final String id, audience, title, body;
  final String? courseTitle, batchName;
  final List<String> channels;
  final int recipientCount, pushDeviceCount, pushSentCount;
  final DateTime? createdAt;

  String get audienceText {
    final course = courseTitle ?? 'Deleted course';
    return audience == 'BATCH'
        ? '${batchName ?? 'Batch'} · $course'
        : 'All students · $course';
  }

  factory SentBroadcast.fromJson(Map<String, dynamic> j) => SentBroadcast(
    id: '${j['id'] ?? ''}',
    audience: '${j['audience'] ?? 'COURSE'}',
    courseTitle: j['courseTitle'] as String?,
    batchName: j['batchName'] as String?,
    title: '${j['title'] ?? ''}',
    body: '${j['body'] ?? ''}',
    channels: (j['channels'] is List ? j['channels'] as List : const [])
        .map((c) => '$c')
        .toList(),
    recipientCount: _int(j['recipientCount']),
    pushDeviceCount: _int(j['pushDeviceCount']),
    pushSentCount: _int(j['pushSentCount']),
    createdAt: DateTime.tryParse('${j['createdAt'] ?? ''}')?.toLocal(),
  );
}

class SentBroadcastPage {
  const SentBroadcastPage({required this.items, required this.hasMore});
  final List<SentBroadcast> items;
  final bool hasMore;
}

/// Instructor broadcasts: notify the students of a course or one batch.
class BroadcastRepository {
  const BroadcastRepository(this._api);
  final ApiClient _api;

  static const _base = '/instructors/notifications/broadcasts';

  Map<String, dynamic> _data(Map<String, dynamic>? response) =>
      response?['data'] is Map<String, dynamic>
      ? response!['data'] as Map<String, dynamic>
      : const {};

  Future<BroadcastPreview> preview(String courseId, {String? batchId}) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '$_base/preview',
      queryParameters: {'courseId': courseId, 'batchId': ?batchId},
    );
    final d = _data(response.data);
    return BroadcastPreview(
      recipientCount: _int(d['recipientCount']),
      pushDeviceCount: _int(d['pushDeviceCount']),
      pushConfigured: d['pushConfigured'] != false,
    );
  }

  Future<BroadcastResult> send({
    required String courseId,
    String? batchId,
    required String title,
    required String body,
    required List<String> channels,
  }) async {
    final response = await _api.dio.post<Map<String, dynamic>>(
      _base,
      data: {
        'courseId': courseId,
        'batchId': ?batchId,
        'title': title,
        'body': body,
        'channels': channels,
      },
    );
    final d = _data(response.data);
    return BroadcastResult(
      recipientCount: _int(d['recipientCount']),
      pushDevices: _int(d['pushDevices']),
      pushSent: _int(d['pushSent']),
    );
  }

  Future<SentBroadcastPage> list({int page = 1, int limit = 10}) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      _base,
      queryParameters: {'page': page, 'limit': limit},
    );
    final d = _data(response.data);
    final items = d['broadcasts'] is List ? d['broadcasts'] as List : const [];
    return SentBroadcastPage(
      items: items
          .whereType<Map<String, dynamic>>()
          .map(SentBroadcast.fromJson)
          .toList(),
      hasMore: d['hasMore'] == true,
    );
  }
}

int _int(Object? value) =>
    value is num ? value.toInt() : int.tryParse('$value') ?? 0;
