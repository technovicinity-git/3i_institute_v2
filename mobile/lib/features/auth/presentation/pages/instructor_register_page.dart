import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_scaffold.dart';

class InstructorRegisterPage extends ConsumerStatefulWidget {
  const InstructorRegisterPage({super.key});

  @override
  ConsumerState<InstructorRegisterPage> createState() =>
      _InstructorRegisterPageState();
}

class _InstructorRegisterPageState
    extends ConsumerState<InstructorRegisterPage> {
  static const _states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _bio = TextEditingController();
  final _expertise = TextEditingController();
  final _wwccNumber = TextEditingController();
  DateTime? _dateOfBirth;
  DateTime? _wwccExpiry;
  String? _wwccState;
  String _locale = 'en';
  PlatformFile? _cv;
  Uint8List? _cvBytes;
  bool _showPassword = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    _bio.dispose();
    _expertise.dispose();
    _wwccNumber.dispose();
    super.dispose();
  }

  DateTime get _latestAllowedBirthDate {
    final now = DateTime.now();
    return DateTime(now.year - 18, now.month, now.day);
  }

  Future<void> _selectDate({required bool expiry}) async {
    final now = DateTime.now();
    final latest = _latestAllowedBirthDate;
    final selected = expiry ? _wwccExpiry : _dateOfBirth;
    final date = await showDatePicker(
      context: context,
      initialDate: selected ?? (expiry ? now : latest),
      firstDate: DateTime(1900),
      lastDate: expiry ? DateTime(now.year + 30) : latest,
      helpText: expiry ? 'Select WWCC expiry date' : 'Select date of birth',
    );
    if (date == null) return;
    setState(() {
      if (expiry) {
        _wwccExpiry = date;
      } else {
        _dateOfBirth = date;
      }
    });
  }

  Future<void> _pickCv() async {
    try {
      final file = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: const ['pdf'],
      );
      if (file == null) return;
      final size = file.lengthSync() ?? await file.length();
      if (size == null || size == 0) {
        _showError('The selected PDF is empty or could not be read.');
        return;
      }
      if (size > 5 * 1024 * 1024) {
        _showError('CV must be under 5 MB.');
        return;
      }
      final bytes = await file.readAsBytes();
      if (bytes.isEmpty) {
        _showError('The selected PDF could not be read.');
        return;
      }
      if (String.fromCharCodes(bytes.take(5)) != '%PDF-') {
        _showError('The selected file is not a valid PDF.');
        return;
      }
      setState(() {
        _cv = file;
        _cvBytes = bytes;
      });
    } catch (_) {
      _showError('Could not open the file picker. Please try again.');
    }
  }

  void _showError(String message) {
    if (mounted) setState(() => _error = message);
  }

  String? _required(String? value, String label, {int max = 500}) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return '$label is required';
    if (text.length > max) return '$label must be $max characters or fewer';
    return null;
  }

  String _dateString(DateTime date) => DateFormat('yyyy-MM-dd').format(date);

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateOfBirth == null ||
        _dateOfBirth!.isAfter(_latestAllowedBirthDate)) {
      _showError('Select your date of birth. Instructors must be at least 18.');
      return;
    }
    if (_cv == null || _cvBytes == null) {
      _showError('Please upload your CV as a PDF.');
      return;
    }
    if (_wwccState == null || _wwccExpiry == null) {
      _showError('Enter your WWCC issuing state and expiry date.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final email = await ref
          .read(authControllerProvider.notifier)
          .registerInstructor(
            firstName: _firstName.text,
            lastName: _lastName.text,
            email: _email.text,
            password: _password.text,
            dateOfBirth: _dateString(_dateOfBirth!),
            locale: _locale,
            bio: _bio.text,
            areaOfExpertise: _expertise.text,
            cvBytes: _cvBytes!,
            cvFileName: _cv!.name,
            wwccNumber: _wwccNumber.text,
            wwccState: _wwccState!,
            wwccExpiry: _dateString(_wwccExpiry!),
          );
      if (mounted) {
        context.go(
          '/check-email?email=${Uri.encodeQueryComponent(email)}&instructor=true',
        );
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = apiErrorMessage(
            error,
            fallback: 'Application could not be submitted. Please try again.',
          );
        });
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthScaffold(
    title: 'Apply to teach at 3i',
    description: 'Create your account and submit your teaching application.',
    child: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AuthInlineError(_error),
          Text(
            'Your account',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: const Color(0xFF12304E),
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _firstName,
            textCapitalization: TextCapitalization.words,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'First name'),
            validator: (value) => _required(value, 'First name', max: 100),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _lastName,
            textCapitalization: TextCapitalization.words,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'Last name'),
            validator: (value) => _required(value, 'Last name', max: 100),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            autofillHints: const [AutofillHints.email],
            autocorrect: false,
            decoration: const InputDecoration(labelText: 'Email address'),
            validator: (value) {
              final email = value?.trim() ?? '';
              return email.contains('@') && email.contains('.')
                  ? null
                  : 'Enter a valid email address';
            },
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _password,
            obscureText: !_showPassword,
            autofillHints: const [AutofillHints.newPassword],
            decoration: InputDecoration(
              labelText: 'Password',
              helperText: 'At least 10 characters',
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
            validator: (value) {
              final password = value ?? '';
              if (password.length < 10) {
                return 'Password must be at least 10 characters';
              }
              if (password.length > 128) {
                return 'Password must be 128 characters or fewer';
              }
              return null;
            },
          ),
          const SizedBox(height: 14),
          _DateField(
            label: 'Date of birth',
            value: _dateOfBirth,
            helper: 'You must be 18 or older',
            onTap: () => _selectDate(expiry: false),
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            initialValue: _locale,
            decoration: const InputDecoration(labelText: 'Locale'),
            items: const [
              DropdownMenuItem(value: 'en', child: Text('English')),
              DropdownMenuItem(value: 'bn', child: Text('Bengali')),
              DropdownMenuItem(value: 'hi', child: Text('Hindi')),
              DropdownMenuItem(value: 'ur', child: Text('Urdu')),
              DropdownMenuItem(value: 'ar', child: Text('Arabic')),
            ],
            onChanged: (value) => setState(() => _locale = value ?? 'en'),
          ),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 10),
          Text(
            'Teaching application',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: const Color(0xFF12304E),
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _bio,
            minLines: 4,
            maxLines: 6,
            maxLength: 2000,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Tell us about yourself',
              hintText: 'Share your background and teaching philosophy.',
              alignLabelWithHint: true,
            ),
            validator: (value) {
              final bio = value?.trim() ?? '';
              if (bio.length < 20) return 'Please write at least 20 characters';
              if (bio.length > 2000) {
                return 'Bio must be 2000 characters or fewer';
              }
              return null;
            },
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _expertise,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(
              labelText: 'Area of expertise',
              hintText: 'e.g. Creative Arts, Software Engineering',
            ),
            validator: (value) {
              final expertise = value?.trim() ?? '';
              if (expertise.length < 3) return 'Enter at least 3 characters';
              if (expertise.length > 500) return 'Maximum 500 characters';
              return null;
            },
          ),
          const SizedBox(height: 14),
          _cv == null
              ? OutlinedButton.icon(
                  onPressed: _submitting ? null : _pickCv,
                  icon: const Icon(Icons.upload_file_outlined),
                  label: const Text('Upload your CV (PDF, max 5 MB)'),
                )
              : Card(
                  color: const Color(0xFFF1F8F2),
                  child: ListTile(
                    leading: const Icon(Icons.picture_as_pdf_outlined),
                    title: Text(
                      _cv!.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      '${((_cvBytes!.length) / (1024 * 1024)).toStringAsFixed(1)} MB',
                    ),
                    trailing: IconButton(
                      tooltip: 'Remove CV',
                      onPressed: _submitting
                          ? null
                          : () => setState(() {
                              _cv = null;
                              _cvBytes = null;
                            }),
                      icon: const Icon(Icons.close),
                    ),
                  ),
                ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _wwccNumber,
            decoration: const InputDecoration(
              labelText: 'WWCC number',
              hintText: 'Working with Children Check Number',
            ),
            validator: (value) => _required(value, 'WWCC number', max: 50),
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            initialValue: _wwccState,
            decoration: const InputDecoration(labelText: 'Issuing state'),
            items: [
              for (final state in _states)
                DropdownMenuItem(value: state, child: Text(state)),
            ],
            onChanged: (value) => setState(() => _wwccState = value),
            validator: (value) => value == null ? 'Select your state' : null,
          ),
          const SizedBox(height: 14),
          _DateField(
            label: 'WWCC expiry date',
            value: _wwccExpiry,
            onTap: () => _selectDate(expiry: true),
          ),
          const SizedBox(height: 24),
          AuthPrimaryButton(
            label: 'Submit application',
            onPressed: _submit,
            loading: _submitting,
          ),
          const SizedBox(height: 14),
          Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              children: [
                const Text('Already have an account? '),
                TextButton(
                  onPressed: () => context.go('/instructor/login'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Log in'),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class _DateField extends StatelessWidget {
  const _DateField({
    required this.label,
    required this.value,
    required this.onTap,
    this.helper,
  });

  final String label;
  final DateTime? value;
  final String? helper;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(12),
    child: InputDecorator(
      decoration: InputDecoration(
        labelText: label,
        helperText: helper,
        suffixIcon: const Icon(Icons.calendar_today_outlined, size: 19),
      ),
      child: Text(
        value == null ? 'Select date' : DateFormat.yMMMd().format(value!),
        style: TextStyle(
          color: value == null ? Theme.of(context).hintColor : null,
        ),
      ),
    ),
  );
}
