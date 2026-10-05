import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

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
  final _imagePicker = ImagePicker();
  DateTime? _birthDate;
  XFile? _avatar;
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _pin.dispose();
    super.dispose();
  }

  Future<void> _chooseAvatar() async {
    try {
      final image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
        maxWidth: 1200,
        maxHeight: 1200,
      );
      if (image == null || !mounted) return;
      final extension = image.name.split('.').last.toLowerCase();
      if (!const {'jpg', 'jpeg', 'png', 'webp', 'gif'}.contains(extension)) {
        _showMessage('Choose a JPEG, PNG, WebP, or GIF image.');
        return;
      }
      if (await image.length() > 5 * 1024 * 1024) {
        _showMessage('Image size exceeds the 5 MB limit.');
        return;
      }
      setState(() => _avatar = image);
    } catch (_) {
      if (mounted) _showMessage('Could not open your photo library.');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  int _ageAt(DateTime date) {
    final today = DateTime.now();
    var age = today.year - date.year;
    if (today.month < date.month ||
        (today.month == date.month && today.day < date.day)) {
      age--;
    }
    return age;
  }

  Future<void> _uploadAvatar(String profileId) async {
    final image = _avatar;
    if (image == null) return;
    final extension = image.name.split('.').last.toLowerCase();
    final subtype = switch (extension) {
      'jpg' || 'jpeg' => 'jpeg',
      'png' => 'png',
      'webp' => 'webp',
      'gif' => 'gif',
      _ => throw const FormatException('Unsupported image format.'),
    };
    final form = FormData.fromMap({
      'learnerProfileId': profileId,
      'image': await MultipartFile.fromFile(
        image.path,
        filename: image.name,
        contentType: DioMediaType('image', subtype),
      ),
    });
    await ref
        .read(apiClientProvider)
        .dio
        .post<Map<String, dynamic>>('/uploads/learner-avatar', data: form);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _birthDate == null) {
      if (_birthDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Choose a date of birth.')),
        );
      }
      return;
    }
    setState(() => _saving = true);
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .post<Map<String, dynamic>>(
            '/learners',
            data: {
              'displayName': _name.text.trim(),
              'dateOfBirth':
                  '${_birthDate!.year.toString().padLeft(4, '0')}-${_birthDate!.month.toString().padLeft(2, '0')}-${_birthDate!.day.toString().padLeft(2, '0')}',
              'chatEnabled': _ageAt(_birthDate!) >= 13,
              if (_pin.text.isNotEmpty) 'pin': _pin.text,
            },
          );
      final payload = response.data?['data'];
      final profileId = payload is Map ? payload['id'] as String? : null;
      var avatarFailed = false;
      if (_avatar != null && profileId != null) {
        try {
          await _uploadAvatar(profileId);
        } catch (_) {
          avatarFailed = true;
        }
      }
      ref.invalidate(learnerProfilesProvider);
      if (mounted) {
        if (avatarFailed) {
          _showMessage(
            'Learner created, but the photo could not be uploaded. You can add it from profile management.',
          );
        }
        context.go('/profiles');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not add learner: $error')),
        );
      }
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Add learner',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontFamily: 'serif',
                  color: const Color(0xFF12304E),
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 54,
                          backgroundColor: const Color(0xFFEAF1F6),
                          backgroundImage: _avatar == null
                              ? null
                              : FileImage(File(_avatar!.path)),
                          child: _avatar == null
                              ? Text(
                                  (_name.text.trim().isEmpty
                                          ? 'L'
                                          : _name.text.trim()[0])
                                      .toUpperCase(),
                                  style: const TextStyle(
                                    fontFamily: 'serif',
                                    fontSize: 34,
                                    color: Color(0xFF12304E),
                                  ),
                                )
                              : null,
                        ),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: IconButton.filled(
                            tooltip: 'Add profile picture',
                            onPressed: _saving ? null : _chooseAvatar,
                            style: IconButton.styleFrom(
                              backgroundColor: const Color(0xFF12304E),
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(
                              Icons.add_a_photo_outlined,
                              size: 19,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_avatar != null)
                      TextButton.icon(
                        onPressed: _saving
                            ? null
                            : () => setState(() => _avatar = null),
                        icon: const Icon(Icons.delete_outline, size: 16),
                        label: const Text('Remove photo'),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.red,
                        ),
                      )
                    else
                      const Padding(
                        padding: EdgeInsets.only(top: 7),
                        child: Text(
                          'Add a profile photo (optional)',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              TextFormField(
                controller: _name,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(labelText: 'Learner name'),
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Enter a name.'
                    : null,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  final today = DateTime.now();
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime(today.year - 10),
                    firstDate: DateTime(1900),
                    lastDate: today,
                  );
                  if (date != null) setState(() => _birthDate = date);
                },
                icon: const Icon(Icons.calendar_month),
                label: Text(
                  _birthDate == null
                      ? 'Date of birth'
                      : MaterialLocalizations.of(
                          context,
                        ).formatMediumDate(_birthDate!),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _pin,
                keyboardType: TextInputType.number,
                obscureText: true,
                maxLength: 4,
                decoration: const InputDecoration(
                  labelText: '4-digit PIN (optional)',
                  counterText: '',
                ),
                validator: (value) =>
                    value != null &&
                        value.isNotEmpty &&
                        !RegExp(r'^\d{4}$').hasMatch(value)
                    ? 'Enter exactly four digits.'
                    : null,
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Create learner'),
              ),
              TextButton(
                onPressed: () => context.go('/profiles'),
                child: const Text('Cancel'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
