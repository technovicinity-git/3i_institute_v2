import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
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
        _error = context.l10n.verifyInvalidLink;
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
              ? context.l10n.verifyExpiredBody
              : apiErrorMessage(error, fallback: context.l10n.verifyFailed);
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
            apiErrorMessage(error, fallback: context.l10n.verifyNewLinkFailed),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  String get _title {
    final l10n = context.l10n;
    if (_loading) return l10n.verifyVerifying;
    if (_resent) return l10n.verifyNewLinkTitle;
    if (_expired) return l10n.verifyExpiredTitle;
    return _error == null ? l10n.verifyVerifiedTitle : l10n.verifyFailedTitle;
  }

  String get _description {
    final l10n = context.l10n;
    if (_loading) return l10n.verifyPleaseWait;
    if (_resent) return l10n.verifyNewLinkBody;
    return _error ?? l10n.verifyVerifiedBody;
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
              label: context.l10n.verifySendNewLink,
              onPressed: _resend,
              loading: _resending,
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.go('/login'),
              child: Text(context.l10n.authBackToLogin),
            ),
          ] else
            AuthPrimaryButton(
              label: context.l10n.authGoToLogin,
              onPressed: () => context.go('/login'),
            ),
        ],
      ],
    ),
  );
}
