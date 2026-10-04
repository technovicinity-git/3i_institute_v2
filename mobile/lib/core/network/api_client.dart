import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';

class ApiClient {
  ApiClient(this._storage) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
        sendTimeout: const Duration(seconds: 20),
        headers: const {'Content-Type': 'application/json'},
      ),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: _accessTokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode != 401 ||
              error.requestOptions.extra['skipAuthRefresh'] == true ||
              error.requestOptions.extra['authRetried'] == true ||
              _isPublicAuthPath(error.requestOptions.path)) {
            handler.next(error);
            return;
          }

          try {
            final token = await (_refreshFuture ??= _refresh().whenComplete(() {
              _refreshFuture = null;
            }));
            if (token == null) {
              await clearSession();
              await onSessionExpired?.call();
              handler.next(error);
              return;
            }
            final options = error.requestOptions;
            options.extra['authRetried'] = true;
            options.headers['Authorization'] = 'Bearer $token';
            handler.resolve(await dio.fetch<dynamic>(options));
          } catch (_) {
            await clearSession();
            await onSessionExpired?.call();
            handler.next(error);
          }
        },
      ),
    );
  }

  static const _accessTokenKey = 'auth.accessToken';
  static const _refreshTokenKey = 'auth.refreshToken';

  final FlutterSecureStorage _storage;
  late final Dio dio;
  Future<String?>? _refreshFuture;
  FutureOr<void> Function()? onSessionExpired;

  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  Future<void> captureRefreshToken(Response<dynamic> response) async {
    final cookies = response.headers['set-cookie'] ?? const <String>[];
    for (final cookie in cookies) {
      final match = RegExp(r'(?:^|;\s*)refreshToken=([^;]*)').firstMatch(cookie);
      if (match != null && match.group(1)!.isNotEmpty) {
        await _storage.write(key: _refreshTokenKey, value: match.group(1));
        return;
      }
    }
  }

  Future<String?> restoreAccessToken() async {
    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (refreshToken == null || refreshToken.isEmpty) return null;
    return _refresh();
  }

  Future<void> clearSession() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<String?> _refresh() async {
    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (refreshToken == null || refreshToken.isEmpty) return null;

    // Use a bare client so refresh failures cannot recurse through this interceptor.
    final response = await Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl)).post<Map<String, dynamic>>(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
      options: Options(headers: const {'Content-Type': 'application/json'}),
    );
    final accessToken = _responseData(response.data)['accessToken'] as String?;
    if (accessToken == null || accessToken.isEmpty) return null;
    await saveTokens(accessToken: accessToken);
    await captureRefreshToken(response);
    return accessToken;
  }

  bool _isPublicAuthPath(String path) => const {
        '/auth/login',
        '/auth/register',
        '/auth/refresh',
        '/auth/logout',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/resend-verification',
        '/auth/verify-email',
        '/auth/google',
        '/auth/apple',
      }.any(path.endsWith);
}

Map<String, dynamic> _responseData(Map<String, dynamic>? response) {
  final data = response?['data'];
  return data is Map<String, dynamic> ? data : const {};
}
