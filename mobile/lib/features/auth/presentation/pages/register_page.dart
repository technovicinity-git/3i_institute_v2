import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';
import '../widgets/social_auth_buttons.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  DateTime? _dateOfBirth;
  String _locale = 'en';
  bool _showPassword = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  DateTime get _latestAllowedBirthDate {
    final today = DateTime.now();
    return DateTime(today.year - 18, today.month, today.day);
  }

  Future<void> _selectDate() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? _latestAllowedBirthDate,
      firstDate: DateTime(1900),
      lastDate: _latestAllowedBirthDate,
      helpText: 'Select your date of birth',
      currentDate: DateTime(now.year, now.month, now.day),
    );
    if (date != null) setState(() => _dateOfBirth = date);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateOfBirth == null) {
      setState(() => _error = 'Select your date of birth. You must be at least 18.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final email = await ref.read(authControllerProvider.notifier).register(
            firstName: _firstName.text,
            lastName: _lastName.text,
            email: _email.text,
            password: _password.text,
            dateOfBirth: DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
            locale: _locale,
          );
      if (mounted) context.go('/check-email?email=${Uri.encodeQueryComponent(email)}');
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: 'Registration failed. Please try again.'));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
        title: 'Start your journey',
        description: 'One account. Add your children whenever you are ready.',
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AuthInlineError(_error),
              TextFormField(
                controller: _firstName,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.givenName],
                decoration: const InputDecoration(labelText: 'First name', hintText: 'e.g. Sarah'),
                validator: (value) => _requiredName(value, 'First name'),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _lastName,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.familyName],
                decoration: const InputDecoration(labelText: 'Last name', hintText: 'e.g. Ahmed'),
                validator: (value) => _requiredName(value, 'Last name'),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.email],
                decoration: const InputDecoration(labelText: 'Email address', hintText: 'sarah@example.com'),
                validator: _validateEmail,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _password,
                obscureText: !_showPassword,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                decoration: InputDecoration(
                  labelText: 'Password',
                  helperText: 'At least 10 characters',
                  suffixIcon: IconButton(
                    tooltip: _showPassword ? 'Hide password' : 'Show password',
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                    icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                  ),
                ),
                validator: (value) {
                  if ((value ?? '').length < 10) return 'Password must be at least 10 characters';
                  if (value!.length > 128) return 'Password must be 128 characters or fewer';
                  return null;
                },
              ),
              const SizedBox(height: 14),
              InkWell(
                onTap: _selectDate,
                borderRadius: BorderRadius.circular(12),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Date of birth',
                    helperText: 'You must be 18 or older',
                    suffixIcon: Icon(Icons.calendar_today_outlined, size: 19),
                  ),
                  child: Text(
                    _dateOfBirth == null ? 'Select date' : DateFormat.yMMMd().format(_dateOfBirth!),
                    style: TextStyle(color: _dateOfBirth == null ? Theme.of(context).hintColor : null),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                initialValue: _locale,
                decoration: const InputDecoration(labelText: 'Preferred language'),
                items: const [
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(value: 'bn', child: Text('বাংলা')),
                  DropdownMenuItem(value: 'hi', child: Text('हिन्दी')),
                  DropdownMenuItem(value: 'ur', child: Text('اردو')),
                  DropdownMenuItem(value: 'ar', child: Text('العربية')),
                ],
                onChanged: (value) => setState(() => _locale = value ?? 'en'),
              ),
              const SizedBox(height: 22),
              AuthPrimaryButton(label: 'Create account', onPressed: _submit, loading: _submitting),
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
              const SizedBox(height: 18),
              Center(
                child: Wrap(
                  alignment: WrapAlignment.center,
                  children: [
                    const Text('Already have an account? '),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                      child: const Text('Log in'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );

  String? _requiredName(String? value, String label) {
    final name = value?.trim() ?? '';
    if (name.isEmpty) return '$label is required';
    if (name.length > 100) return '$label must be 100 characters or fewer';
    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty || !email.contains('@') || !email.contains('.')) return 'Enter a valid email address';
    return null;
  }
}
