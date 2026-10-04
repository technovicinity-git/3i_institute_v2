import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/entities/course.dart';
import '../providers/courses_providers.dart';

class CourseCard extends ConsumerStatefulWidget {
  const CourseCard({required this.course, super.key});
  final Course course;

  @override
  ConsumerState<CourseCard> createState() => _CourseCardState();
}

class _CourseCardState extends ConsumerState<CourseCard> {
  late bool _wishlisted = widget.course.wishlisted;
  bool _saving = false;

  Future<void> _toggleWishlist() async {
    final profile = ref.read(activeLearnerProfileProvider);
    if (profile == null) {
      context.go('/profiles');
      return;
    }
    final next = !_wishlisted;
    setState(() => _saving = true);
    try {
      await ref.read(coursesRepositoryProvider).toggleWishlist(
            learnerProfileId: profile.id,
            courseId: widget.course.id,
            add: next,
          );
      if (mounted) setState(() => _wishlisted = next);
      ref.invalidate(coursesProvider);
      ref.invalidate(wishlistedCourseIdsProvider(profile.id));
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(error, fallback: 'Could not update wishlist.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final course = widget.course;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: () => context.push('/courses/${course.id}'),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE3E8EF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    _CourseImage(url: course.thumbnailUrl, label: 'Course preview'),
                    Positioned(
                      right: 10,
                      top: 10,
                      child: Material(
                        color: Colors.white,
                        shape: const CircleBorder(),
                        child: IconButton(
                          onPressed: _saving ? null : _toggleWishlist,
                          tooltip: _wishlisted ? 'Remove from wishlist' : 'Add to wishlist',
                          icon: _saving
                              ? const SizedBox.square(dimension: 17, child: CircularProgressIndicator(strokeWidth: 2))
                              : Icon(_wishlisted ? Icons.favorite : Icons.favorite_border, color: _wishlisted ? const Color(0xFF2D6CDF) : const Color(0xFF0C1F33), size: 20),
                        ),
                      ),
                    ),
                    if (course.enrolled)
                      const Positioned(
                        left: 10,
                        top: 10,
                        child: _CourseBadge(label: 'ENROLLED', color: Color(0xFF22A146)),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _CourseBadge(label: course.levelLabel, color: const Color(0xFF0C1F33), outlined: true),
                    const SizedBox(height: 10),
                    Text(course.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontFamily: 'serif', fontSize: 19, height: 1.25, color: Color(0xFF0C1F33))),
                    const SizedBox(height: 7),
                    Text(course.instructorName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF475569), fontSize: 14)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: Text(course.categoryName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF475569), fontSize: 12))),
                        const Icon(Icons.star, size: 15, color: Color(0xFFB8912F)),
                        const SizedBox(width: 3),
                        Text(course.averageRating?.toStringAsFixed(1) ?? 'New', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        if (course.ratingCount > 0) Text(' (${course.ratingCount})', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      ],
                    ),
                    const SizedBox(height: 9),
                    _CourseBadge(label: course.ageLabel, color: const Color(0xFF0C1F33), outlined: true, rounded: true),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CourseImage extends StatelessWidget {
  const _CourseImage({required this.url, required this.label});
  final String? url;
  final String label;

  @override
  Widget build(BuildContext context) {
    if (url == null || url!.isEmpty) {
      return Container(
        color: const Color(0xFF12304E),
        alignment: Alignment.center,
        child: const Icon(Icons.menu_book_outlined, color: Colors.white54, size: 42),
      );
    }
    return Image.network(
      url!,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        color: const Color(0xFF12304E),
        alignment: Alignment.center,
        child: const Icon(Icons.menu_book_outlined, color: Colors.white54, size: 42),
      ),
      semanticLabel: label,
    );
  }
}

class _CourseBadge extends StatelessWidget {
  const _CourseBadge({required this.label, required this.color, this.outlined = false, this.rounded = false});
  final String label;
  final Color color;
  final bool outlined;
  final bool rounded;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: outlined ? Colors.white : color,
          borderRadius: BorderRadius.circular(rounded ? 24 : 5),
          border: outlined ? Border.all(color: const Color(0xFFE3E8EF)) : null,
        ),
        child: Text(label, style: TextStyle(color: outlined ? color : Colors.white, fontSize: 9, letterSpacing: .3, fontWeight: FontWeight.w700)),
      );
}
