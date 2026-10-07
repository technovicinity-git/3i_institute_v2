import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/push/push_notifications.dart';
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
  (ref) =>
      AuthRepositoryImpl(AuthRemoteDataSource(ref.watch(apiClientProvider))),
);

final authControllerProvider = AsyncNotifierProvider<AuthController, Account?>(
  AuthController.new,
);

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

  Future<void> loginInstructor({
    required String email,
    required String password,
  }) async {
    final account = await _repository.loginInstructor(
      email: email,
      password: password,
    );
    state = AsyncData(account);
    // The login response has no profile photo; load it in the background.
    unawaited(refreshAccount());
  }

  Future<String> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String dateOfBirth,
    required String locale,
  }) => _repository.register(
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth,
    locale: locale,
  );

  Future<String> registerInstructor({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String dateOfBirth,
    required String locale,
    required String bio,
    required String areaOfExpertise,
    required Uint8List cvBytes,
    required String cvFileName,
    required String wwccNumber,
    required String wwccState,
    required String wwccExpiry,
  }) => _repository.registerInstructor(
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth,
    locale: locale,
    bio: bio,
    areaOfExpertise: areaOfExpertise,
    cvBytes: cvBytes,
    cvFileName: cvFileName,
    wwccNumber: wwccNumber,
    wwccState: wwccState,
    wwccExpiry: wwccExpiry,
  );

  Future<void> loginWithGoogle({
    required String idToken,
    String? dateOfBirth,
  }) async {
    state = AsyncData(
      await _repository.loginWithGoogle(
        idToken: idToken,
        dateOfBirth: dateOfBirth,
      ),
    );
  }

  Future<void> loginWithApple({
    required String identityToken,
    String? dateOfBirth,
    String? firstName,
    String? lastName,
  }) async {
    state = AsyncData(
      await _repository.loginWithApple(
        identityToken: identityToken,
        dateOfBirth: dateOfBirth,
        firstName: firstName,
        lastName: lastName,
      ),
    );
  }

  /// Reloads the signed-in account (e.g. after a profile edit) without
  /// putting the app back into a loading state.
  Future<void> refreshAccount() async {
    try {
      final account = await _repository.restoreSession();
      if (account != null) state = AsyncData(account);
    } catch (_) {}
  }

  Future<void> logout() async {
    // Stop pushes to this device while the session can still authorise it.
    await ref.read(pushRegistrationProvider.notifier).unregister();
    try {
      await _repository.logout();
    } finally {
      state = const AsyncData(null);
    }
  }

  Future<void> forgotPassword(String email) =>
      _repository.forgotPassword(email);

  Future<void> resetPassword({
    required String token,
    required String password,
  }) => _repository.resetPassword(token: token, password: password);

  Future<void> verifyEmail(String token) => _repository.verifyEmail(token);

  Future<void> resendVerification(String email) =>
      _repository.resendVerification(email);
}
