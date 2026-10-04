import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/social_auth_buttons.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).login(
            email: _emailController.text,
            password: _passwordController.text,
          );
      if (mounted) context.go('/home');
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Login failed. Please try again.'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: 'Welcome back',
        description: 'Please enter your credentials to log in.',
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AuthInlineError(_error),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.username, AutofillHints.email],
                autocorrect: false,
                decoration: const InputDecoration(labelText: 'Email address', hintText: 'sarah@example.com'),
                validator: (value) {
                  final email = value?.trim() ?? '';
                  if (email.isEmpty || !email.contains('@') || !email.contains('.')) return 'Enter a valid email address';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                onFieldSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: 'Password',
                  suffixIcon: IconButton(
                    tooltip: _obscurePassword ? 'Show password' : 'Hide password',
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                  ),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Password is required' : null,
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => context.push('/forgot-password'),
                  child: const Text('Forgot password?'),
                ),
              ),
              AuthPrimaryButton(label: 'Log in', onPressed: _submit, loading: _submitting),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('or')),
                    Expanded(child: Divider()),
                  ],
                ),
              ),
              const SocialAuthButtons(),
              const SizedBox(height: 20),
              Center(
                child: Wrap(
                  alignment: WrapAlignment.center,
                  children: [
                    const Text('New to 3i? '),
                    TextButton(
                      onPressed: () => context.push('/register'),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                      child: const Text('Create an account'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}
