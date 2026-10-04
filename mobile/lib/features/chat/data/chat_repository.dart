import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../learning/domain/learning_models.dart';

class ChatRepository {
  const ChatRepository(this._api);
  final ApiClient _api;

  Future<List<ChatMessage>> getMessages(
    String courseId,
    String? batchId,
  ) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/chat/course/$courseId/messages',
      queryParameters: batchId == null || batchId.isEmpty
          ? null
          : {'batchId': batchId},
    );
    final data = response.data?['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(ChatMessage.fromJson)
        .toList(growable: false);
  }

  Future<void> reportMessage(String messageId, String reason) async {
    await _api.dio.post<Map<String, dynamic>>(
      '/chat/report',
      data: {'messageId': messageId, 'reason': reason},
    );
  }

  ChatSocketSession connect({
    required String token,
    required String courseId,
    required String? batchId,
    required String learnerProfileId,
    required void Function(bool) onConnection,
    required void Function(List<ChatMessage>) onHistory,
    required void Function(ChatMessage) onMessage,
    required void Function(String) onError,
  }) {
    final socket = io.io(
      AppConfig.socketBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .enableForceNew()
          .disableAutoConnect()
          .build(),
    );
    socket.on('connect', (_) {
      onConnection(true);
      socket.emit('join-course', {
        'courseId': courseId,
        'batchId': batchId,
        'learnerProfileId': learnerProfileId,
      });
    });
    socket.on('disconnect', (_) => onConnection(false));
    socket.on('connect_error', (dynamic error) {
      onConnection(false);
      onError(_message(error));
    });
    socket.on('message-history', (dynamic value) {
      if (value is List) {
        onHistory(
          value.whereType<Map>().map(_messageModel).toList(growable: false),
        );
      }
    });
    socket.on('new-message', (dynamic value) {
      if (value is Map) onMessage(_messageModel(value));
    });
    socket.on(
      'error',
      (dynamic value) => onError(
        value is Map
            ? value['message']?.toString() ?? 'Chat error'
            : 'Chat error',
      ),
    );
    socket.connect();
    return ChatSocketSession(socket, courseId, batchId);
  }

  static ChatMessage _messageModel(Map value) =>
      ChatMessage.fromJson(Map<String, dynamic>.from(value));
  static String _message(dynamic value) => value is Map
      ? value['message']?.toString() ?? 'Chat connection failed'
      : value.toString();
}

class ChatSocketSession {
  const ChatSocketSession(this._socket, this._courseId, this._batchId);
  final io.Socket _socket;
  final String _courseId;
  final String? _batchId;
  bool get connected => _socket.connected;

  void send({required String message, required String learnerProfileId}) {
    _socket.emit('send-message', {
      'courseId': _courseId,
      'batchId': _batchId,
      'message': message,
      'learnerProfileId': learnerProfileId,
    });
  }

  void close() {
    if (_socket.connected) _socket.emit('leave-course');
    _socket.dispose();
  }
}
