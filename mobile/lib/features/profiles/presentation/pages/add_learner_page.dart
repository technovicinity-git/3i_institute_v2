import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';

class AddLearnerPage extends ConsumerStatefulWidget {
  const AddLearnerPage({super.key});
  @override
  ConsumerState<AddLearnerPage> createState() => _AddLearnerPageState();
}

class _AddLearnerPageState extends ConsumerState<AddLearnerPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _pin = TextEditingController();
  DateTime? _birthDate;
  bool _saving = false;

  @override
  void dispose() { _name.dispose(); _pin.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _birthDate == null) {
      if (_birthDate == null) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Choose a date of birth.')));
      return;
    }
    setState(() => _saving = true);
    try {
      await ref.read(apiClientProvider).dio.post<Map<String, dynamic>>('/learners', data: {
        'displayName': _name.text.trim(),
        'dateOfBirth': '${_birthDate!.year.toString().padLeft(4, '0')}-${_birthDate!.month.toString().padLeft(2, '0')}-${_birthDate!.day.toString().padLeft(2, '0')}',
        if (_pin.text.isNotEmpty) 'pin': _pin.text,
      });
      ref.invalidate(learnerProfilesProvider);
      if (mounted) context.go('/profiles');
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not add learner: $error')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Form(
              key: _formKey,
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text('Add learner', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontFamily: 'serif', color: const Color(0xFF12304E))),
                const SizedBox(height: 20),
                TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Learner name'), validator: (value) => value == null || value.trim().isEmpty ? 'Enter a name.' : null),
                const SizedBox(height: 12),
                OutlinedButton.icon(onPressed: () async { final today = DateTime.now(); final date = await showDatePicker(context: context, initialDate: DateTime(today.year - 10), firstDate: DateTime(1900), lastDate: today); if (date != null) setState(() => _birthDate = date); }, icon: const Icon(Icons.calendar_month), label: Text(_birthDate == null ? 'Date of birth' : MaterialLocalizations.of(context).formatMediumDate(_birthDate!))),
                const SizedBox(height: 12),
                TextFormField(controller: _pin, keyboardType: TextInputType.number, obscureText: true, maxLength: 4, decoration: const InputDecoration(labelText: '4-digit PIN (optional)', counterText: ''), validator: (value) => value != null && value.isNotEmpty && !RegExp(r'^\d{4}$').hasMatch(value) ? 'Enter exactly four digits.' : null),
                const SizedBox(height: 18),
                FilledButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox.square(dimension: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Create learner')),
                TextButton(onPressed: () => context.go('/profiles'), child: const Text('Cancel')),
              ]),
            ),
          ),
        ),
      );
}
