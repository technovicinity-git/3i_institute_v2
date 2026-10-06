import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class InstructorLoginPage extends ConsumerStatefulWidget {
  const InstructorLoginPage({super.key});

  @override
  ConsumerState<InstructorLoginPage> createState() =>
      _InstructorLoginPageState();
}

class _InstructorLoginPageState extends ConsumerState<InstructorLoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final existingAccount = ref.read(authControllerProvider).asData?.value;
      if (existingAccount != null && existingAccount.role != 'Instructor') {
        await ref.read(authControllerProvider.notifier).logout();
      }
      await ref
          .read(authControllerProvider.notifier)
          .loginInstructor(
            email: _email.text.trim().toLowerCase(),
            password: _password.text,
          );
      ref.read(activeLearnerProfileProvider.notifier).select(null);
      if (mounted) context.go('/instructor/dashboard');
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = apiErrorMessage(
            error,
            fallback: 'Login failed. Please try again.',
          );
        });
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
    title: 'Welcome back',
    description: 'Sign in to your instructor dashboard.',
    child: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'INSTRUCTOR PORTAL',
            style: TextStyle(
              color: Color(0xFFB8912F),
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 18),
          AuthInlineError(_error),
          TextFormField(
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            autofillHints: const [AutofillHints.username, AutofillHints.email],
            autocorrect: false,
            decoration: const InputDecoration(
              labelText: 'Email address',
              hintText: 'instructor@example.com',
            ),
            validator: (value) {
              final email = value?.trim() ?? '';
              if (email.isEmpty ||
                  !email.contains('@') ||
                  !email.contains('.')) {
                return 'Enter a valid email address';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _password,
            obscureText: !_showPassword,
            textInputAction: TextInputAction.done,
            autofillHints: const [AutofillHints.password],
            onFieldSubmitted: (_) => _submit(),
            decoration: InputDecoration(
              labelText: 'Password',
              suffixIcon: IconButton(
                tooltip: _showPassword ? 'Hide password' : 'Show password',
                onPressed: () => setState(() => _showPassword = !_showPassword),
                icon: Icon(
                  _showPassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
              ),
            ),
            validator: (value) =>
                value == null || value.isEmpty ? 'Password is required' : null,
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => context.push('/forgot-password'),
              child: const Text('Forgot password?'),
            ),
          ),
          AuthPrimaryButton(
            label: 'Log in',
            onPressed: _submit,
            loading: _submitting,
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text('or'),
                ),
                Expanded(child: Divider()),
              ],
            ),
          ),
          Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              children: [
                const Text('Want to become an instructor? '),
                TextButton(
                  onPressed: () => context.push('/instructor/register'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Apply now'),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}
