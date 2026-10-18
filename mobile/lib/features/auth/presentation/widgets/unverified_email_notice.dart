import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';

/// Shown when login fails with `EMAIL_NOT_VERIFIED`: lets the user get a new
/// verification link (e.g. after the first one expired) without leaving.
class UnverifiedEmailNotice extends ConsumerStatefulWidget {
  const UnverifiedEmailNotice({
    required this.email,
    this.instructor = false,
    super.key,
  });

  final String email;
  final bool instructor;

  @override
  ConsumerState<UnverifiedEmailNotice> createState() =>
      _UnverifiedEmailNoticeState();
}

class _UnverifiedEmailNoticeState extends ConsumerState<UnverifiedEmailNotice> {
  bool _sending = false;

  Future<void> _resend() async {
    setState(() => _sending = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .resendVerification(widget.email);
      if (!mounted) return;
      final query = Uri(
        queryParameters: {
          'email': widget.email,
          if (widget.instructor) 'instructor': 'true',
        },
      ).query;
      context.go('/check-email?$query');
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(error, fallback: context.l10n.checkEmailResendFailed),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xFFFFFBEB),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(0xFFFDE68A)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.l10n.unverifiedTitle,
          style: const TextStyle(
            color: Color(0xFF78350F),
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          context.l10n.unverifiedBody(widget.email),
          style: const TextStyle(color: Color(0xFF78350F), fontSize: 13),
        ),
        TextButton(
          onPressed: _sending ? null : _resend,
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
            foregroundColor: const Color(0xFF157A34),
          ),
          child: Text(
            _sending ? context.l10n.commonSending : context.l10n.unverifiedResend,
          ),
        ),
      ],
    ),
  );
}
