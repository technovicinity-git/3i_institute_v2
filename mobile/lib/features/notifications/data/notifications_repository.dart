import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../domain/app_notification.dart';

class NotificationsRepository {
  const NotificationsRepository(this._api);
  final ApiClient _api;

  // A feed is a learner profile's notifications, or without a profile the
  // account-level ones (instructor, account holder).
  Map<String, dynamic> _scope(String? learnerProfileId) =>
      learnerProfileId == null ? {} : {'learnerProfileId': learnerProfileId};

  Future<NotificationsPage> list({
    String? learnerProfileId,
    int page = 1,
    int limit = 20,
    bool unreadOnly = false,
  }) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/notifications',
      queryParameters: {
        ..._scope(learnerProfileId),
        'page': page,
        'limit': limit,
        if (unreadOnly) 'unreadOnly': true,
      },
    );
    final data = _data(response.data);
    final items = data['notifications'];
    return NotificationsPage(
      items: (items is List ? items : const [])
          .whereType<Map<String, dynamic>>()
          .map(AppNotification.fromJson)
          .toList(),
      hasMore: data['hasMore'] == true,
      unreadCount: (data['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }

  Future<UnreadCounts> unreadCounts() async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/notifications/unread-count',
    );
    return UnreadCounts.fromJson(_data(response.data));
  }

  Future<void> markAsRead(String id) =>
      _api.dio.post<void>('/notifications/$id/read');

  Future<void> markAllAsRead(String? learnerProfileId) => _api.dio.post<void>(
    '/notifications/read-all',
    data: _scope(learnerProfileId),
  );

  Future<void> remove(String id) => _api.dio.delete<void>('/notifications/$id');

  /// Realtime updates over Socket.IO. The server puts every authenticated
  /// connection in the user's notification room.
  NotificationSocket connect({
    required String token,
    required void Function(AppNotification) onNotification,
    required void Function(UnreadCounts) onUnread,
  }) {
    final socket = io.io(
      AppConfig.socketBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableReconnection()
          .enableForceNew()
          .disableAutoConnect()
          .build(),
    );
    socket.on('notification:new', (dynamic value) {
      if (value is Map) {
        onNotification(
          AppNotification.fromJson(Map<String, dynamic>.from(value)),
        );
      }
    });
    socket.on('notification:unread', (dynamic value) {
      if (value is Map) {
        onUnread(UnreadCounts.fromJson(Map<String, dynamic>.from(value)));
      }
    });
    socket.connect();
    return NotificationSocket(socket);
  }

  Map<String, dynamic> _data(Map<String, dynamic>? body) {
    final data = body?['data'];
    return data is Map<String, dynamic> ? data : const {};
  }
}

class NotificationSocket {
  const NotificationSocket(this._socket);
  final io.Socket _socket;
  void close() => _socket.dispose();
}
