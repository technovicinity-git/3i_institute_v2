import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:intl/intl.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import 'auth_scaffold.dart';

class SocialAuthButtons extends ConsumerStatefulWidget {
  const SocialAuthButtons({super.key});

  @override
  ConsumerState<SocialAuthButtons> createState() => _SocialAuthButtonsState();
}

class _SocialAuthButtonsState extends ConsumerState<SocialAuthButtons> {
  bool _googleLoading = false;
  bool _appleLoading = false;
  bool _googleInitialized = false;
  String? _error;

  Future<void> _googleSignIn() async {
    setState(() {
      _googleLoading = true;
      _error = null;
    });
    try {
      final google = GoogleSignIn.instance;
      if (!_googleInitialized) {
        await google.initialize(
          serverClientId: AppConfig.googleServerClientId.isEmpty
              ? null
              : AppConfig.googleServerClientId,
        );
        _googleInitialized = true;
      }
      final account = await google.authenticate();
      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw Exception('Google did not return an ID token. Check the mobile OAuth configuration.');
      }
      await _completeSocialLogin(
        (dateOfBirth) => ref.read(authControllerProvider.notifier).loginWithGoogle(
              idToken: idToken,
              dateOfBirth: dateOfBirth,
            ),
      );
    } catch (error) {
      if (mounted && !_isCancelled(error)) {
        setState(() => _error = apiErrorMessage(error, fallback: 'Google sign-in failed.'));
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  Future<void> _appleSignIn() async {
    setState(() {
      _appleLoading = true;
      _error = null;
    });
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
      );
      final identityToken = credential.identityToken;
      if (identityToken == null || identityToken.isEmpty) {
        throw Exception('Apple did not return an identity token.');
      }
      await _completeSocialLogin(
        (dateOfBirth) => ref.read(authControllerProvider.notifier).loginWithApple(
              identityToken: identityToken,
              dateOfBirth: dateOfBirth,
              firstName: credential.givenName,
              lastName: credential.familyName,
            ),
      );
    } catch (error) {
      if (mounted && !_isCancelled(error)) {
        setState(() => _error = apiErrorMessage(error, fallback: 'Apple sign-in failed.'));
      }
    } finally {
      if (mounted) setState(() => _appleLoading = false);
    }
  }

  Future<void> _completeSocialLogin(Future<void> Function(String? dateOfBirth) login) async {
    try {
      await login(null);
    } catch (error) {
      final message = apiErrorMessage(error, fallback: 'Sign-in failed.');
      final needsDateOfBirth = message.toLowerCase().contains('date of birth') ||
          (error is DioException && error.response?.statusCode == 422);
      if (!needsDateOfBirth) rethrow;
      final dateOfBirth = await _askForDateOfBirth();
      if (dateOfBirth == null) return;
      await login(dateOfBirth);
    }
    if (mounted && ref.read(authControllerProvider).asData?.value != null) {
      context.go('/profiles');
    }
  }

  Future<String?> _askForDateOfBirth() async {
    final now = DateTime.now();
    final selected = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18, now.month, now.day),
      firstDate: DateTime(1900),
      lastDate: DateTime(now.year - 13, now.month, now.day),
      helpText: 'Enter your date of birth',
    );
    return selected == null ? null : DateFormat('yyyy-MM-dd').format(selected);
  }

  bool _isCancelled(Object error) => error.toString().toLowerCase().contains('canceled');

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AuthInlineError(_error),
          OutlinedButton.icon(
            onPressed: _googleLoading || _appleLoading ? null : _googleSignIn,
            icon: _googleLoading
                ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.g_mobiledata, size: 26),
            label: const Text('Continue with Google'),
            style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
          ),
          if (Platform.isIOS) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _googleLoading || _appleLoading ? null : _appleSignIn,
              icon: _appleLoading
                  ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.apple, size: 22),
              label: const Text('Continue with Apple'),
              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
            ),
          ],
        ],
      );
}
