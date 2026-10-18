import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _ink = Color(0xff0c1f33);
const _navy = Color(0xff12304e);
const _muted = Color(0xff475569);
const _green = Color(0xff1b7a37);
const _red = Color(0xffdc2626);

const _minPassword = 10;
const _maxPassword = 128;
final _emailPattern = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

/// Error from the API split into an inline field error or a form banner.
class _FormError {
  const _FormError({this.field, this.message});
  final String? field;
  final String? message;
}

/// Routes known server messages to the field they belong to (e.g.
/// "Current password is incorrect" → the current password input).
_FormError _parseError(
  Object error, {
  required AppLocalizations l10n,
  required Map<String, String> messageToField,
  required String fallback,
}) {
  if (error is DioException) {
    if (error.response == null) {
      return _FormError(message: l10n.secServerUnreachable);
    }
    if (error.response?.statusCode == 429) {
      return _FormError(message: l10n.secTooManyAttempts);
    }
  }
  final message = apiErrorMessage(error, fallback: fallback);
  final lower = message.toLowerCase();
  for (final entry in messageToField.entries) {
    if (lower.contains(entry.key)) {
      return _FormError(field: entry.value, message: message);
    }
  }
  return _FormError(message: message);
}

class LoginSecurityPage extends ConsumerStatefulWidget {
  const LoginSecurityPage({super.key});
  @override
  ConsumerState<LoginSecurityPage> createState() => _LoginSecurityPageState();
}

class _LoginSecurityPageState extends ConsumerState<LoginSecurityPage> {
  String? _email;
  bool? _emailVerified;
  bool _loadFailed = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
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
          _loadFailed = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadFailed = true);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xfffbf9f4),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(16, 26, 16, 36),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      children: [
        Text(
          context.l10n.secTitle,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontFamily: 'serif',
            color: _navy,
          ),
        ),
        const SizedBox(height: 18),
        _EmailCard(
          email: _email,
          emailVerified: _emailVerified,
          loadFailed: _loadFailed,
          onRetryLoad: _loadUser,
          onChanged: _loadUser,
        ),
        const SizedBox(height: 14),
        _PasswordCard(email: _email),
      ],
    ),
  );
}

// ─── Email ───────────────────────────────────────────────────

class _EmailCard extends ConsumerStatefulWidget {
  const _EmailCard({
    required this.email,
    required this.emailVerified,
    required this.loadFailed,
    required this.onRetryLoad,
    required this.onChanged,
  });
  final String? email;
  final bool? emailVerified;
  final bool loadFailed;
  final VoidCallback onRetryLoad;
  final Future<void> Function() onChanged;

  @override
  ConsumerState<_EmailCard> createState() => _EmailCardState();
}

class _EmailCardState extends ConsumerState<_EmailCard> {
  final _formKey = GlobalKey<FormState>();
  final _newEmail = TextEditingController();
  final _password = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  bool _editing = false;
  bool _busy = false;
  // Server-side errors shown under the matching field.
  String? _emailServerError;
  String? _passwordServerError;
  String? _formError;
  String? _success;
  // Validate as the user types once they have tried to submit.
  AutovalidateMode _autovalidate = AutovalidateMode.disabled;

  @override
  void dispose() {
    _newEmail.dispose();
    _password.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _editing = !_editing;
      _success = null;
      _formError = null;
      _autovalidate = AutovalidateMode.disabled;
      _emailServerError = null;
      _passwordServerError = null;
      if (!_editing) {
        _newEmail.clear();
        _password.clear();
        _formKey.currentState?.reset();
      }
    });
  }

  String? _validateEmail(String? value) {
    if (_emailServerError != null) return _emailServerError;
    final email = (value ?? '').trim().toLowerCase();
    if (email.isEmpty) return context.l10n.secEmailRequired;
    if (!_emailPattern.hasMatch(email)) {
      return context.l10n.secEmailInvalid;
    }
    if (email == widget.email?.toLowerCase()) {
      return context.l10n.secEmailSame;
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (_passwordServerError != null) return _passwordServerError;
    if ((value ?? '').isEmpty) return context.l10n.secConfirmWithPassword;
    return null;
  }

  Future<void> _submit() async {
    setState(() {
      _autovalidate = AutovalidateMode.onUserInteraction;
      _formError = null;
      _emailServerError = null;
      _passwordServerError = null;
    });
    if (!_formKey.currentState!.validate()) {
      _focusFirstInvalid();
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() => _busy = true);
    try {
      await ref
          .read(apiClientProvider)
          .dio
          .post<void>(
            '/users/change-email',
            data: {
              'newEmail': _newEmail.text.trim().toLowerCase(),
              'currentPassword': _password.text,
            },
          );
      _newEmail.clear();
      _password.clear();
      await widget.onChanged();
      if (!mounted) return;
      setState(() {
        _editing = false;
        _success =
            context.l10n.secEmailUpdated;
      });
    } catch (error) {
      if (!mounted) return;
      final parsed = _parseError(
        error,
        l10n: context.l10n,
        messageToField: const {
          'current password': 'password',
          'already in use': 'email',
          'email': 'email',
        },
        fallback: context.l10n.secEmailUpdateFailed,
      );
      setState(() {
        if (parsed.field == 'password') {
          _passwordServerError = parsed.message;
          _password.clear();
        } else if (parsed.field == 'email') {
          _emailServerError = parsed.message;
        } else {
          _formError = parsed.message;
        }
      });
      _formKey.currentState!.validate();
      _focusFirstInvalid();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _focusFirstInvalid() {
    if (_validateEmail(_newEmail.text) != null) {
      _emailFocus.requestFocus();
    } else if (_validatePassword(_password.text) != null) {
      _passwordFocus.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) => _SectionCard(
    title: context.l10n.secEmail,
    child: Form(
      key: _formKey,
      autovalidateMode: _autovalidate,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (widget.loadFailed && widget.email == null)
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              context.l10n.secEmailLoadFailed,
                              style: TextStyle(color: _muted),
                            ),
                          ),
                          TextButton(
                            onPressed: widget.onRetryLoad,
                            child: Text(context.l10n.secRetry),
                          ),
                        ],
                      )
                    else
                      Text(
                        widget.email ?? context.l10n.secLoadingEmail,
                        style: const TextStyle(fontSize: 15, color: _ink),
                      ),
                    if (widget.emailVerified == false)
                      Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: Text(
                          context.l10n.secUnverified,
                          style: TextStyle(
                            color: Colors.deepOrange,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    if (widget.emailVerified == true)
                      Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: Text(
                          context.l10n.secVerified,
                          style: TextStyle(color: _green, fontSize: 12),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: _busy ? null : _toggle,
                child: Text(_editing ? context.l10n.commonCancel : context.l10n.secChangeEmail),
              ),
            ],
          ),
          if (_success != null) ...[
            const SizedBox(height: 14),
            _Banner.success(
              _success!,
              onDismiss: () => setState(() => _success = null),
            ),
          ],
          if (_editing) ...[
            const SizedBox(height: 16),
            if (_formError != null) ...[
              _Banner.error(_formError!),
              const SizedBox(height: 14),
            ],
            TextFormField(
              controller: _newEmail,
              focusNode: _emailFocus,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autocorrect: false,
              autofillHints: const [AutofillHints.email],
              enabled: !_busy,
              validator: _validateEmail,
              onChanged: (_) {
                if (_emailServerError != null) {
                  setState(() => _emailServerError = null);
                }
              },
              onFieldSubmitted: (_) => _passwordFocus.requestFocus(),
              decoration: InputDecoration(
                labelText: context.l10n.secNewEmail,
                border: OutlineInputBorder(),
                errorMaxLines: 3,
              ),
            ),
            const SizedBox(height: 14),
            _PasswordField(
              controller: _password,
              focusNode: _passwordFocus,
              label: context.l10n.secCurrentPassword,
              helperText: context.l10n.secPasswordConfirmHint,
              enabled: !_busy,
              validator: _validatePassword,
              autofillHints: const [AutofillHints.password],
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _submit(),
              onChanged: (_) {
                if (_passwordServerError != null) {
                  setState(() => _passwordServerError = null);
                }
              },
            ),
            const SizedBox(height: 16),
            _SubmitButton(busy: _busy, label: context.l10n.secSaveEmail, onPressed: _submit),
            const SizedBox(height: 10),
            Text(
              context.l10n.secEmailChangeNote,
              style: TextStyle(color: _muted, fontSize: 13, height: 1.4),
            ),
          ],
        ],
      ),
    ),
  );
}

// ─── Password ────────────────────────────────────────────────

class _PasswordCard extends ConsumerStatefulWidget {
  const _PasswordCard({required this.email});
  final String? email;

  @override
  ConsumerState<_PasswordCard> createState() => _PasswordCardState();
}

class _PasswordCardState extends ConsumerState<_PasswordCard> {
  final _formKey = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _new = TextEditingController();
  final _confirm = TextEditingController();
  final _currentFocus = FocusNode();
  final _newFocus = FocusNode();
  final _confirmFocus = FocusNode();
  bool _editing = false;
  bool _busy = false;
  String? _currentServerError;
  String? _newServerError;
  String? _formError;
  String? _success;
  // Validate as the user types once they have tried to submit.
  AutovalidateMode _autovalidate = AutovalidateMode.disabled;

  @override
  void dispose() {
    for (final c in [_current, _new, _confirm]) {
      c.dispose();
    }
    for (final f in [_currentFocus, _newFocus, _confirmFocus]) {
      f.dispose();
    }
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _editing = !_editing;
      _success = null;
      _formError = null;
      _autovalidate = AutovalidateMode.disabled;
      _currentServerError = null;
      _newServerError = null;
      if (!_editing) {
        _current.clear();
        _new.clear();
        _confirm.clear();
        _formKey.currentState?.reset();
      }
    });
  }

  String? _validateCurrent(String? value) {
    if (_currentServerError != null) return _currentServerError;
    if ((value ?? '').isEmpty) return context.l10n.secCurrentRequired;
    return null;
  }

  String? _validateNew(String? value) {
    if (_newServerError != null) return _newServerError;
    final password = value ?? '';
    if (password.isEmpty) return context.l10n.secNewRequired;
    if (password.length < _minPassword) {
      return context.l10n.secTooShort('$_minPassword', _minPassword - password.length);
    }
    if (password.length > _maxPassword) {
      return context.l10n.secTooLong('$_maxPassword');
    }
    if (password == _current.text) {
      return context.l10n.secSameAsCurrent;
    }
    return null;
  }

  String? _validateConfirm(String? value) {
    if ((value ?? '').isEmpty) return context.l10n.secConfirmRequired;
    if (value != _new.text) return context.l10n.secMismatch;
    return null;
  }

  Future<void> _submit() async {
    setState(() {
      _autovalidate = AutovalidateMode.onUserInteraction;
      _formError = null;
      _currentServerError = null;
      _newServerError = null;
    });
    if (!_formKey.currentState!.validate()) {
      _focusFirstInvalid();
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() => _busy = true);
    try {
      await ref
          .read(apiClientProvider)
          .dio
          .post<void>(
            '/auth/change-password',
            data: {'currentPassword': _current.text, 'newPassword': _new.text},
          );
      _current.clear();
      _new.clear();
      _confirm.clear();
      if (!mounted) return;
      TextInput.finishAutofillContext();
      setState(() {
        _editing = false;
        _success =
            context.l10n.secPasswordUpdated;
      });
    } catch (error) {
      if (!mounted) return;
      final parsed = _parseError(
        error,
        l10n: context.l10n,
        messageToField: const {
          'current password': 'current',
          'password': 'new',
        },
        fallback: context.l10n.secPasswordUpdateFailed,
      );
      setState(() {
        if (parsed.field == 'current') {
          _currentServerError = parsed.message;
          _current.clear();
        } else if (parsed.field == 'new') {
          _newServerError = parsed.message;
        } else {
          _formError = parsed.message;
        }
      });
      _formKey.currentState!.validate();
      _focusFirstInvalid();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _focusFirstInvalid() {
    if (_validateCurrent(_current.text) != null) {
      _currentFocus.requestFocus();
    } else if (_validateNew(_new.text) != null) {
      _newFocus.requestFocus();
    } else if (_validateConfirm(_confirm.text) != null) {
      _confirmFocus.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final longEnough = _new.text.length >= _minPassword;
    final differs = _new.text.isNotEmpty && _new.text != _current.text;
    final matches = _confirm.text.isNotEmpty && _confirm.text == _new.text;

    return _SectionCard(
      title: context.l10n.secPassword,
      child: Form(
        key: _formKey,
        autovalidateMode: _autovalidate,
        child: AutofillGroup(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      '••••••••••',
                      style: TextStyle(fontSize: 15, color: _ink),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: _busy ? null : _toggle,
                    child: Text(_editing ? context.l10n.commonCancel : context.l10n.secChangePassword),
                  ),
                ],
              ),
              if (_success != null) ...[
                const SizedBox(height: 14),
                _Banner.success(
                  _success!,
                  onDismiss: () => setState(() => _success = null),
                ),
              ],
              if (_editing) ...[
                const SizedBox(height: 16),
                if (_formError != null) ...[
                  _Banner.error(_formError!),
                  const SizedBox(height: 14),
                ],
                _PasswordField(
                  controller: _current,
                  focusNode: _currentFocus,
                  label: context.l10n.secCurrentPassword,
                  enabled: !_busy,
                  validator: _validateCurrent,
                  autofillHints: const [AutofillHints.password],
                  textInputAction: TextInputAction.next,
                  onFieldSubmitted: (_) => _newFocus.requestFocus(),
                  onChanged: (_) => setState(() => _currentServerError = null),
                ),
                const SizedBox(height: 14),
                _PasswordField(
                  controller: _new,
                  focusNode: _newFocus,
                  label: context.l10n.secNewPassword,
                  enabled: !_busy,
                  validator: _validateNew,
                  autofillHints: const [AutofillHints.newPassword],
                  textInputAction: TextInputAction.next,
                  onFieldSubmitted: (_) => _confirmFocus.requestFocus(),
                  onChanged: (_) => setState(() => _newServerError = null),
                ),
                const SizedBox(height: 8),
                _Requirement(
                  met: longEnough,
                  label: context.l10n.secReqLength('$_minPassword'),
                ),
                _Requirement(
                  met: differs,
                  label: context.l10n.secReqDifferent,
                ),
                const SizedBox(height: 14),
                _PasswordField(
                  controller: _confirm,
                  focusNode: _confirmFocus,
                  label: context.l10n.secConfirmPassword,
                  enabled: !_busy,
                  validator: _validateConfirm,
                  autofillHints: const [AutofillHints.newPassword],
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  onChanged: (_) => setState(() {}),
                ),
                if (_confirm.text.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _Requirement(
                    met: matches,
                    label: matches
                        ? context.l10n.secPasswordsMatch
                        : context.l10n.secPasswordsDontMatchYet,
                  ),
                ],
                const SizedBox(height: 16),
                _SubmitButton(
                  busy: _busy,
                  label: context.l10n.secSavePassword,
                  onPressed: _submit,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Pieces ──────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Card(
    color: Colors.white,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(14),
      side: const BorderSide(color: Color(0xffe3e8ef)),
    ),
    child: Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontFamily: 'serif',
              color: _ink,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    ),
  );
}

class _PasswordField extends StatefulWidget {
  const _PasswordField({
    required this.controller,
    required this.focusNode,
    required this.label,
    required this.validator,
    required this.autofillHints,
    required this.textInputAction,
    required this.onFieldSubmitted,
    required this.onChanged,
    this.helperText,
    this.enabled = true,
  });
  final TextEditingController controller;
  final FocusNode focusNode;
  final String label;
  final String? helperText;
  final bool enabled;
  final FormFieldValidator<String> validator;
  final Iterable<String> autofillHints;
  final TextInputAction textInputAction;
  final ValueChanged<String> onFieldSubmitted;
  final ValueChanged<String> onChanged;

  @override
  State<_PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<_PasswordField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) => TextFormField(
    controller: widget.controller,
    focusNode: widget.focusNode,
    obscureText: _obscured,
    enableSuggestions: false,
    autocorrect: false,
    enabled: widget.enabled,
    autofillHints: widget.autofillHints,
    textInputAction: widget.textInputAction,
    validator: widget.validator,
    onFieldSubmitted: widget.onFieldSubmitted,
    onChanged: widget.onChanged,
    decoration: InputDecoration(
      labelText: widget.label,
      helperText: widget.helperText,
      helperMaxLines: 2,
      errorMaxLines: 3,
      border: const OutlineInputBorder(),
      suffixIcon: IconButton(
        tooltip: _obscured ? context.l10n.authShowPassword : context.l10n.authHidePassword,
        onPressed: () => setState(() => _obscured = !_obscured),
        icon: Icon(
          _obscured ? Icons.visibility_outlined : Icons.visibility_off_outlined,
        ),
      ),
    ),
  );
}

class _Requirement extends StatelessWidget {
  const _Requirement({required this.met, required this.label});
  final bool met;
  final String label;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 4),
    child: Row(
      children: [
        Icon(
          met ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 16,
          color: met ? _green : const Color(0xff94a3b8),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            label,
            style: TextStyle(fontSize: 13, color: met ? _green : _muted),
          ),
        ),
      ],
    ),
  );
}

class _Banner extends StatelessWidget {
  const _Banner._(this.message, this.color, this.icon, this.onDismiss);

  factory _Banner.error(String message) =>
      _Banner._(message, _red, Icons.error_outline, null);

  factory _Banner.success(String message, {VoidCallback? onDismiss}) =>
      _Banner._(message, _green, Icons.check_circle_outline, onDismiss);

  final String message;
  final Color color;
  final IconData icon;
  final VoidCallback? onDismiss;

  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    child: Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .07),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: .3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 1),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 1, right: 8),
              child: Text(
                message,
                style: TextStyle(color: color, height: 1.35),
              ),
            ),
          ),
          if (onDismiss != null)
            InkWell(
              onTap: onDismiss,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.all(4),
                child: Icon(Icons.close, size: 18, color: color),
              ),
            ),
        ],
      ),
    ),
  );
}

class _SubmitButton extends StatelessWidget {
  const _SubmitButton({
    required this.busy,
    required this.label,
    required this.onPressed,
  });
  final bool busy;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 50,
    child: FilledButton(
      onPressed: busy ? null : onPressed,
      child: busy
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox.square(
                  dimension: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                ),
                SizedBox(width: 10),
                Text(context.l10n.commonSaving),
              ],
            )
          : Text(label),
    ),
  );
}
