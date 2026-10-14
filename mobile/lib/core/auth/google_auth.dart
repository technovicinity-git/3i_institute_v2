import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../config/app_config.dart';

/// Thrown when Google sign-in can't run because the app isn't set up for it
/// (missing OAuth client, wrong SHA-1, missing iOS client ID...).
class GoogleAuthConfigException implements Exception {
  const GoogleAuthConfigException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// Thin wrapper around [GoogleSignIn] (v7), which must be initialised exactly
/// once per app run and is shared by the login and register screens.
abstract final class GoogleAuth {
  static Future<void>? _initialization;

  static Future<void> _ensureInitialized() => _initialization ??= _initialize();

  static Future<void> _initialize() async {
    try {
      // iOS reads its own client ID (GIDClientID) from Info.plist.
      await GoogleSignIn.instance.initialize(
        serverClientId: AppConfig.googleServerClientId,
      );
    } catch (_) {
      _initialization = null; // allow a retry
      rethrow;
    }
  }

  /// Shows Google's account picker and returns an ID token for the backend.
  /// Throws a [GoogleSignInException] with code `canceled` if dismissed.
  static Future<String> signIn() async {
    try {
      await _ensureInitialized();
      final account = await GoogleSignIn.instance.authenticate();
      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw const GoogleAuthConfigException(
          'Google did not return an ID token. Check the Google sign-in setup.',
        );
      }
      return idToken;
    } on GoogleSignInException catch (error) {
      if (isCancelled(error)) rethrow;
      if (error.code == GoogleSignInExceptionCode.clientConfigurationError ||
          error.code == GoogleSignInExceptionCode.providerConfigurationError) {
        throw GoogleAuthConfigException(
          'Google sign-in is not set up for this app yet. ${error.description ?? ''}'
              .trim(),
        );
      }
      rethrow;
    } on PlatformException catch (error) {
      // e.g. iOS without GIDClientID / URL scheme in Info.plist.
      throw GoogleAuthConfigException(
        'Google sign-in is not set up for this app yet. ${error.message ?? ''}'
            .trim(),
      );
    }
  }

  /// Forgets the Google account so the next sign-in shows the account picker.
  static Future<void> signOut() async {
    final initialization = _initialization;
    if (initialization == null) return;
    try {
      await initialization;
      await GoogleSignIn.instance.signOut();
    } catch (_) {
      // Signing out of Google is best-effort; the app session is already gone.
    }
  }

  static bool isCancelled(Object error) =>
      error is GoogleSignInException &&
      (error.code == GoogleSignInExceptionCode.canceled ||
          error.code == GoogleSignInExceptionCode.interrupted);
}
