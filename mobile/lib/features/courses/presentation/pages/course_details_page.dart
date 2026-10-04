import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/course_details.dart';
import '../providers/courses_providers.dart';
import '../widgets/course_card.dart';
import '../widgets/landing_layout.dart';

class CourseDetailsPage extends ConsumerWidget {
  const CourseDetailsPage({required this.courseId, super.key});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileId = ref.watch(activeLearnerProfileProvider)?.id ?? '';
    final detailKey = '$courseId|$profileId';
    final course = ref.watch(courseDetailsProvider(detailKey));
    return ColoredBox(
      color: const Color(0xFFFBF9F4),
      child: course.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _CourseDetailsError(onRetry: () => ref.invalidate(courseDetailsProvider(detailKey))),
        data: (data) => _CourseDetailBody(course: data, detailKey: detailKey),
      ),
    );
  }
}

class _CourseDetailBody extends StatelessWidget {
  const _CourseDetailBody({required this.course, required this.detailKey});
  final CourseDetails course;
  final String detailKey;

  @override
  Widget build(BuildContext context) => CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _CourseHero(course: course)),
          SliverToBoxAdapter(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(18, 22, 18, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _EnrollmentCard(course: course, detailKey: detailKey),
                      if (course.learningOutcomes.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _SectionCard(
                          title: 'What you’ll learn',
                          child: Column(
                            children: course.learningOutcomes.map((item) => _CheckRow(text: item)).toList(),
                          ),
                        ),
                      ],
                      if (course.requirements.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _SectionTitle(title: 'Requirements'),
                        ...course.requirements.map((item) => _BulletRow(text: item)),
                      ],
                      if (course.aboutParagraphs.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _SectionTitle(title: 'About this course'),
                        ...course.aboutParagraphs.map((paragraph) => Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: Text(paragraph, style: const TextStyle(fontSize: 15, height: 1.65, color: Color(0xFF0C1F33))),
                            )),
                      ],
                      if (course.batches.isNotEmpty && course.type == 'ONLINE_CLASS') ...[
                        const SizedBox(height: 28),
                        _BatchesSection(batches: course.batches),
                      ],
                      if (course.curriculum.isNotEmpty && course.type == 'REGULAR') ...[
                        const SizedBox(height: 28),
                        _CurriculumSection(course: course),
                      ],
                      if (course.reviews.isNotEmpty || course.ratingCount > 0) ...[
                        const SizedBox(height: 28),
                        _ReviewsSection(course: course),
                      ],
                      if (course.faq.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _FaqSection(faq: course.faq),
                      ],
                      const SizedBox(height: 32),
                      _MembershipBand(),
                      if (course.relatedCourses.isNotEmpty) ...[
                        const SizedBox(height: 32),
                        _SectionTitle(title: 'Students also took'),
                        SizedBox(
                          height: 390,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: course.relatedCourses.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 14),
                            itemBuilder: (context, index) => SizedBox(
                              width: 280,
                              child: CourseCard(course: course.relatedCourses[index]),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      _ShareCourseButton(course: course),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: LandingFooter()),
        ],
      );
}

class _CourseHero extends StatelessWidget {
  const _CourseHero({required this.course});
  final CourseDetails course;

  @override
  Widget build(BuildContext context) => Stack(
        children: [
          SizedBox(
            height: 390,
            width: double.infinity,
            child: course.coverImageUrl == null || course.coverImageUrl!.isEmpty
                ? const ColoredBox(color: Color(0xFF12304E))
                : Image.network(
                    course.coverImageUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const ColoredBox(color: Color(0xFF12304E)),
                  ),
          ),
          const Positioned.fill(child: ColoredBox(color: Color(0xBB12304E))),
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 28, 22, 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Courses  ›  ${course.categoryName}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFFDCB958), fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                    _CourseLabel(label: _levelName(course.level)),
                    const SizedBox(height: 12),
                    Text(course.title, style: const TextStyle(fontFamily: 'serif', color: Colors.white, fontSize: 32, height: 1.16, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 12),
                    Text(course.summary, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5)),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 16,
                      runSpacing: 8,
                      children: [
                        _HeroMeta(icon: Icons.star, label: '${course.averageRating?.toStringAsFixed(1) ?? '0.0'} · ${course.ratingCount} reviews', gold: true),
                        _HeroMeta(icon: Icons.menu_book_outlined, label: '${course.totalLessons} lessons'),
                        _HeroMeta(icon: Icons.access_time, label: '${course.durationWeeks} weeks'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _InstructorAvatar(url: course.instructorAvatarUrl, name: course.instructorName, size: 38),
                        const SizedBox(width: 10),
                        Expanded(child: Text.rich(TextSpan(style: const TextStyle(color: Colors.white, fontSize: 13), children: [const TextSpan(text: 'Instructed by '), TextSpan(text: course.instructorName, style: const TextStyle(fontWeight: FontWeight.w700))]))),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
}

class _EnrollmentCard extends ConsumerStatefulWidget {
  const _EnrollmentCard({required this.course, required this.detailKey});
  final CourseDetails course;
  final String detailKey;

  @override
  ConsumerState<_EnrollmentCard> createState() => _EnrollmentCardState();
}

class _EnrollmentCardState extends ConsumerState<_EnrollmentCard> {
  bool _enrolling = false;

  Future<void> _enrol({String? batchId}) async {
    final profile = ref.read(activeLearnerProfileProvider);
    if (profile == null) {
      context.go('/profiles');
      return;
    }
    setState(() => _enrolling = true);
    try {
      final waitlisted = await ref.read(coursesRepositoryProvider).enrol(
            learnerProfileId: profile.id,
            courseId: widget.course.id,
            batchId: batchId,
          );
      ref.invalidate(courseDetailsProvider(widget.detailKey));
      ref.invalidate(coursesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(waitlisted ? 'Added to waitlist.' : 'Enrolled successfully.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(apiErrorMessage(error, fallback: 'Enrolment failed.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  Future<void> _chooseBatch() async {
    if (widget.course.batches.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('There are no available batches right now.')));
      return;
    }
    final batch = await showModalBottomSheet<CourseBatch>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _BatchPicker(batches: widget.course.batches),
    );
    if (batch != null) await _enrol(batchId: batch.id);
  }

  @override
  Widget build(BuildContext context) {
    final course = widget.course;
    final wishlisted = ref.watch(wishlistedCourseIdsProvider(ref.watch(activeLearnerProfileProvider)?.id ?? ''));
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE3E8EF))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('INCLUDED WITH MEMBERSHIP', style: TextStyle(color: Color(0xFFB8912F), fontWeight: FontWeight.w700, letterSpacing: .8, fontSize: 11)),
          const SizedBox(height: 8),
          Text(course.enrolled ? 'You’re enrolled' : 'Start learning today', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: const Color(0xFF0C1F33))),
          const SizedBox(height: 14),
          if (course.enrolled)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: const Color(0xFFEAF6ED), borderRadius: BorderRadius.circular(10)),
              child: const Row(children: [Icon(Icons.check_circle, color: Color(0xFF22A146)), SizedBox(width: 8), Text('Enrolled', style: TextStyle(color: Color(0xFF1D8F3D), fontWeight: FontWeight.w700))]),
            )
          else
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: _enrolling ? null : course.type == 'REGULAR' ? () => _enrol() : _chooseBatch,
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF22A146)),
                child: _enrolling
                    ? const SizedBox.square(dimension: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(course.type == 'REGULAR' ? 'Enrol now' : 'Choose a class batch'),
              ),
            ),
          if (!course.enrolled) ...[
            const SizedBox(height: 10),
            _WishlistButton(courseId: course.id, wishlistState: wishlisted),
          ],
          const SizedBox(height: 10),
          const Center(child: Text('One membership. Every course.', style: TextStyle(color: Color(0xFF12304E), fontSize: 13, decoration: TextDecoration.underline))),
          const Divider(height: 28),
          if (course.whatIncluded.isNotEmpty) ...[
            const Text('What’s included', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0C1F33))),
            const SizedBox(height: 8),
            ...course.whatIncluded.map((item) => _CheckRow(text: item, compact: true)),
            const Divider(height: 24),
          ],
          Wrap(
            spacing: 16,
            runSpacing: 10,
            children: [
              _SmallMeta(icon: Icons.calendar_month_outlined, label: '${course.durationWeeks} weeks'),
              _SmallMeta(icon: Icons.workspace_premium_outlined, label: _levelName(course.level)),
              _SmallMeta(icon: Icons.language, label: _languageName(course.language)),
            ],
          ),
        ],
      ),
    );
  }
}

class _WishlistButton extends ConsumerStatefulWidget {
  const _WishlistButton({required this.courseId, required this.wishlistState});
  final String courseId;
  final AsyncValue<Set<String>> wishlistState;

  @override
  ConsumerState<_WishlistButton> createState() => _WishlistButtonState();
}

class _WishlistButtonState extends ConsumerState<_WishlistButton> {
  bool _saving = false;

  Future<void> _toggle() async {
    final profile = ref.read(activeLearnerProfileProvider);
    if (profile == null) {
      context.go('/profiles');
      return;
    }
    final add = !(widget.wishlistState.asData?.value.contains(widget.courseId) ?? false);
    setState(() => _saving = true);
    try {
      await ref.read(coursesRepositoryProvider).toggleWishlist(learnerProfileId: profile.id, courseId: widget.courseId, add: add);
      ref.invalidate(wishlistedCourseIdsProvider(profile.id));
      ref.invalidate(coursesProvider);
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(error, fallback: 'Could not update wishlist.'))));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final liked = widget.wishlistState.asData?.value.contains(widget.courseId) ?? false;
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: OutlinedButton.icon(
        onPressed: _saving ? null : _toggle,
        icon: _saving ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Icon(liked ? Icons.favorite : Icons.favorite_border),
        label: Text(liked ? 'Remove from wishlist' : 'Add to wishlist'),
      ),
    );
  }
}

class _BatchPicker extends StatelessWidget {
  const _BatchPicker({required this.batches});
  final List<CourseBatch> batches;

  @override
  Widget build(BuildContext context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Choose your batch', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              const Text('Select a class group to continue with enrolment.', style: TextStyle(color: Color(0xFF64748B))),
              const SizedBox(height: 14),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: batches.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final batch = batches[index];
                    return Card(
                      color: Colors.white,
                      child: ListTile(
                        leading: const CircleAvatar(backgroundColor: Color(0xFFF8F3E8), child: Icon(Icons.calendar_month, color: Color(0xFFB8912F))),
                        title: Text(batch.name),
                        subtitle: Text('${batch.sessions.length} ${batch.sessions.length == 1 ? 'session' : 'sessions'} · ${batch.capacity} seats · ${batch.status == 'ACTIVE' ? 'Active' : 'Upcoming'}'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => Navigator.of(context).pop(batch),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
}

class _BatchesSection extends StatelessWidget {
  const _BatchesSection({required this.batches});
  final List<CourseBatch> batches;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle(title: 'Choose your batch'),
          const Padding(padding: EdgeInsets.only(bottom: 12), child: Text('View the schedule and sessions for each available batch.', style: TextStyle(color: Color(0xFF64748B)))),
          ...batches.map((batch) => Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(side: const BorderSide(color: Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
                child: ExpansionTile(
                  leading: const Icon(Icons.calendar_month_outlined, color: Color(0xFFB8912F)),
                  title: Text(batch.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${batch.sessions.length} sessions · ${batch.status == 'ACTIVE' ? 'Active' : 'Upcoming'}'),
                  children: batch.sessions.map((session) => ListTile(
                        leading: const CircleAvatar(radius: 16, child: Icon(Icons.play_lesson_outlined, size: 17)),
                        title: Text(session.title),
                        subtitle: Text(_formatSession(session.scheduledAt, session.durationMinutes)),
                        trailing: session.notes == null ? null : IconButton(
                          tooltip: 'Session notes',
                          icon: const Icon(Icons.info_outline),
                          onPressed: () => showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(session.title), content: Text(session.notes!), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))])),
                        ),
                      )).toList(),
                ),
              )),
        ],
      );
}

class _CurriculumSection extends StatelessWidget {
  const _CurriculumSection({required this.course});
  final CourseDetails course;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('DETAILED SYLLABUS', style: TextStyle(fontWeight: FontWeight.w700, letterSpacing: .8, color: Color(0xFF0C1F33), fontSize: 12)),
          const SizedBox(height: 4),
          const _SectionTitle(title: 'Curriculum'),
          ...course.curriculum.map((module) => Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(side: const BorderSide(color: Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(10)),
                child: ExpansionTile(
                  title: Text('${module.number}  ${module.title}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${module.lessons.length} ${module.lessons.length == 1 ? 'lesson' : 'lessons'} · ${module.duration}'),
                  children: module.lessons.map((lesson) => ListTile(
                        leading: const Icon(Icons.play_circle_outline, color: Color(0xFF64748B)),
                        title: Text(lesson.title),
                        subtitle: lesson.description == null ? null : Text(lesson.description!, maxLines: 3, overflow: TextOverflow.ellipsis),
                        trailing: Text(lesson.duration, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      )).toList(),
                ),
              )),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
            child: Row(
              children: [
                _InstructorAvatar(url: course.instructorAvatarUrl, name: course.instructorName, size: 54),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('YOUR INSTRUCTOR', style: TextStyle(color: Color(0xFFB8912F), fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: .7)),
                      Text(course.instructorName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17, color: Color(0xFF0C1F33))),
                      if (course.instructorBio.isNotEmpty) Text(course.instructorBio, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.4)),
                      Text('${course.instructorCourseCount} courses · ${course.instructorStudentCount} learners', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      );
}

class _ReviewsSection extends StatelessWidget {
  const _ReviewsSection({required this.course});
  final CourseDetails course;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle(title: 'Learner reviews'),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [const Icon(Icons.star, color: Color(0xFFB8912F)), const SizedBox(width: 5), Text(course.averageRating?.toStringAsFixed(1) ?? 'New', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)), const SizedBox(width: 8), Text('${course.ratingCount} reviews', style: const TextStyle(color: Color(0xFF64748B)))]),
                if (course.reviews.isEmpty) const Padding(padding: EdgeInsets.only(top: 10), child: Text('No reviews yet.', style: TextStyle(color: Color(0xFF64748B)))),
                ...course.reviews.map((review) => Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [Expanded(child: Text(review.name, style: const TextStyle(fontWeight: FontWeight.w700))), Text(_formatReviewDate(review.date), style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11))]),
                          const SizedBox(height: 4),
                          Row(children: List.generate(5, (index) => Icon(Icons.star, size: 14, color: index < review.rating ? const Color(0xFFB8912F) : const Color(0xFFE2E8F0)))),
                          if (review.text.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 5), child: Text(review.text, style: const TextStyle(height: 1.45))),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],
      );
}

class _FaqSection extends StatelessWidget {
  const _FaqSection({required this.faq});
  final List<CourseFaq> faq;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle(title: 'Common questions'),
          ...faq.map((item) => Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(side: const BorderSide(color: Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(10)),
                child: ExpansionTile(title: Text(item.question, style: const TextStyle(fontFamily: 'serif', fontSize: 16)), children: [Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: Align(alignment: Alignment.centerLeft, child: Text(item.answer, style: const TextStyle(height: 1.5, color: Color(0xFF475569)))))]),
              )),
        ],
      );
}

class _MembershipBand extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(color: const Color(0xFFF8F6F0), border: Border.all(color: const Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('MEMBERSHIP', style: TextStyle(fontSize: 11, letterSpacing: .8, fontWeight: FontWeight.w700, color: Color(0xFFB8912F))),
            const SizedBox(height: 6),
            Text('One membership. Every course.', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontFamily: 'serif', color: const Color(0xFF0C1F33))),
            const SizedBox(height: 18),
            const _MembershipBenefit(icon: Icons.menu_book_outlined, title: 'All courses', body: 'Learn across Islamic studies, languages, sciences and more.'),
            const _MembershipBenefit(icon: Icons.groups_outlined, title: 'Live classes included', body: 'Join interactive seminars and live Q&As.'),
            const _MembershipBenefit(icon: Icons.school_outlined, title: 'Certificates included', body: 'Earn certificates as you complete your learning.'),
          ],
        ),
      );
}

class _MembershipBenefit extends StatelessWidget {
  const _MembershipBenefit({required this.icon, required this.title, required this.body});
  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFFB8912F), size: 22),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0C1F33))), Text(body, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.4))])),
          ],
        ),
      );
}

class _ShareCourseButton extends StatelessWidget {
  const _ShareCourseButton({required this.course});
  final CourseDetails course;

  @override
  Widget build(BuildContext context) => Align(
        alignment: Alignment.centerLeft,
        child: TextButton.icon(
          onPressed: () async {
            await Clipboard.setData(ClipboardData(text: '3i course: ${course.title}'));
            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Course title copied.')));
          },
          icon: const Icon(Icons.share_outlined, size: 18),
          label: const Text('Share this course'),
        ),
      );
}

class _CourseDetailsError extends StatelessWidget {
  const _CourseDetailsError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Text('Failed to load course.'), const SizedBox(height: 10), OutlinedButton(onPressed: onRetry, child: const Text('Try again')), TextButton(onPressed: () => context.go('/courses'), child: const Text('Back to courses'))])));
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontFamily: 'serif', color: const Color(0xFF0C1F33))), const SizedBox(height: 12), child]),
      );
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});
  final String title;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontFamily: 'serif', color: const Color(0xFF0C1F33))));
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({required this.text, this.compact = false});
  final String text;
  final bool compact;
  @override
  Widget build(BuildContext context) => Padding(padding: EdgeInsets.only(bottom: compact ? 7 : 10), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Icon(Icons.check_circle_outline, size: 17, color: Color(0xFF22A146)), const SizedBox(width: 8), Expanded(child: Text(text, style: TextStyle(fontSize: compact ? 13 : 14, height: 1.4, color: const Color(0xFF0C1F33))))]));
}

class _BulletRow extends StatelessWidget {
  const _BulletRow({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('•  ', style: TextStyle(fontWeight: FontWeight.w700)), Expanded(child: Text(text, style: const TextStyle(height: 1.4)))]));
}

class _InstructorAvatar extends StatelessWidget {
  const _InstructorAvatar({required this.url, required this.name, required this.size});
  final String? url;
  final String name;
  final double size;

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().split(RegExp(r'\s+')).where((part) => part.isNotEmpty).take(2).map((part) => part.substring(0, 1)).join().toUpperCase();
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: const Color(0xFF64748B),
      foregroundImage: url == null || url!.isEmpty ? null : NetworkImage(url!),
      onForegroundImageError: (_, __) {},
      child: Text(initials, style: TextStyle(color: Colors.white, fontSize: size * .31, fontWeight: FontWeight.w700)),
    );
  }
}

class _CourseLabel extends StatelessWidget {
  const _CourseLabel({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => DecoratedBox(decoration: BoxDecoration(color: const Color(0x22B8912F), borderRadius: BorderRadius.circular(5)), child: Padding(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5), child: Text(label, style: const TextStyle(color: Color(0xFFDCB958), fontSize: 11, fontWeight: FontWeight.w700))));
}

class _HeroMeta extends StatelessWidget {
  const _HeroMeta({required this.icon, required this.label, this.gold = false});
  final IconData icon;
  final String label;
  final bool gold;
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 15, color: gold ? const Color(0xFFDCB958) : Colors.white), const SizedBox(width: 5), Text(label, style: const TextStyle(color: Colors.white, fontSize: 12))]);
}

class _SmallMeta extends StatelessWidget {
  const _SmallMeta({required this.icon, required this.label});
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 15, color: const Color(0xFF64748B)), const SizedBox(width: 5), Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))]);
}

String _levelName(String level) => switch (level.toLowerCase()) {
      '1' || 'beginner' => 'Beginner',
      '2' || 'intermediate' => 'Intermediate',
      '3' || 'advanced' => 'Advanced',
      _ => level.isEmpty ? 'All levels' : level,
    };

String _languageName(String code) => const {'en': 'English', 'bn': 'Bangla', 'hi': 'Hindi', 'ur': 'Urdu', 'ar': 'Arabic'}[code] ?? code.toUpperCase();

String _formatSession(DateTime? date, int minutes) => date == null
    ? '$minutes min'
    : '${DateFormat('EEE, MMM d, y · h:mm a').format(date)} · $minutes min';

String _formatReviewDate(DateTime? date) => date == null ? '' : DateFormat.yMMMd().format(date);
