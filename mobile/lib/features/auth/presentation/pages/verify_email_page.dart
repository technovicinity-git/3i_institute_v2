import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class VerifyEmailPage extends ConsumerStatefulWidget {
  const VerifyEmailPage({required this.token, super.key});

  final String? token;

  @override
  ConsumerState<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends ConsumerState<VerifyEmailPage> {
  bool _loading = true;
  String? _error;
  // The link was real but expired: offer a new one instead of a dead end.
  bool _expired = false;
  bool _resending = false;
  bool _resent = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _verify());
  }

  Future<void> _verify() async {
    if (widget.token == null || widget.token!.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'This verification link is invalid or incomplete.';
      });
      return;
    }
    try {
      await ref
          .read(authControllerProvider.notifier)
          .verifyEmail(widget.token!);
    } catch (error) {
      if (mounted) {
        setState(() {
          _expired = apiErrorCode(error) == 'VERIFICATION_LINK_EXPIRED';
          _error = _expired
              ? 'Verification links are valid for 24 hours. We can send a '
                    'new one to the same email address.'
              : apiErrorMessage(error, fallback: 'Email verification failed.');
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    setState(() => _resending = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .resendVerificationForToken(widget.token!);
      if (mounted) setState(() => _resent = true);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(error, fallback: 'Could not send a new link.'),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  String get _title {
    if (_loading) return 'Verifying your email...';
    if (_resent) return 'New link sent';
    if (_expired) return 'This link has expired';
    return _error == null ? 'Email verified!' : 'Verification failed';
  }

  String get _description {
    if (_loading) return 'Please wait while we verify your email.';
    if (_resent) {
      return "We've sent a new verification link to your email. Open it "
          'within 24 hours to finish setting up your account.';
    }
    return _error ?? 'Your email is verified. You can now log in.';
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
    title: _title,
    description: _description,
    child: Column(
      children: [
        if (_loading)
          const CircularProgressIndicator()
        else ...[
          Icon(
            _error == null || _resent
                ? Icons.check_circle_outline
                : Icons.error_outline,
            size: 54,
            color: _error == null || _resent
                ? const Color(0xFF287A50)
                : Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 20),
          if (_expired && !_resent) ...[
            AuthPrimaryButton(
              label: 'Send me a new link',
              onPressed: _resend,
              loading: _resending,
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.go('/login'),
              child: const Text('Back to log in'),
            ),
          ] else
            AuthPrimaryButton(
              label: 'Go to log in',
              onPressed: () => context.go('/login'),
            ),
        ],
      ],
    ),
  );
}
