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
      await ref.read(authControllerProvider.notifier).verifyEmail(widget.token!);
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Email verification failed.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: _loading ? 'Verifying your email...' : _error == null ? 'Email verified!' : 'Verification failed',
        description: _loading
            ? 'Please wait while we verify your email.'
            : _error ?? 'Your email is verified. You can now log in.',
        child: Column(
          children: [
            if (_loading)
              const CircularProgressIndicator()
            else ...[
              Icon(_error == null ? Icons.check_circle_outline : Icons.error_outline,
                  size: 54, color: _error == null ? const Color(0xFF287A50) : Theme.of(context).colorScheme.error),
              const SizedBox(height: 20),
              AuthPrimaryButton(label: 'Go to log in', onPressed: () => context.go('/login')),
            ],
          ],
        ),
      );
}
