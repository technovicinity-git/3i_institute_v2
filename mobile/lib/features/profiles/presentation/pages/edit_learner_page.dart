import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/learner_profiles_providers.dart';
import '../widgets/learner_avatar.dart';

class EditLearnerPage extends ConsumerStatefulWidget {
  const EditLearnerPage({
    required this.profileId,
    this.resetPinOnOpen = false,
    super.key,
  });
  final String profileId;
  final bool resetPinOnOpen;

  @override
  ConsumerState<EditLearnerPage> createState() => _EditLearnerPageState();
}

class _EditLearnerPageState extends ConsumerState<EditLearnerPage> {
  final _name = TextEditingController();
  final _pin = TextEditingController();
  final _confirmPin = TextEditingController();
  final _picker = ImagePicker();
  LearnerProfile? _profile;
  XFile? _image;
  bool _loading = true;
  bool _saving = false;
  bool _showPin = false;

  @override
  void initState() {
    super.initState();
    _showPin = widget.resetPinOnOpen;
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _pin.dispose();
    _confirmPin.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/learners/${widget.profileId}');
      final data = response.data?['data'];
      if (data is Map<String, dynamic>) {
        _profile = LearnerProfile.fromJson(data);
        _name.text = _profile!.displayName;
      }
    } catch (error) {
      if (mounted) _message('Could not load learner profile: $error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _message(String value) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(value)));

  Future<void> _chooseImage() async {
    try {
      final image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
        maxWidth: 1200,
        maxHeight: 1200,
      );
      if (image == null) return;
      final extension = image.name.split('.').last.toLowerCase();
      if (!const {'jpg', 'jpeg', 'png', 'webp', 'gif'}.contains(extension)) {
        _message('Choose a JPEG, PNG, WebP, or GIF image.');
        return;
      }
      if (await image.length() > 5 * 1024 * 1024) {
        _message('Image size exceeds the 5 MB limit.');
        return;
      }
      setState(() => _image = image);
    } catch (_) {
      _message('Could not open your photo library.');
    }
  }

  Future<void> _uploadImage() async {
    final image = _image;
    if (image == null) return;
    final ext = image.name.split('.').last.toLowerCase();
    final subtype = switch (ext) {
      'jpg' || 'jpeg' => 'jpeg',
      'png' => 'png',
      'webp' => 'webp',
      'gif' => 'gif',
      _ => throw const FormatException('Unsupported image format'),
    };
    await ref
        .read(apiClientProvider)
        .dio
        .post<Map<String, dynamic>>(
          '/uploads/learner-avatar',
          data: FormData.fromMap({
            'learnerProfileId': widget.profileId,
            'image': await MultipartFile.fromFile(
              image.path,
              filename: image.name,
              contentType: DioMediaType('image', subtype),
            ),
          }),
        );
  }

  Future<void> _save() async {
    final profile = _profile;
    if (profile == null || _saving) return;
    final name = _name.text.trim();
    if (name.isEmpty || name.length > 100) {
      _message('Enter a name up to 100 characters.');
      return;
    }
    if (_showPin &&
        (_pin.text.length != 4 || !RegExp(r'^\d{4}$').hasMatch(_pin.text))) {
      _message('PIN must be exactly 4 digits.');
      return;
    }
    if (_showPin && _pin.text != _confirmPin.text) {
      _message('PINs do not match.');
      return;
    }
    setState(() => _saving = true);
    try {
      if (name != profile.displayName) {
        await ref
            .read(apiClientProvider)
            .dio
            .patch(
              '/learners/${widget.profileId}',
              data: {'displayName': name},
            );
      }
      if (_showPin) {
        await ref
            .read(apiClientProvider)
            .dio
            .post(
              '/learners/${widget.profileId}/reset-pin',
              data: {'pin': _pin.text},
            );
      }
      await _uploadImage();
      ref.invalidate(learnerProfilesProvider);
      if (mounted) context.go('/profile-management');
    } catch (error) {
      if (mounted) _message('Could not save profile: $error');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xfffbf9f4),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _profile == null
        ? const Center(child: Text('Profile not found'))
        : SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: ListView(
                  padding: const EdgeInsets.all(22),
                  children: [
                    Text(
                      'Edit ${_profile!.displayName}’s profile',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            fontFamily: 'serif',
                            color: const Color(0xff12304e),
                          ),
                    ),
                    const SizedBox(height: 24),
                    Center(
                      child: Stack(
                        children: [
                          _image == null
                              ? LearnerAvatar(
                                  imageUrl: _profile!.avatarUrl,
                                  initials: _profile!.initials,
                                  radius: 48,
                                )
                              : CircleAvatar(
                                  radius: 48,
                                  backgroundImage: FileImage(
                                    File(_image!.path),
                                  ),
                                ),
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: IconButton.filled(
                              onPressed: _chooseImage,
                              icon: const Icon(Icons.camera_alt_outlined),
                              tooltip: 'Change profile picture',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _name,
                      readOnly: _profile!.nameLocked,
                      maxLength: 100,
                      decoration: InputDecoration(
                        labelText: 'Learner’s name',
                        border: const OutlineInputBorder(),
                        helperText: _profile!.nameLocked
                            ? 'Name is locked because a certificate has been issued.'
                            : null,
                      ),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton(
                      onPressed: () => setState(() => _showPin = !_showPin),
                      child: Text(
                        _showPin
                            ? 'Cancel PIN change'
                            : _profile!.hasPin
                            ? 'Reset PIN'
                            : 'Set PIN',
                      ),
                    ),
                    if (_showPin) ...[
                      const SizedBox(height: 12),
                      TextField(
                        controller: _pin,
                        obscureText: true,
                        keyboardType: TextInputType.number,
                        maxLength: 4,
                        decoration: const InputDecoration(
                          labelText: 'New 4-digit PIN',
                          border: OutlineInputBorder(),
                          counterText: '',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _confirmPin,
                        obscureText: true,
                        keyboardType: TextInputType.number,
                        maxLength: 4,
                        decoration: const InputDecoration(
                          labelText: 'Confirm new PIN',
                          border: OutlineInputBorder(),
                          counterText: '',
                        ),
                      ),
                    ],
                    const SizedBox(height: 22),
                    FilledButton(
                      onPressed: _saving || _profile!.nameLocked && !_showPin
                          ? null
                          : _save,
                      child: Text(_saving ? 'Saving…' : 'Save changes'),
                    ),
                    TextButton(
                      onPressed: () => context.pop(),
                      child: const Text('Cancel'),
                    ),
                  ],
                ),
              ),
            ),
          ),
  );
}
