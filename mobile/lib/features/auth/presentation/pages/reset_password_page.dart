import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class ResetPasswordPage extends ConsumerStatefulWidget {
  const ResetPasswordPage({required this.token, super.key});

  final String token;

  @override
  ConsumerState<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends ConsumerState<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _submitting = false;
  bool _completed = false;
  String? _error;

  @override
  void dispose() {
    _password.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (widget.token.isEmpty) {
      setState(() => _error = 'This password reset link is invalid or incomplete. Request a new link.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).resetPassword(
            token: widget.token,
            password: _password.text,
          );
      if (mounted) setState(() => _completed = true);
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Failed to reset password.'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: _completed ? 'Password updated' : 'Choose a new password',
        description: _completed
            ? 'Your password has been updated. Log in with your new password.'
            : 'Choose a secure password with at least 10 characters.',
        child: _completed
            ? AuthPrimaryButton(label: 'Go to log in', onPressed: () => context.go('/login'))
            : Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AuthInlineError(_error),
                    TextFormField(
                      controller: _password,
                      obscureText: true,
                      autofillHints: const [AutofillHints.newPassword],
                      decoration: const InputDecoration(labelText: 'New password'),
                      validator: (value) {
                        if ((value ?? '').length < 10) return 'Password must be at least 10 characters';
                        if (value!.length > 128) return 'Password must be 128 characters or fewer';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _confirmPassword,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: const InputDecoration(labelText: 'Confirm new password'),
                      validator: (value) => value != _password.text ? 'Passwords do not match' : null,
                    ),
                    const SizedBox(height: 20),
                    AuthPrimaryButton(label: 'Update password', onPressed: _submit, loading: _submitting),
                  ],
                ),
              ),
      );
}
