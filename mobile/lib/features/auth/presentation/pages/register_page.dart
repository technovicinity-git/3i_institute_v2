import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/language_picker.dart';
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
      helpText: context.l10n.authSelectDob,
      currentDate: DateTime(now.year, now.month, now.day),
    );
    if (date != null) setState(() => _dateOfBirth = date);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateOfBirth == null) {
      setState(() => _error = context.l10n.registerDobRequired);
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
            locale: ref.read(languageProvider),
          );
      if (mounted) context.go('/check-email?email=${Uri.encodeQueryComponent(email)}');
    } catch (error) {
      if (mounted) setState(() => _error = apiErrorMessage(error, fallback: context.l10n.registerFailed));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
        title: l10n.registerTitle,
        description: l10n.registerSubtitle,
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
                decoration: InputDecoration(labelText: l10n.registerFirstName, hintText: l10n.registerFirstNameHint),
                validator: (value) => _requiredName(value, l10n.registerFirstNameRequired),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _lastName,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.familyName],
                decoration: InputDecoration(labelText: l10n.registerLastName, hintText: l10n.registerLastNameHint),
                validator: (value) => _requiredName(value, l10n.registerLastNameRequired),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.email],
                decoration: InputDecoration(labelText: l10n.authEmailLabel, hintText: 'sarah@example.com'),
                validator: _validateEmail,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _password,
                obscureText: !_showPassword,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                decoration: InputDecoration(
                  labelText: l10n.authPasswordLabel,
                  helperText: l10n.registerPasswordHint,
                  suffixIcon: IconButton(
                    tooltip: _showPassword ? l10n.authHidePassword : l10n.authShowPassword,
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                    icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                  ),
                ),
                validator: (value) {
                  if ((value ?? '').length < 10) return l10n.authPasswordMin;
                  if (value!.length > 128) return l10n.authPasswordMax;
                  return null;
                },
              ),
              const SizedBox(height: 14),
              InkWell(
                onTap: _selectDate,
                borderRadius: BorderRadius.circular(12),
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: l10n.registerDateOfBirth,
                    helperText: l10n.registerDateOfBirthHint,
                    suffixIcon: const Icon(Icons.calendar_today_outlined, size: 19),
                  ),
                  child: Text(
                    _dateOfBirth == null ? l10n.authSelectDate : DateFormat.yMMMd().format(_dateOfBirth!),
                    style: TextStyle(color: _dateOfBirth == null ? Theme.of(context).hintColor : null),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              const LanguageDropdownField(),
              const SizedBox(height: 22),
              AuthPrimaryButton(label: l10n.registerSubmit, onPressed: _submit, loading: _submitting),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text(l10n.commonOr)),
                    const Expanded(child: Divider()),
                  ],
                ),
              ),
              const SocialAuthButtons(isSignUp: true),
              const SizedBox(height: 18),
              Center(
                child: Wrap(
                  alignment: WrapAlignment.center,
                  children: [
                    Text('${l10n.registerHaveAccount} '),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                      child: Text(l10n.registerLogIn),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
  }

  String? _requiredName(String? value, String requiredMessage) {
    final name = value?.trim() ?? '';
    if (name.isEmpty) return requiredMessage;
    if (name.length > 100) return context.l10n.registerNameTooLong;
    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty || !email.contains('@') || !email.contains('.')) return context.l10n.authEmailInvalid;
    return null;
  }
}
