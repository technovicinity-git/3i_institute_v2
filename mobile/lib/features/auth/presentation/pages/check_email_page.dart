import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class CheckEmailPage extends ConsumerStatefulWidget {
  const CheckEmailPage({required this.email, super.key});

  final String email;

  @override
  ConsumerState<CheckEmailPage> createState() => _CheckEmailPageState();
}

class _CheckEmailPageState extends ConsumerState<CheckEmailPage> {
  Timer? _timer;
  int _secondsRemaining = 60;
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _timer?.cancel();
    setState(() => _secondsRemaining = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        setState(() => _secondsRemaining = 0);
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  Future<void> _resend() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).resendVerification(widget.email);
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Could not resend the email.'));
    } finally {
      if (mounted) {
        setState(() => _sending = false);
        _startCountdown();
      }
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: 'Check your email',
        description: 'We have sent a verification link to ${widget.email}.',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.mark_email_unread_outlined, size: 56, color: Color(0xFFB28A39)),
            const SizedBox(height: 20),
            AuthInlineError(_error),
            AuthPrimaryButton(
              label: _sending ? 'Sending...' : 'Resend email',
              onPressed: _secondsRemaining == 0 && !_sending ? _resend : null,
              loading: _sending,
            ),
            const SizedBox(height: 8),
            Text(
              _secondsRemaining == 0 ? 'You can resend now' : 'You can resend in $_secondsRemaining seconds',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 18),
            TextButton(onPressed: () => context.go('/register'), child: const Text('Wrong email? Go back')),
            TextButton(onPressed: () => context.go('/login'), child: const Text('Back to log in')),
          ],
        ),
      );
}
