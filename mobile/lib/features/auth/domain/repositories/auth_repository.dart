import '../entities/account.dart';
import 'dart:typed_data';

abstract interface class AuthRepository {
  Future<Account?> restoreSession();
  Future<Account> login({required String email, required String password});
  Future<Account> loginInstructor({
    required String email,
    required String password,
  });
  Future<Account> loginWithGoogle({
    required String idToken,
    String? dateOfBirth,
  });
  Future<Account> loginWithApple({
    required String identityToken,
    String? dateOfBirth,
    String? firstName,
    String? lastName,
  });
  Future<String> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String dateOfBirth,
    required String locale,
  });
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
  });
  Future<void> logout();
  Future<void> forgotPassword(String email);
  Future<void> resetPassword({required String token, required String password});
  Future<void> verifyEmail(String token);
  Future<void> resendVerification(String email);
}
