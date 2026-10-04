import 'package:flutter/material.dart';

abstract final class AppTheme {
  static const _green = Color(0xFF287A50);
  static const _ink = Color(0xFF172820);
  static const _surface = Color(0xFFF8FAF8);

  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: _green,
      brightness: Brightness.light,
      surface: _surface,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: _surface,
      textTheme: Typography.material2021().black.apply(
            bodyColor: _ink,
            displayColor: _ink,
          ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE3E8E3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE3E8E3)),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
