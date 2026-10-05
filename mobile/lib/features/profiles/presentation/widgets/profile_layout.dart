import 'package:flutter/material.dart';

class ProfileLayout extends StatelessWidget {
  const ProfileLayout({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: Image.asset('assets/images/logo-icon.png', width: 42, height: 42, semanticLabel: '3i International Islamic Institute logo'),
        ),
        body: child,
      );
}
