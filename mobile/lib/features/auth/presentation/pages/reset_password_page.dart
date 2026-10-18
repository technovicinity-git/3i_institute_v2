import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
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
      setState(() => _error = context.l10n.resetInvalidLink);
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
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: context.l10n.resetFailed));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
        title: _completed ? l10n.resetDoneTitle : l10n.resetTitle,
        description: _completed ? l10n.resetDoneBody : l10n.resetSubtitle,
        child: _completed
            ? AuthPrimaryButton(label: l10n.authGoToLogin, onPressed: () => context.go('/login'))
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
                      decoration: InputDecoration(labelText: l10n.resetNewPassword),
                      validator: (value) {
                        if ((value ?? '').length < 10) return l10n.authPasswordMin;
                        if (value!.length > 128) return l10n.authPasswordMax;
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _confirmPassword,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: InputDecoration(labelText: l10n.resetConfirm),
                      validator: (value) => value != _password.text ? l10n.resetMismatch : null,
                    ),
                    const SizedBox(height: 20),
                    AuthPrimaryButton(label: l10n.resetSubmit, onPressed: _submit, loading: _submitting),
                  ],
                ),
              ),
      );
  }
}
