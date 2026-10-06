import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../auth/presentation/providers/auth_providers.dart';

const _navy = Color(0xFF0C1F33);
const _deepNavy = Color(0xFF12304E);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _maxPhotoBytes = 5 * 1024 * 1024;
const _photoTypes = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'gif': 'image/gif',
};

class InstructorSettingsPage extends ConsumerStatefulWidget {
  const InstructorSettingsPage({super.key});
  @override
  ConsumerState<InstructorSettingsPage> createState() =>
      _InstructorSettingsPageState();
}

class _InstructorSettingsPageState
    extends ConsumerState<InstructorSettingsPage> {
  final _firstName = TextEditingController(),
      _lastName = TextEditingController(),
      _bio = TextEditingController(),
      _currentPassword = TextEditingController(),
      _newPassword = TextEditingController(),
      _confirmPassword = TextEditingController();

  bool _loading = true, _loadFailed = false;
  String _email = '', _savedFirst = '', _savedLast = '';
  String? _avatarUrl;
  Uint8List? _preview;
  bool _uploadingPhoto = false, _savingProfile = false;
  bool _showPassword = false, _savingPassword = false, _obscure = true;

  Dio get _dio => ref.read(apiClientProvider).dio;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in [
      _firstName,
      _lastName,
      _bio,
      _currentPassword,
      _newPassword,
      _confirmPassword,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _loadFailed = false;
    });
    try {
      final response = await _dio.get<Map<String, dynamic>>('/users/me');
      final data = response.data?['data'];
      if (data is! Map<String, dynamic>) throw const FormatException();
      if (!mounted) return;
      setState(() {
        _savedFirst = _firstName.text = '${data['firstName'] ?? ''}';
        _savedLast = _lastName.text = '${data['lastName'] ?? ''}';
        _bio.text = data['bio'] is String ? data['bio'] as String : '';
        _email = '${data['email'] ?? ''}';
        final avatar = data['avatarUrl'];
        _avatarUrl = avatar is String && avatar.isNotEmpty ? avatar : null;
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _loadFailed = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_loadFailed) {
      return Center(
        child: TextButton(
          onPressed: _load,
          child: const Text('Could not load your profile. Tap to retry'),
        ),
      );
    }
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Settings',
          style: TextStyle(fontFamily: 'serif', fontSize: 28, color: _navy),
        ),
        const SizedBox(height: 18),
        _Card(
          title: 'Profile',
          children: [
            Row(
              children: [
                _avatar(),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$_savedFirst $_savedLast'.trim(),
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: _navy,
                        ),
                      ),
                      Text(
                        _email,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: _muted),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: _green.withValues(alpha: .1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'INSTRUCTOR',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _green,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _firstName,
              enabled: !_savingProfile,
              maxLength: 100,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'First Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _lastName,
              enabled: !_savingProfile,
              maxLength: 100,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Last Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _bio,
              enabled: !_savingProfile,
              minLines: 4,
              maxLines: 8,
              maxLength: 1000,
              decoration: const InputDecoration(
                labelText: 'Bio',
                hintText: 'Tell students about yourself...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerLeft,
              child: FilledButton(
                onPressed: _savingProfile ? null : _saveProfile,
                style: FilledButton.styleFrom(backgroundColor: _green),
                child: Text(_savingProfile ? 'Saving...' : 'Save Profile'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _Card(
          title: 'Password',
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: _savingPassword ? null : _togglePassword,
                style: TextButton.styleFrom(
                  foregroundColor: _green,
                  padding: EdgeInsets.zero,
                ),
                child: Text(_showPassword ? 'Cancel' : 'Change Password'),
              ),
            ),
            if (_showPassword) ...[
              const SizedBox(height: 8),
              _passwordField(_currentPassword, 'Current Password'),
              const SizedBox(height: 14),
              _passwordField(
                _newPassword,
                'New Password',
                helper: 'At least 10 characters',
              ),
              const SizedBox(height: 14),
              _passwordField(_confirmPassword, 'Confirm Password'),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerLeft,
                child: FilledButton(
                  onPressed: _savingPassword ? null : _changePassword,
                  style: FilledButton.styleFrom(backgroundColor: _green),
                  child: Text(
                    _savingPassword ? 'Saving...' : 'Update Password',
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _avatar() {
    final preview = _preview, url = _avatarUrl;
    final initials = (_savedFirst.isEmpty ? 'I' : _savedFirst).characters
        .take(2)
        .toString()
        .toUpperCase();
    final ImageProvider? image = preview != null
        ? MemoryImage(preview)
        : url != null
        ? NetworkImage(url)
        : null;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        CircleAvatar(
          radius: 34,
          backgroundColor: _deepNavy,
          foregroundImage: image,
          onForegroundImageError: image == null ? null : (_, _) {},
          child: Text(
            initials,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Positioned(
          right: -4,
          bottom: -4,
          child: Material(
            color: _deepNavy,
            shape: const CircleBorder(
              side: BorderSide(color: Colors.white, width: 2),
            ),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: _uploadingPhoto ? null : _pickPhoto,
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: _uploadingPhoto
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(
                        Icons.photo_camera_outlined,
                        size: 14,
                        color: Colors.white,
                        semanticLabel: 'Change photo',
                      ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _passwordField(
    TextEditingController controller,
    String label, {
    String? helper,
  }) => TextField(
    controller: controller,
    enabled: !_savingPassword,
    obscureText: _obscure,
    autocorrect: false,
    enableSuggestions: false,
    decoration: InputDecoration(
      labelText: label,
      helperText: helper,
      border: const OutlineInputBorder(),
      suffixIcon: IconButton(
        tooltip: _obscure ? 'Show password' : 'Hide password',
        onPressed: () => setState(() => _obscure = !_obscure),
        icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off),
      ),
    ),
  );

  Future<void> _pickPhoto() async {
    final XFile? file;
    try {
      file = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
      );
    } catch (_) {
      return _notify('Could not open your photos.');
    }
    if (file == null) return;
    final ext = file.name.split('.').last.toLowerCase();
    final mime = _photoTypes[ext];
    if (mime == null) {
      return _notify('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }
    final bytes = await file.readAsBytes();
    if (bytes.length > _maxPhotoBytes) {
      return _notify('Image size exceeds 5MB limit');
    }
    setState(() {
      _preview = bytes;
      _uploadingPhoto = true;
    });
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/uploads/instructor-photo',
        data: FormData.fromMap({
          'image': MultipartFile.fromBytes(
            bytes,
            filename: file.name,
            contentType: DioMediaType.parse(mime),
          ),
        }),
      );
      final data = response.data?['data'];
      final url = data is Map<String, dynamic> ? data['url'] : null;
      if (!mounted) return;
      setState(() {
        if (url is String && url.isNotEmpty) _avatarUrl = url;
        _preview = null;
      });
      _notify('Profile photo updated');
    } catch (error) {
      if (mounted) setState(() => _preview = null);
      _notify(apiErrorMessage(error, fallback: 'Failed to upload photo'));
    } finally {
      if (mounted) setState(() => _uploadingPhoto = false);
    }
  }

  Future<void> _saveProfile() async {
    final first = _firstName.text.trim(), last = _lastName.text.trim();
    if (first.isEmpty || last.isEmpty) {
      return _notify('First and last name are required');
    }
    final bio = _bio.text.trim();
    setState(() => _savingProfile = true);
    try {
      await _dio.patch<void>(
        '/users/me',
        data: {
          'firstName': first,
          'lastName': last,
          'bio': bio.isEmpty ? null : bio,
        },
      );
      if (!mounted) return;
      setState(() {
        _savedFirst = first;
        _savedLast = last;
      });
      _notify('Profile updated successfully');
      // Keep the name in the dashboard header in sync.
      await ref.read(authControllerProvider.notifier).refreshAccount();
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to update profile'));
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  void _togglePassword() => setState(() {
    _showPassword = !_showPassword;
    if (!_showPassword) _clearPasswords();
  });

  void _clearPasswords() {
    _currentPassword.clear();
    _newPassword.clear();
    _confirmPassword.clear();
    _obscure = true;
  }

  Future<void> _changePassword() async {
    if (_currentPassword.text.isEmpty) {
      return _notify('Enter your current password');
    }
    if (_newPassword.text.length < 10) {
      return _notify('Password must be at least 10 characters');
    }
    if (_newPassword.text != _confirmPassword.text) {
      return _notify('Passwords do not match');
    }
    setState(() => _savingPassword = true);
    try {
      await _dio.post<void>(
        '/auth/change-password',
        data: {
          'currentPassword': _currentPassword.text,
          'newPassword': _newPassword.text,
        },
      );
      if (!mounted) return;
      setState(() {
        _clearPasswords();
        _showPassword = false;
      });
      _notify('Password updated successfully');
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to change password'));
    } finally {
      if (mounted) setState(() => _savingPassword = false);
    }
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: _navy,
          ),
        ),
        const SizedBox(height: 14),
        ...children,
      ],
    ),
  );
}
