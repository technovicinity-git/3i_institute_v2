import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class CheckEmailPage extends ConsumerStatefulWidget {
  const CheckEmailPage({
    required this.email,
    this.instructor = false,
    super.key,
  });

  final String email;
  final bool instructor;

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
      await ref
          .read(authControllerProvider.notifier)
          .resendVerification(widget.email);
    } catch (error) {
      if (mounted) {
        setState(
          () => _error = apiErrorMessage(
            error,
            fallback: context.l10n.checkEmailResendFailed,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _sending = false);
        _startCountdown();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
    showLanguage: !widget.instructor,
    title: l10n.checkEmailTitle,
    description: l10n.checkEmailSentTo(widget.email),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(
          Icons.mark_email_unread_outlined,
          size: 56,
          color: Color(0xFFB28A39),
        ),
        const SizedBox(height: 20),
        AuthInlineError(_error),
        AuthPrimaryButton(
          label: _sending ? l10n.commonSending : l10n.checkEmailResend,
          onPressed: _secondsRemaining == 0 && !_sending ? _resend : null,
          loading: _sending,
        ),
        const SizedBox(height: 8),
        Text(
          _secondsRemaining == 0
              ? l10n.checkEmailCanResendNow
              : l10n.checkEmailResendIn(_secondsRemaining),
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 18),
        TextButton(
          onPressed: () => context.go(
            widget.instructor ? '/instructor/register' : '/register',
          ),
          child: Text(l10n.checkEmailWrongEmail),
        ),
        TextButton(
          onPressed: () =>
              context.go(widget.instructor ? '/instructor/login' : '/login'),
          child: Text(
            widget.instructor ? l10n.checkEmailBackInstructor : l10n.authBackToLogin,
          ),
        ),
      ],
    ),
  );
  }
}
