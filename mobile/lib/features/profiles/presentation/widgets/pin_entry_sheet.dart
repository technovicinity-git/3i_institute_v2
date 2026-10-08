import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../providers/learner_profiles_providers.dart';
import 'learner_avatar.dart';

const _navy = Color(0xFF12304E);
const _ink = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _error = Color(0xFFDC2626);

const _pinLength = 4;
const _maxAttempts = 5;
const _cooldown = Duration(seconds: 30);

enum PinCheckResult { valid, incorrect, failed }

/// Shows the PIN pad for [profile]. Resolves to true once [verify] accepts
/// the PIN, or false/null if the user cancels.
Future<bool?> showPinEntrySheet(
  BuildContext context, {
  required LearnerProfile profile,
  required Future<PinCheckResult> Function(String pin) verify,
}) => showModalBottomSheet<bool>(
  context: context,
  isScrollControlled: true,
  useSafeArea: true,
  showDragHandle: true,
  backgroundColor: Colors.white,
  shape: const RoundedRectangleBorder(
    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
  ),
  builder: (_) => PinEntrySheet(profile: profile, verify: verify),
);

class PinEntrySheet extends StatefulWidget {
  const PinEntrySheet({required this.profile, required this.verify, super.key});
  final LearnerProfile profile;
  final Future<PinCheckResult> Function(String pin) verify;

  @override
  State<PinEntrySheet> createState() => _PinEntrySheetState();
}

class _PinEntrySheetState extends State<PinEntrySheet>
    with SingleTickerProviderStateMixin {
  late final _shake = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 420),
  );
  final _focus = FocusNode();
  String _pin = '';
  bool _verifying = false;
  String? _message;
  int _failures = 0;
  DateTime? _lockedUntil;
  Timer? _ticker;

  bool get _locked =>
      _lockedUntil != null && DateTime.now().isBefore(_lockedUntil!);

  int get _secondsLeft => _lockedUntil == null
      ? 0
      : math.max(0, _lockedUntil!.difference(DateTime.now()).inSeconds + 1);

  @override
  void dispose() {
    _shake.dispose();
    _focus.dispose();
    _ticker?.cancel();
    super.dispose();
  }

  void _press(String digit) {
    if (_verifying || _locked || _pin.length >= _pinLength) return;
    HapticFeedback.selectionClick();
    setState(() {
      _pin += digit;
      _message = null;
    });
    if (_pin.length == _pinLength) _submit();
  }

  void _backspace({bool clear = false}) {
    if (_verifying || _pin.isEmpty) return;
    HapticFeedback.selectionClick();
    setState(() {
      _pin = clear ? '' : _pin.substring(0, _pin.length - 1);
      _message = null;
    });
  }

  Future<void> _submit() async {
    setState(() => _verifying = true);
    final result = await widget.verify(_pin);
    if (!mounted) return;

    switch (result) {
      case PinCheckResult.valid:
        HapticFeedback.lightImpact();
        Navigator.of(context).pop(true);
        return;
      case PinCheckResult.incorrect:
        HapticFeedback.heavyImpact();
        _failures++;
        final remaining = _maxAttempts - _failures;
        setState(() {
          _verifying = false;
          _pin = '';
          if (remaining <= 0) {
            _failures = 0;
            _startCooldown();
            _message = null;
          } else {
            _message = remaining <= 2
                ? 'Incorrect PIN. $remaining ${remaining == 1 ? 'try' : 'tries'} left.'
                : 'Incorrect PIN. Try again.';
          }
        });
        _shake.forward(from: 0);
      case PinCheckResult.failed:
        setState(() {
          _verifying = false;
          _pin = '';
          _message = "Couldn't check the PIN. Check your connection.";
        });
    }
  }

  void _startCooldown() {
    _lockedUntil = DateTime.now().add(_cooldown);
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (!_locked) {
        timer.cancel();
        setState(() => _lockedUntil = null);
      } else {
        setState(() {});
      }
    });
  }

  KeyEventResult _onKey(FocusNode _, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }
    final key = event.logicalKey;
    if (key == LogicalKeyboardKey.backspace) {
      _backspace();
      return KeyEventResult.handled;
    }
    final char = event.character;
    if (char != null && RegExp(r'^[0-9]$').hasMatch(char)) {
      _press(char);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    final status = _locked
        ? 'Too many attempts. Try again in ${_secondsLeft}s.'
        : _message;
    final statusIsError = _locked || (_message != null);

    return Focus(
      focusNode: _focus,
      autofocus: true,
      onKeyEvent: _onKey,
      // Scrolls on short screens (small phones, landscape).
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            LearnerAvatar(
              imageUrl: profile.avatarUrl,
              initials: profile.initials,
              radius: 34,
            ),
            const SizedBox(height: 12),
            Text(
              profile.displayName,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 22,
                color: _ink,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Enter your 4-digit PIN',
              style: TextStyle(color: _muted),
            ),
            const SizedBox(height: 24),
            AnimatedBuilder(
              animation: _shake,
              builder: (context, child) => Transform.translate(
                offset: Offset(
                  math.sin(_shake.value * math.pi * 6) *
                      10 *
                      (1 - _shake.value),
                  0,
                ),
                child: child,
              ),
              child: _PinDots(
                filled: _pin.length,
                error: _message != null && !_verifying && _pin.isEmpty,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 40,
              child: Center(
                child: _verifying
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: _navy,
                        ),
                      )
                    : status == null
                    ? const SizedBox.shrink()
                    : Semantics(
                        liveRegion: true,
                        child: Text(
                          status,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: statusIsError ? _error : _muted,
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 8),
            _Keypad(
              enabled: !_verifying && !_locked,
              canDelete: _pin.isNotEmpty && !_verifying,
              onDigit: _press,
              onDelete: _backspace,
              onClear: () => _backspace(clear: true),
            ),
            const SizedBox(height: 12),
            const Text(
              'Forgot your PIN? Ask the account holder to reset it from '
              'Manage profiles.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: _muted),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _verifying
                  ? null
                  : () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PinDots extends StatelessWidget {
  const _PinDots({required this.filled, required this.error});
  final int filled;
  final bool error;

  @override
  Widget build(BuildContext context) => Semantics(
    label: 'PIN, $filled of $_pinLength digits entered',
    child: ExcludeSemantics(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (var i = 0; i < _pinLength; i++)
            AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              curve: Curves.easeOut,
              margin: const EdgeInsets.symmetric(horizontal: 10),
              width: i < filled ? 18 : 16,
              height: i < filled ? 18 : 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i < filled ? _navy : Colors.transparent,
                border: Border.all(
                  color: error ? _error : (i < filled ? _navy : _border),
                  width: 2,
                ),
              ),
            ),
        ],
      ),
    ),
  );
}

class _Keypad extends StatelessWidget {
  const _Keypad({
    required this.enabled,
    required this.canDelete,
    required this.onDigit,
    required this.onDelete,
    required this.onClear,
  });
  final bool enabled, canDelete;
  final ValueChanged<String> onDigit;
  final VoidCallback onDelete, onClear;

  @override
  Widget build(BuildContext context) {
    Widget digit(String value) => _KeypadButton(
      label: value,
      semanticLabel: value,
      onTap: enabled ? () => onDigit(value) : null,
    );

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        children: [
          for (final row in const [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ])
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [for (final value in row) digit(value)],
            ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              const SizedBox(width: _KeypadButton.size),
              digit('0'),
              _KeypadButton(
                icon: Icons.backspace_outlined,
                semanticLabel: 'Delete',
                onTap: canDelete ? onDelete : null,
                onLongPress: canDelete ? onClear : null,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _KeypadButton extends StatelessWidget {
  const _KeypadButton({
    required this.semanticLabel,
    this.label,
    this.icon,
    this.onTap,
    this.onLongPress,
  });
  static const size = 72.0;
  final String? label;
  final IconData? icon;
  final String semanticLabel;
  final VoidCallback? onTap, onLongPress;

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Semantics(
        button: true,
        enabled: enabled,
        label: semanticLabel,
        excludeSemantics: true,
        child: Material(
          color: label != null ? const Color(0xFFF5F7FA) : Colors.transparent,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onTap,
            onLongPress: onLongPress,
            child: SizedBox(
              width: size,
              height: size,
              child: Center(
                child: label != null
                    ? Text(
                        label!,
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w500,
                          color: enabled ? _ink : _muted.withValues(alpha: .4),
                        ),
                      )
                    : Icon(
                        icon,
                        color: enabled ? _ink : _muted.withValues(alpha: .4),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
