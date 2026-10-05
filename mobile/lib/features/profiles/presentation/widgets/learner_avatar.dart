import 'package:flutter/material.dart';

/// Displays a learner photo when available and initials when it is missing or
/// cannot be loaded.
class LearnerAvatar extends StatelessWidget {
  const LearnerAvatar({
    required this.initials,
    this.imageUrl,
    this.radius = 34,
    this.backgroundColor = const Color(0xFFEAF1EC),
    this.foregroundColor = const Color(0xFF287A50),
    super.key,
  });

  final String initials;
  final String? imageUrl;
  final double radius;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    final url = imageUrl?.trim();
    return Semantics(
      label: 'Learner avatar${initials.isEmpty ? '' : ', $initials'}',
      image: true,
      child: CircleAvatar(
        radius: radius,
        backgroundColor: backgroundColor,
        child: ClipOval(
          child: url == null || url.isEmpty
              ? _Initials(
                  initials: initials,
                  color: foregroundColor,
                  radius: radius,
                )
              : Image.network(
                  url,
                  width: radius * 2,
                  height: radius * 2,
                  fit: BoxFit.cover,
                  frameBuilder:
                      (context, child, frame, wasSynchronouslyLoaded) {
                        if (wasSynchronouslyLoaded || frame != null) {
                          return child;
                        }
                        return _Initials(
                          initials: initials,
                          color: foregroundColor,
                          radius: radius,
                        );
                      },
                  errorBuilder: (context, error, stackTrace) => _Initials(
                    initials: initials,
                    color: foregroundColor,
                    radius: radius,
                  ),
                ),
        ),
      ),
    );
  }
}

class _Initials extends StatelessWidget {
  const _Initials({
    required this.initials,
    required this.color,
    required this.radius,
  });

  final String initials;
  final Color color;
  final double radius;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: radius * 2,
    height: radius * 2,
    child: Center(
      child: Text(
        initials,
        maxLines: 1,
        style: TextStyle(
          color: color,
          fontSize: radius * .65,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
  );
}
