import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';

class LoginSecurityPage extends ConsumerStatefulWidget {
  const LoginSecurityPage({super.key});
  @override
  ConsumerState<LoginSecurityPage> createState() => _LoginSecurityPageState();
}

class _LoginSecurityPageState extends ConsumerState<LoginSecurityPage> {
  final _newEmail = TextEditingController();
  final _emailPassword = TextEditingController();
  final _currentPassword = TextEditingController();
  final _newPassword = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _editEmail = false;
  bool _editPassword = false;
  bool _emailBusy = false;
  bool _passwordBusy = false;
  String? _email;
  bool? _emailVerified;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  @override
  void dispose() {
    _newEmail.dispose();
    _emailPassword.dispose();
    _currentPassword.dispose();
    _newPassword.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  Future<void> _loadUser() async {
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .get<Map<String, dynamic>>('/users/me');
      final payload = response.data?['data'];
      if (payload is Map<String, dynamic> && mounted) {
        setState(() {
          _email = payload['email'] as String?;
          _emailVerified = payload['emailVerified'] as bool?;
        });
      }
    } catch (_) {}
  }

  void _message(String value) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(value)));

  Future<void> _changeEmail() async {
    final email = _newEmail.text.trim();
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email) ||
        _emailPassword.text.isEmpty) {
      _message('Enter a valid email and your current password.');
      return;
    }
    setState(() => _emailBusy = true);
    try {
      await ref
          .read(apiClientProvider)
          .dio
          .post(
            '/users/change-email',
            data: {'newEmail': email, 'currentPassword': _emailPassword.text},
          );
      _newEmail.clear();
      _emailPassword.clear();
      await _loadUser();
      if (mounted) {
        setState(() => _editEmail = false);
        _message('Email updated. Please verify your new email.');
      }
    } catch (error) {
      if (mounted) _message('Could not update email: $error');
    } finally {
      if (mounted) setState(() => _emailBusy = false);
    }
  }

  Future<void> _changePassword() async {
    if (_currentPassword.text.isEmpty ||
        _newPassword.text.length < 10 ||
        _newPassword.text != _confirmPassword.text) {
      _message(
        'Enter your current password, a new password of at least 10 characters, and matching confirmation.',
      );
      return;
    }
    setState(() => _passwordBusy = true);
    try {
      await ref
          .read(apiClientProvider)
          .dio
          .post(
            '/auth/change-password',
            data: {
              'currentPassword': _currentPassword.text,
              'newPassword': _newPassword.text,
            },
          );
      _currentPassword.clear();
      _newPassword.clear();
      _confirmPassword.clear();
      if (mounted) {
        setState(() => _editPassword = false);
        _message('Password updated successfully.');
      }
    } catch (error) {
      if (mounted) _message('Could not update password: $error');
    } finally {
      if (mounted) setState(() => _passwordBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xfffbf9f4),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(20, 26, 20, 36),
      children: [
        Text(
          'Login & security',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontFamily: 'serif',
            color: const Color(0xff12304e),
          ),
        ),
        const SizedBox(height: 18),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Email',
                  style: Theme.of(
                    context,
                  ).textTheme.headlineSmall?.copyWith(fontFamily: 'serif'),
                ),
                const SizedBox(height: 12),
                Text(_email ?? 'Loading account email…'),
                if (_emailVerified == false)
                  const Padding(
                    padding: EdgeInsets.only(top: 5),
                    child: Text(
                      'Unverified — check your email for a verification link',
                      style: TextStyle(color: Colors.deepOrange, fontSize: 12),
                    ),
                  ),
                if (_emailVerified == true)
                  const Padding(
                    padding: EdgeInsets.only(top: 5),
                    child: Text(
                      'Verified ✓',
                      style: TextStyle(color: Color(0xff287a50), fontSize: 12),
                    ),
                  ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => setState(() => _editEmail = !_editEmail),
                    child: Text(_editEmail ? 'Cancel' : 'Change email'),
                  ),
                ),
                if (_editEmail) ...[
                  TextField(
                    controller: _newEmail,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(
                      labelText: 'New email',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _emailPassword,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Current password',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _emailBusy ? null : _changeEmail,
                    child: Text(_emailBusy ? 'Saving…' : 'Save email'),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'You’ll need to verify your new email before it takes effect.',
                    style: TextStyle(color: Color(0xff475569)),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Password',
                  style: Theme.of(
                    context,
                  ).textTheme.headlineSmall?.copyWith(fontFamily: 'serif'),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () =>
                        setState(() => _editPassword = !_editPassword),
                    child: Text(_editPassword ? 'Cancel' : 'Change password'),
                  ),
                ),
                if (_editPassword) ...[
                  TextField(
                    controller: _currentPassword,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Current password',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _newPassword,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'New password',
                      helperText: 'At least 10 characters',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _confirmPassword,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Confirm new password',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _passwordBusy ? null : _changePassword,
                    child: Text(_passwordBusy ? 'Saving…' : 'Save password'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    ),
  );
}
