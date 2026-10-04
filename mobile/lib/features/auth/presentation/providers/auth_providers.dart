import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/api_client.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/account.dart';
import '../../domain/repositories/auth_repository.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>(
  (ref) => const FlutterSecureStorage(),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(secureStorageProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepositoryImpl(
    AuthRemoteDataSource(ref.watch(apiClientProvider)),
  ),
);

final authControllerProvider =
    AsyncNotifierProvider<AuthController, Account?>(AuthController.new);

class AuthController extends AsyncNotifier<Account?> {
  AuthRepository get _repository => ref.read(authRepositoryProvider);

  @override
  Future<Account?> build() async {
    ref.read(apiClientProvider).onSessionExpired = () {
      state = const AsyncData(null);
    };
    try {
      return await _repository.restoreSession();
    } catch (_) {
      return null;
    }
  }

  Future<void> login({required String email, required String password}) async {
    final account = await _repository.login(email: email, password: password);
    state = AsyncData(account);
  }

  Future<String> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String dateOfBirth,
    required String locale,
  }) =>
      _repository.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        dateOfBirth: dateOfBirth,
        locale: locale,
      );

  Future<void> loginWithGoogle({required String idToken, String? dateOfBirth}) async {
    state = AsyncData(await _repository.loginWithGoogle(idToken: idToken, dateOfBirth: dateOfBirth));
  }

  Future<void> loginWithApple({required String identityToken, String? dateOfBirth, String? firstName, String? lastName}) async {
    state = AsyncData(await _repository.loginWithApple(
      identityToken: identityToken,
      dateOfBirth: dateOfBirth,
      firstName: firstName,
      lastName: lastName,
    ));
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
    } finally {
      state = const AsyncData(null);
    }
  }

  Future<void> forgotPassword(String email) => _repository.forgotPassword(email);

  Future<void> resetPassword({required String token, required String password}) =>
      _repository.resetPassword(token: token, password: password);

  Future<void> verifyEmail(String token) => _repository.verifyEmail(token);

  Future<void> resendVerification(String email) => _repository.resendVerification(email);
}
