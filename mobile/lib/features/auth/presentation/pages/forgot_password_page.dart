import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
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
      setState(() => _error = context.l10n.authEmailInvalid);
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
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: context.l10n.forgotFailed));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
        title: _submitted ? l10n.forgotSentTitle : l10n.forgotTitle,
        description: _submitted ? l10n.forgotSentBody : l10n.forgotSubtitle,
        child: _submitted
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.mark_email_read_outlined, size: 52, color: Color(0xFF287A50)),
                  const SizedBox(height: 16),
                  AuthPrimaryButton(label: l10n.authBackToLogin, onPressed: () => context.go('/login')),
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
                    decoration: InputDecoration(labelText: l10n.authEmailLabel, hintText: 'sarah@example.com'),
                  ),
                  const SizedBox(height: 20),
                  AuthPrimaryButton(label: l10n.forgotSubmit, onPressed: _submit, loading: _submitting),
                  const SizedBox(height: 12),
                  TextButton(onPressed: () => context.go('/login'), child: Text(l10n.authBackToLogin)),
                ],
              ),
      );
  }
}
