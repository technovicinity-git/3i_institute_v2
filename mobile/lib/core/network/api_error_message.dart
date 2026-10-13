import 'package:dio/dio.dart';

String apiErrorMessage(Object error, {required String fallback}) {
  if (error is DioException) {
    final body = error.response?.data;
    if (body is Map<String, dynamic>) {
      final errorBody = body['error'];
      if (errorBody is Map<String, dynamic>) {
        final details = errorBody['details'];
        if (details is Map<String, dynamic>) {
          final fieldErrors = details['fieldErrors'];
          if (fieldErrors is Map<String, dynamic>) {
            for (final value in fieldErrors.values) {
              if (value is List && value.isNotEmpty) return value.first.toString();
            }
          }
        }
        final message = errorBody['message'];
        if (message is String && message.isNotEmpty) return message;
      }
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Unable to connect. Check your connection and API URL.';
    }
  }
  if (error is FormatException) return error.message;
  if (error is Exception && error.toString().startsWith('Exception: ')) {
    return error.toString().substring('Exception: '.length);
  }
  return fallback;
}

/// The backend's machine-readable error code (e.g. `EMAIL_NOT_VERIFIED`).
String? apiErrorCode(Object error) {
  if (error is! DioException) return null;
  final body = error.response?.data;
  if (body is! Map<String, dynamic>) return null;
  final errorBody = body['error'];
  if (errorBody is! Map<String, dynamic>) return null;
  final code = errorBody['code'];
  return code is String ? code : null;
}
