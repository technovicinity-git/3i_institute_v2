import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../courses/presentation/providers/courses_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/wishlist_item.dart';
import '../wishlist_providers.dart';

const _navy = Color(0xFF12304E);
const _gold = Color(0xFFB8912F);

class WishlistPage extends ConsumerStatefulWidget {
  const WishlistPage({super.key});
  @override
  ConsumerState<WishlistPage> createState() => _WishlistPageState();
}

class _WishlistPageState extends ConsumerState<WishlistPage> {
  final Set<String> _removing = {};

  Future<void> _remove(String profileId, String courseId) async {
    setState(() => _removing.add(courseId));
    try {
      await ref
          .read(wishlistRepositoryProvider)
          .remove(profileId: profileId, courseId: courseId);
      ref.invalidate(wishlistProvider(profileId));
      ref.invalidate(wishlistedCourseIdsProvider(profileId));
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Removed from wishlist')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              apiErrorMessage(error, fallback: 'Could not remove this course.'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _removing.remove(courseId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view your wishlist.'),
      );
    }
    final key = profile.id;
    final wishlistAsync = ref.watch(wishlistProvider(key));
    final categories =
        ref.watch(courseCategoriesProvider).asData?.value ?? const [];
    return wishlistAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _WishlistState(
        icon: Icons.cloud_off_outlined,
        title: 'Failed to load wishlist',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(wishlistProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (wishlist) => RefreshIndicator(
        color: _navy,
        onRefresh: () => ref.refresh(wishlistProvider(key).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 22, 18, 32),
          children: [
            Text(
              'Wishlist',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontFamily: 'serif',
                color: const Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 5),
            Text(
              '${wishlist.total} ${wishlist.total == 1 ? 'course' : 'courses'} saved for later',
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            if (wishlist.items.isEmpty)
              _WishlistState(
                icon: Icons.favorite_border,
                title: 'Your wishlist is empty',
                message: 'Save courses you like and come back to them here.',
                action: FilledButton.icon(
                  onPressed: () => context.go('/courses'),
                  icon: const Icon(Icons.explore_outlined),
                  label: const Text('Browse courses'),
                  style: FilledButton.styleFrom(backgroundColor: _navy),
                ),
              )
            else ...[
              const SizedBox(height: 18),
              for (final item in wishlist.items)
                _WishlistCourseCard(
                  item: item,
                  category: categories
                      .where(
                        (category) => category.id == item.course.categoryId,
                      )
                      .firstOrNull
                      ?.name,
                  removing: _removing.contains(item.course.id),
                  onOpen: () => context.push('/courses/${item.course.id}'),
                  onRemove: () => _remove(key, item.course.id),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _WishlistCourseCard extends StatelessWidget {
  const _WishlistCourseCard({
    required this.item,
    required this.category,
    required this.removing,
    required this.onOpen,
    required this.onRemove,
  });
  final WishlistItem item;
  final String? category;
  final bool removing;
  final VoidCallback onOpen, onRemove;

  @override
  Widget build(BuildContext context) {
    final course = item.course;
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      clipBehavior: Clip.antiAlias,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      child: InkWell(
        onTap: onOpen,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 178,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (course.thumbnailUrl?.isNotEmpty == true)
                    Image.network(
                      course.thumbnailUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const _CoursePlaceholder(),
                    )
                  else
                    const _CoursePlaceholder(),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Material(
                      color: Colors.white,
                      shape: const CircleBorder(),
                      child: IconButton(
                        tooltip: 'Remove from wishlist',
                        onPressed: removing ? null : onRemove,
                        icon: removing
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(
                                Icons.delete_outline,
                                color: Color(0xFFDC2626),
                                size: 21,
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 13, 15, 15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _Badge(label: course.levelLabel),
                      const Spacer(),
                      Icon(Icons.star, size: 16, color: _gold),
                      const SizedBox(width: 3),
                      Text(
                        course.averageRating?.toStringAsFixed(1) ?? 'New',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0C1F33),
                        ),
                      ),
                      if (course.ratingCount > 0)
                        Text(
                          ' (${course.ratingCount})',
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 9),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 19,
                      height: 1.25,
                      color: Color(0xFF0C1F33),
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    course.instructorName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF475569),
                    ),
                  ),
                  const SizedBox(height: 11),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          category ??
                              (course.format.isEmpty
                                  ? 'Course'
                                  : _formatLabel(course.format)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ),
                      Text(
                        course.ageLabel,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0C1F33),
                        ),
                      ),
                    ],
                  ),
                  if (course.summary.isNotEmpty) ...[
                    const SizedBox(height: 9),
                    Text(
                      course.summary,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.4,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  const Row(
                    children: [
                      Text(
                        'View course details',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _navy,
                        ),
                      ),
                      SizedBox(width: 5),
                      Icon(Icons.arrow_forward, size: 15, color: _navy),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CoursePlaceholder extends StatelessWidget {
  const _CoursePlaceholder();
  @override
  Widget build(BuildContext context) => const ColoredBox(
    color: _navy,
    child: Center(
      child: Icon(Icons.menu_book_outlined, size: 46, color: Colors.white54),
    ),
  );
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      label,
      style: const TextStyle(
        fontSize: 9,
        letterSpacing: .3,
        fontWeight: FontWeight.w700,
        color: Color(0xFF0C1F33),
      ),
    ),
  );
}

class _WishlistState extends StatelessWidget {
  const _WishlistState({
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title, message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 24),
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 45, color: const Color(0xFFCBD5E1)),
        const SizedBox(height: 12),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        if (action != null) ...[const SizedBox(height: 15), action!],
      ],
    ),
  );
}

String _formatLabel(String value) => switch (value) {
  'self-paced' => 'Self-paced',
  'live' => 'Live class',
  'hybrid' => 'Hybrid',
  _ => value,
};
