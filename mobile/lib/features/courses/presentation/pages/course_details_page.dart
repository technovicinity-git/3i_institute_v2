import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../../core/share/course_share.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/entities/course_details.dart';
import '../providers/courses_providers.dart';
import '../widgets/course_card.dart';
import '../widgets/landing_layout.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../../core/format/date_format.dart';

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
                          title: context.l10n.detailLearn,
                          child: Column(
                            children: course.learningOutcomes.map((item) => _CheckRow(text: item)).toList(),
                          ),
                        ),
                      ],
                      if (course.requirements.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _SectionTitle(title: context.l10n.detailRequirements),
                        ...course.requirements.map((item) => _BulletRow(text: item)),
                      ],
                      if (course.aboutParagraphs.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _SectionTitle(title: context.l10n.detailAbout),
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
                      if (course.reviews.isNotEmpty || course.ratingCount > 0 || course.enrolled) ...[
                        const SizedBox(height: 28),
                        _ReviewsSection(course: course, detailKey: detailKey),
                      ],
                      if (course.faq.isNotEmpty) ...[
                        const SizedBox(height: 28),
                        _FaqSection(faq: course.faq),
                      ],
                      const SizedBox(height: 32),
                      _MembershipBand(),
                      if (course.relatedCourses.isNotEmpty) ...[
                        const SizedBox(height: 32),
                        _SectionTitle(title: context.l10n.detailStudentsAlsoTook),
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
                    Text(context.l10n.detailBreadcrumb(course.categoryName), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFFDCB958), fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                    _CourseLabel(label: _levelName(context.l10n, course.level)),
                    const SizedBox(height: 12),
                    Text(course.title, style: const TextStyle(fontFamily: 'serif', color: Colors.white, fontSize: 32, height: 1.16, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 12),
                    Text(course.summary, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5)),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 16,
                      runSpacing: 8,
                      children: [
                        _HeroMeta(icon: Icons.star, label: context.l10n.detailRatingMeta(course.averageRating?.toStringAsFixed(1) ?? '0.0', course.ratingCount), gold: true),
                        // _HeroMeta(icon: Icons.menu_book_outlined, label: '${course.totalLessons} lessons'),
                        // _HeroMeta(icon: Icons.access_time, label: '${course.durationWeeks} weeks'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _InstructorAvatar(url: course.instructorAvatarUrl, name: course.instructorName, size: 38),
                        const SizedBox(width: 10),
                        Expanded(child: Text.rich(TextSpan(style: const TextStyle(color: Colors.white, fontSize: 13), children: [TextSpan(text: context.l10n.detailInstructedBy), TextSpan(text: course.instructorName, style: const TextStyle(fontWeight: FontWeight.w700))]))),
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
          SnackBar(content: Text(waitlisted ? context.l10n.enrolWaitlisted : context.l10n.enrolSuccess)),
        );
        if (!waitlisted && batchId != null) context.go('/online-classes/$batchId');
      }
    } catch (error) {
      if (mounted) {
        final needsSubscription = apiErrorCode(error) == 'SUBSCRIPTION_REQUIRED';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(apiErrorMessage(error, fallback: context.l10n.enrolFailed)),
            action: needsSubscription
                ? SnackBarAction(label: context.l10n.enrolSubscribe, onPressed: () => context.push('/subscription'))
                : null,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  Future<void> _chooseBatch() async {
    if (widget.course.batches.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.l10n.enrolNoBatches)));
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
    final profile = ref.watch(activeLearnerProfileProvider);
    final wishlisted = ref.watch(wishlistedCourseIdsProvider(profile?.id ?? ''));
    final eligibility = profile == null ? null : course.eligibility;
    final blockedByAge = eligibility != null && !eligibility.ageEligible;
    final needsSubscription = eligibility != null && !blockedByAge && !eligibility.isSubscribed;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE3E8EF))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.l10n.cardIncluded, style: const TextStyle(color: Color(0xFFB8912F), fontWeight: FontWeight.w700, letterSpacing: .8, fontSize: 11)),
          const SizedBox(height: 8),
          Text(course.enrolled ? context.l10n.cardEnrolledTitle : context.l10n.cardStartToday, style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: const Color(0xFF0C1F33))),
          const SizedBox(height: 14),
          if (course.enrolled)
            _EnrolledActions(course: course)
          else if (blockedByAge) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFFED7AA)),
              ),
              child: Text(
                context.l10n.cardNotAvailable(profile!.displayName, eligibility.ageMessage ?? '', '${eligibility.age}'),
                style: const TextStyle(color: Color(0xFF9A3412), fontSize: 13),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(onPressed: null, child: Text(context.l10n.cardEnrolNow)),
            ),
          ] else if (needsSubscription) ...[
            Text(
              context.l10n.cardNeedsSubscription(profile!.displayName),
              style: const TextStyle(color: Color(0xFF475569), fontSize: 13),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: () => context.push('/subscription'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF22A146)),
                child: Text(context.l10n.cardSubscribeToEnrol),
              ),
            ),
          ] else
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: _enrolling ? null : course.type == 'REGULAR' ? () => _enrol() : _chooseBatch,
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF22A146)),
                child: _enrolling
                    ? const SizedBox.square(dimension: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(course.type == 'REGULAR' ? context.l10n.cardEnrolNow : context.l10n.cardChooseBatch),
              ),
            ),
          if (!course.enrolled) ...[
            const SizedBox(height: 10),
            _WishlistButton(courseId: course.id, wishlistState: wishlisted),
          ],
          const SizedBox(height: 10),
          Center(child: Text(course.ageLabel, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13))),
          const SizedBox(height: 6),
          Center(
            child: TextButton(
              onPressed: () => context.push('/subscription'),
              child: Text(context.l10n.cardManageSubscription, style: const TextStyle(color: Color(0xFF12304E), fontSize: 13, decoration: TextDecoration.underline)),
            ),
          ),
          const Divider(height: 28),
          if (course.whatIncluded.isNotEmpty) ...[
            Text(context.l10n.cardWhatsIncluded, style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0C1F33))),
            const SizedBox(height: 8),
            ...course.whatIncluded.map((item) => _CheckRow(text: item, compact: true)),
            const Divider(height: 24),
          ],
          Wrap(
            spacing: 16,
            runSpacing: 10,
            children: [
              // _SmallMeta(icon: Icons.calendar_month_outlined, label: '${course.durationWeeks} weeks'),
              _SmallMeta(icon: Icons.workspace_premium_outlined, label: _levelName(context.l10n, course.level)),
              _SmallMeta(icon: Icons.language, label: languageNames[course.language] ?? course.language.toUpperCase()),
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(error, fallback: context.l10n.wishlistUpdateFailed))));
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
        label: Text(liked ? context.l10n.wishlistRemove : context.l10n.wishlistAdd),
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
              Text(context.l10n.batchChoose, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(context.l10n.batchChooseBody, style: const TextStyle(color: Color(0xFF64748B))),
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
                        subtitle: Text('${context.l10n.batchSessions(batch.sessions.length)} · ${context.l10n.batchSeats(batch.capacity)} · ${batch.status == 'ACTIVE' ? context.l10n.batchActive : context.l10n.batchUpcoming}'),
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
          _SectionTitle(title: context.l10n.batchChoose),
          Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(context.l10n.batchSubtitleBody, style: const TextStyle(color: Color(0xFF64748B)))),
          ...batches.map((batch) => Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(side: const BorderSide(color: Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
                child: ExpansionTile(
                  leading: const Icon(Icons.calendar_month_outlined, color: Color(0xFFB8912F)),
                  title: Text(batch.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${context.l10n.batchSessions(batch.sessions.length)} · ${batch.status == 'ACTIVE' ? context.l10n.batchActive : context.l10n.batchUpcoming}'),
                  children: batch.sessions.map((session) => ListTile(
                        leading: const CircleAvatar(radius: 16, child: Icon(Icons.play_lesson_outlined, size: 17)),
                        title: Text(session.title),
                        subtitle: Text(_formatSession(context.l10n, session.scheduledAt, session.durationMinutes)),
                        trailing: session.notes == null ? null : IconButton(
                          tooltip: context.l10n.batchSessionNotes,
                          icon: const Icon(Icons.info_outline),
                          onPressed: () => showDialog<void>(context: context, builder: (context) => AlertDialog(title: Text(session.title), content: Text(session.notes!), actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(context.l10n.commonClose))])),
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
          Text(context.l10n.detailSyllabus, style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: .8, color: Color(0xFF0C1F33), fontSize: 12)),
          const SizedBox(height: 4),
          _SectionTitle(title: context.l10n.detailCurriculum),
          ...course.curriculum.map((module) => Card(
                color: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(side: const BorderSide(color: Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(10)),
                child: ExpansionTile(
                  title: Text('${module.number}  ${module.title}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${context.l10n.detailLessons(module.lessons.length)} · ${module.duration}'),
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
                      Text(context.l10n.detailYourInstructor, style: const TextStyle(color: Color(0xFFB8912F), fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: .7)),
                      Text(course.instructorName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17, color: Color(0xFF0C1F33))),
                      if (course.instructorBio.isNotEmpty) Text(course.instructorBio, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.4)),
                      Text(context.l10n.detailInstructorStats(course.instructorCourseCount, course.instructorStudentCount), style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      );
}

class _ReviewsSection extends ConsumerWidget {
  const _ReviewsSection({required this.course, required this.detailKey});
  final CourseDetails course;
  final String detailKey;

  @override
  Widget build(BuildContext context, WidgetRef ref) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(title: context.l10n.detailReviews),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE3E8EF)), borderRadius: BorderRadius.circular(14)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [const Icon(Icons.star, color: Color(0xFFB8912F)), const SizedBox(width: 5), Text(course.averageRating?.toStringAsFixed(1) ?? context.l10n.commonNewRating, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)), const SizedBox(width: 8), Text(context.l10n.detailReviewCount(course.ratingCount), style: const TextStyle(color: Color(0xFF64748B)))]),
                if (course.enrolled) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: const Color(0xFFF9F6F0), borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(context.l10n.detailEnrolledShare, style: TextStyle(fontSize: 13, color: Color(0xFF0C1F33))),
                        ),
                        const SizedBox(width: 10),
                        FilledButton.icon(
                          onPressed: () => _openRateSheet(context, ref),
                          style: FilledButton.styleFrom(backgroundColor: const Color(0xFF12304E), visualDensity: VisualDensity.compact),
                          icon: const Icon(Icons.star_outline, size: 18),
                          label: Text(context.l10n.detailRateReview),
                        ),
                      ],
                    ),
                  ),
                ],
                if (course.reviews.isEmpty) Padding(padding: const EdgeInsets.only(top: 10), child: Text(context.l10n.detailNoReviews, style: const TextStyle(color: Color(0xFF64748B)))),
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

  Future<void> _openRateSheet(BuildContext context, WidgetRef ref) async {
    final profile = ref.read(activeLearnerProfileProvider);
    if (profile == null) {
      context.go('/profiles');
      return;
    }
    final account = ref.read(authControllerProvider).asData?.value;
    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _RateReviewSheet(
        courseId: course.id,
        courseTitle: course.title,
        learnerProfileId: profile.id,
        learnerName: profile.displayName,
        accountName: account?.fullName.isNotEmpty == true ? account!.fullName : context.l10n.reviewParent,
      ),
    );
    if (submitted == true) {
      ref.invalidate(courseDetailsProvider(detailKey));
      ref.invalidate(coursesProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.l10n.reviewThanks)));
      }
    }
  }
}

class _RateReviewSheet extends ConsumerStatefulWidget {
  const _RateReviewSheet({
    required this.courseId,
    required this.courseTitle,
    required this.learnerProfileId,
    required this.learnerName,
    required this.accountName,
  });
  final String courseId, courseTitle, learnerProfileId, learnerName, accountName;

  @override
  ConsumerState<_RateReviewSheet> createState() => _RateReviewSheetState();
}

class _RateReviewSheetState extends ConsumerState<_RateReviewSheet> {
  final _review = TextEditingController();
  int _rating = 0;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _review.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0) {
      setState(() => _error = context.l10n.reviewSelectRating);
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(coursesRepositoryProvider).rateCourse(
            courseId: widget.courseId,
            learnerProfileId: widget.learnerProfileId,
            rating: _rating,
            review: _review.text.trim(),
          );
      if (mounted) Navigator.of(context).pop(true);
    } catch (error) {
      if (mounted) {
        setState(() {
          _submitting = false;
          _error = apiErrorMessage(error, fallback: context.l10n.reviewSubmitFailed);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.viewInsetsOf(context).bottom + 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(context.l10n.reviewTitle, style: const TextStyle(fontFamily: 'serif', fontSize: 26, color: Color(0xFF0C1F33))),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(color: const Color(0xFFF9F6F0), borderRadius: BorderRadius.circular(10)),
                child: Text(context.l10n.reviewSubmittingAs(widget.learnerName), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF0C1F33))),
              ),
              const SizedBox(height: 12),
              Text(widget.courseTitle, style: const TextStyle(color: Color(0xFF475569))),
              const SizedBox(height: 16),
              Text(context.l10n.reviewYourRating, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0C1F33))),
              const SizedBox(height: 4),
              Row(
                children: [
                  for (var star = 1; star <= 5; star++)
                    IconButton(
                      onPressed: _submitting
                          ? null
                          : () => setState(() {
                                _rating = star;
                                _error = null;
                              }),
                      tooltip: context.l10n.reviewStars(star),
                      icon: Icon(
                        star <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 36,
                        color: star <= _rating ? const Color(0xFFB8912F) : const Color(0xFFCBD5E1),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(context.l10n.reviewWrite, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0C1F33))),
              const SizedBox(height: 6),
              TextField(
                controller: _review,
                enabled: !_submitting,
                maxLines: 4,
                maxLength: 2000,
                decoration: InputDecoration(
                  hintText: context.l10n.reviewHint,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              if (_error != null) ...[
                Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
                const SizedBox(height: 10),
              ],
              SizedBox(
                height: 50,
                child: FilledButton(
                  onPressed: _submitting ? null : _submit,
                  style: FilledButton.styleFrom(backgroundColor: const Color(0xFF22A146)),
                  child: _submitting
                      ? const SizedBox.square(dimension: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(context.l10n.reviewSubmit),
                ),
              ),
            ],
          ),
        ),
      );
}

/// What an enrolled learner can do next (mirrors the web course page).
class _EnrolledActions extends StatelessWidget {
  const _EnrolledActions({required this.course});
  final CourseDetails course;

  static const _green = Color(0xFF22A146);
  static const _navy = Color(0xFF12304E);

  @override
  Widget build(BuildContext context) {
    final batchId = course.enrolmentBatchId;
    // Resume the last watched lesson unless the course is finished.
    final lessonId = course.continueLessonId == null
        ? null
        : course.lastWatchedLessonId != null && !course.isCompleted
            ? course.lastWatchedLessonId
            : course.continueLessonId;

    Widget primary(String label, IconData icon, VoidCallback? onPressed, {Color color = _green}) => SizedBox(
          width: double.infinity,
          height: 50,
          child: FilledButton.icon(
            onPressed: onPressed,
            style: FilledButton.styleFrom(backgroundColor: color),
            icon: Icon(icon, size: 20),
            label: Text(label),
          ),
        );

    return Column(
      children: [
        if (course.type == 'REGULAR')
          lessonId != null
              ? primary(
                  course.isCompleted
                      ? context.l10n.cardReviewCourse
                      : course.lastWatchedLessonId != null
                          ? context.l10n.cardContinue
                          : context.l10n.cardStart,
                  course.isCompleted ? Icons.replay : Icons.play_arrow_rounded,
                  () => context.push('/my-courses/${course.id}/lessons/$lessonId'),
                )
              : SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: FilledButton(onPressed: null, child: Text(context.l10n.cardComingSoon)),
                )
        else ...[
          if (batchId != null) ...[
            primary(context.l10n.cardClassSchedule, Icons.calendar_month_outlined, () => context.push('/online-classes/$batchId')),
            const SizedBox(height: 10),
          ],
          primary(
            context.l10n.cardChatRoom,
            Icons.chat_bubble_outline,
            () => context.push(Uri(path: '/chat', queryParameters: {
              'courseId': course.id,
              'courseTitle': course.title,
              'batchId': ?batchId,
              'batchName': context.l10n.cardYourBatch,
            }).toString()),
            color: _navy,
          ),
        ],
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            onPressed: () => context.go('/dashboard'),
            style: OutlinedButton.styleFrom(foregroundColor: _navy, side: const BorderSide(color: _navy)),
            child: Text(context.l10n.cardDashboard),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, size: 18, color: _green),
            SizedBox(width: 6),
            Text(context.l10n.cardEnrolled, style: TextStyle(color: Color(0xFF1D8F3D), fontWeight: FontWeight.w700)),
          ],
        ),
      ],
    );
  }
}

class _FaqSection extends StatelessWidget {
  const _FaqSection({required this.faq});
  final List<CourseFaq> faq;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(title: context.l10n.detailFaq),
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
            Text(context.l10n.membershipTitle, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontFamily: 'serif', color: const Color(0xFF0C1F33))),
            const SizedBox(height: 18),
            _MembershipBenefit(icon: Icons.menu_book_outlined, title: context.l10n.membershipAllCourses, body: context.l10n.membershipAllCoursesBody),
            _MembershipBenefit(icon: Icons.groups_outlined, title: context.l10n.membershipLive, body: context.l10n.membershipLiveBody),
            _MembershipBenefit(icon: Icons.school_outlined, title: context.l10n.membershipCertificates, body: context.l10n.membershipCertificatesBody),
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
          onPressed: () {
            // Anchor the share sheet to the button (required on iPad).
            final box = context.findRenderObject() as RenderBox?;
            shareCourse(
              context,
              courseId: course.id,
              title: course.title,
              anchor: box == null ? null : box.localToGlobal(Offset.zero) & box.size,
            );
          },
          icon: const Icon(Icons.share_outlined, size: 18),
          label: Text(context.l10n.detailShare),
        ),
      );
}

class _CourseDetailsError extends StatelessWidget {
  const _CourseDetailsError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [Text(context.l10n.detailLoadFailed), const SizedBox(height: 10), OutlinedButton(onPressed: onRetry, child: Text(context.l10n.commonTryAgain)), TextButton(onPressed: () => context.go('/courses'), child: Text(context.l10n.commonBackToCourses))])));
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

String _levelName(AppLocalizations l10n, String level) => switch (level.toLowerCase()) {
      '1' || 'beginner' => l10n.levelBeginner,
      '2' || 'intermediate' => l10n.levelIntermediate,
      '3' || 'advanced' => l10n.levelAdvanced,
      _ => level.isEmpty ? l10n.levelAll : level,
    };

// Teaching language, named in its own script (see languageNames).

String _formatSession(AppLocalizations l10n, DateTime? date, int minutes) => date == null
    ? l10n.commonMinutes(minutes)
    : '${formatDate(date, DateStyle.weekdayDateTime)} · ${l10n.commonMinutes(minutes)}';

String _formatReviewDate(DateTime? date) => date == null ? '' : formatDate(date, DateStyle.date);
