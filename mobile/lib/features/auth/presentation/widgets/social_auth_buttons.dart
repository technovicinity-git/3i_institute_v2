import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../../core/auth/google_auth.dart';
import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import 'auth_scaffold.dart';

/// "Continue with Google" (and Apple on iOS) for the learner login and
/// register screens. Existing accounts are signed in; a new Google/Apple
/// account is created after asking for the date of birth the API requires.
class SocialAuthButtons extends ConsumerStatefulWidget {
  const SocialAuthButtons({this.isSignUp = false, super.key});

  /// Register screen wording ("Sign up with Google").
  final bool isSignUp;

  @override
  ConsumerState<SocialAuthButtons> createState() => _SocialAuthButtonsState();
}

class _SocialAuthButtonsState extends ConsumerState<SocialAuthButtons> {
  bool _googleLoading = false;
  bool _appleLoading = false;
  String? _error;

  bool get _busy => _googleLoading || _appleLoading;

  Future<void> _googleSignIn() async {
    setState(() {
      _googleLoading = true;
      _error = null;
    });
    try {
      final idToken = await GoogleAuth.signIn();
      await _completeSocialLogin(
        provider: 'Google',
        login: (dateOfBirth) => ref
            .read(authControllerProvider.notifier)
            .loginWithGoogle(idToken: idToken, dateOfBirth: dateOfBirth),
      );
    } catch (error) {
      if (mounted && !GoogleAuth.isCancelled(error)) {
        setState(
          () => _error = error is GoogleAuthConfigException
              ? error.message
              : apiErrorMessage(error, fallback: 'Google sign-in failed.'),
        );
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
        scopes: const [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      final identityToken = credential.identityToken;
      if (identityToken == null || identityToken.isEmpty) {
        throw Exception('Apple did not return an identity token.');
      }
      await _completeSocialLogin(
        provider: 'Apple',
        login: (dateOfBirth) => ref
            .read(authControllerProvider.notifier)
            .loginWithApple(
              identityToken: identityToken,
              dateOfBirth: dateOfBirth,
              firstName: credential.givenName,
              lastName: credential.familyName,
            ),
      );
    } catch (error) {
      final cancelled =
          error is SignInWithAppleAuthorizationException &&
          error.code == AuthorizationErrorCode.canceled;
      if (mounted && !cancelled) {
        setState(
          () => _error = apiErrorMessage(
            error,
            fallback: 'Apple sign-in failed.',
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _appleLoading = false);
    }
  }

  /// Signs in; if the API says this is a new account (date of birth
  /// required), asks for it and retries — that retry creates the account.
  Future<void> _completeSocialLogin({
    required String provider,
    required Future<void> Function(String? dateOfBirth) login,
  }) async {
    try {
      await login(null);
    } catch (error) {
      if (!_needsDateOfBirth(error)) rethrow;
      final dateOfBirth = await _askForDateOfBirth(provider);
      if (dateOfBirth == null) {
        if (mounted) {
          setState(
            () => _error =
                'Your date of birth is required to create an account with $provider.',
          );
        }
        return;
      }
      await login(dateOfBirth);
    }
    if (mounted && ref.read(authControllerProvider).asData?.value != null) {
      context.go('/profiles');
    }
  }

  bool _needsDateOfBirth(Object error) => apiErrorMessage(
    error,
    fallback: '',
  ).toLowerCase().contains('date of birth');

  Future<String?> _askForDateOfBirth(String provider) async {
    final now = DateTime.now();
    final proceed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create your account'),
        content: Text(
          "There's no 3i account for this $provider email yet. To create one, "
          'enter your date of birth. You must be at least 13 years old.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
    if (proceed != true || !mounted) return null;
    final selected = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18, now.month, now.day),
      firstDate: DateTime(1900),
      lastDate: DateTime(now.year - 13, now.month, now.day),
      initialEntryMode: DatePickerEntryMode.calendarOnly,
      helpText: 'Select your date of birth',
    );
    return selected == null ? null : DateFormat('yyyy-MM-dd').format(selected);
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      AuthInlineError(_error),
      OutlinedButton.icon(
        onPressed: _busy ? null : _googleSignIn,
        icon: _googleLoading
            ? const SizedBox.square(
                dimension: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const _GoogleLogo(size: 20),
        label: Text(
          widget.isSignUp ? 'Sign up with Google' : 'Continue with Google',
        ),
        style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
      ),
      if (Platform.isIOS) ...[
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _busy ? null : _appleSignIn,
          icon: _appleLoading
              ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.apple, size: 22),
          label: Text(
            widget.isSignUp ? 'Sign up with Apple' : 'Continue with Apple',
          ),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
          ),
        ),
      ],
    ],
  );
}

/// The four-colour Google "G", drawn so no image asset is needed.
class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) => SizedBox.square(
    dimension: size,
    child: const CustomPaint(painter: _GoogleLogoPainter()),
  );
}

class _GoogleLogoPainter extends CustomPainter {
  const _GoogleLogoPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * .2;
    final rect = Rect.fromLTWH(
      stroke / 2,
      stroke / 2,
      size.width - stroke,
      size.height - stroke,
    );
    Paint arc(Color color) => Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke;
    double deg(double d) => d * math.pi / 180;

    // Angles run clockwise from 3 o'clock.
    canvas
      ..drawArc(rect, deg(-40), deg(-100), false, arc(const Color(0xFFEA4335)))
      ..drawArc(rect, deg(-140), deg(-80), false, arc(const Color(0xFFFBBC05)))
      ..drawArc(rect, deg(-220), deg(-90), false, arc(const Color(0xFF34A853)))
      ..drawArc(rect, deg(-310), deg(-50), false, arc(const Color(0xFF4285F4)))
      // The crossbar of the G.
      ..drawRect(
        Rect.fromLTWH(
          size.width / 2,
          size.height / 2 - stroke / 2,
          size.width / 2,
          stroke,
        ),
        Paint()..color = const Color(0xFF4285F4),
      );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
