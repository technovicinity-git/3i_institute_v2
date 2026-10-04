import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../models/account_model.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;
  Dio get _dio => _apiClient.dio;

  Future<AccountModel?> restoreSession() async {
    String? accessToken;
    try {
      accessToken = await _apiClient.restoreAccessToken();
    } on DioException catch (error) {
      if (error.response?.statusCode == 401) await _apiClient.clearSession();
      rethrow;
    }
    if (accessToken == null) return null;
    try {
      final response = await _dio.get<Map<String, dynamic>>('/users/me');
      final data = _data(response.data);
      return AccountModel.fromJson(data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 401) await _apiClient.clearSession();
      rethrow;
    }
  }

  Future<AccountModel> login({required String email, required String password}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email.trim().toLowerCase(), 'password': password},
    );
    await _apiClient.captureRefreshToken(response);
    final data = _data(response.data);
    final accessToken = data['accessToken'] as String?;
    if (accessToken == null || accessToken.isEmpty) {
      throw const FormatException('The server did not return an access token.');
    }
    await _apiClient.saveTokens(accessToken: accessToken);
    return AccountModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<AccountModel> loginWithGoogle({required String idToken, String? dateOfBirth}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/google',
      data: {'idToken': idToken, if (dateOfBirth != null) 'dateOfBirth': dateOfBirth},
    );
    return _saveSocialSession(response);
  }

  Future<AccountModel> loginWithApple({required String identityToken, String? dateOfBirth, String? firstName, String? lastName}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/apple',
      data: {
        'identityToken': identityToken,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
      },
    );
    return _saveSocialSession(response);
  }

  Future<AccountModel> _saveSocialSession(Response<Map<String, dynamic>> response) async {
    await _apiClient.captureRefreshToken(response);
    final data = _data(response.data);
    final accessToken = data['accessToken'] as String?;
    if (accessToken == null || accessToken.isEmpty) {
      throw const FormatException('The server did not return an access token.');
    }
    await _apiClient.saveTokens(accessToken: accessToken);
    return AccountModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<String> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String dateOfBirth,
    required String locale,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'dateOfBirth': dateOfBirth,
        'locale': locale,
      },
    );
    return (_data(response.data)['user'] as Map<String, dynamic>)['email'] as String;
  }

  Future<void> logout() async {
    try {
      await _dio.post<void>('/auth/logout');
    } finally {
      await _apiClient.clearSession();
    }
  }

  Future<void> forgotPassword(String email) async {
    await _dio.post<void>('/auth/forgot-password', data: {'email': email.trim().toLowerCase()});
  }

  Future<void> resetPassword({required String token, required String password}) async {
    await _dio.post<void>('/auth/reset-password', data: {'token': token, 'password': password});
  }

  Future<void> verifyEmail(String token) async {
    await _dio.post<void>('/auth/verify-email', data: {'token': token});
  }

  Future<void> resendVerification(String email) async {
    await _dio.post<void>('/auth/resend-verification', data: {'email': email.trim().toLowerCase()});
  }

  Map<String, dynamic> _data(Map<String, dynamic>? response) {
    final data = response?['data'];
    if (data is Map<String, dynamic>) return data;
    throw const FormatException('The server returned an unexpected response.');
  }
}
