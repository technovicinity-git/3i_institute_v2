import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _email = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    if (!email.contains('@') || !email.contains('.')) {
      setState(() => _error = 'Enter a valid email address');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).forgotPassword(email);
      if (mounted) setState(() => _submitted = true);
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Failed to send reset link.'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: _submitted ? 'Check your email' : 'Reset your password',
        description: _submitted
            ? 'If an account with that email exists, we have sent a password reset link.'
            : 'Enter the email on your account and we will send you a link.',
        child: _submitted
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.mark_email_read_outlined, size: 52, color: Color(0xFF287A50)),
                  const SizedBox(height: 16),
                  AuthPrimaryButton(label: 'Back to log in', onPressed: () => context.go('/login')),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AuthInlineError(_error),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(labelText: 'Email address', hintText: 'sarah@example.com'),
                  ),
                  const SizedBox(height: 20),
                  AuthPrimaryButton(label: 'Send reset link', onPressed: _submit, loading: _submitting),
                  const SizedBox(height: 12),
                  TextButton(onPressed: () => context.go('/login'), child: const Text('Back to log in')),
                ],
              ),
      );
}
