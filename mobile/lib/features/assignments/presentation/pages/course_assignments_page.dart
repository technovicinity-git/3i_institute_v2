import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/assignment.dart';
import '../assignments_providers.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class CourseAssignmentsPage extends ConsumerStatefulWidget {
  const CourseAssignmentsPage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<CourseAssignmentsPage> createState() =>
      _CourseAssignmentsPageState();
}

class _CourseAssignmentsPageState extends ConsumerState<CourseAssignmentsPage> {
  final _answer = TextEditingController();
  String? _selectedId;
  String? _submittingId;

  @override
  void dispose() {
    _answer.dispose();
    super.dispose();
  }

  Future<void> _submit(String profileId, LearnerAssignment assignment) async {
    final content = _answer.text.trim();
    if (content.isEmpty || _submittingId != null) return;
    setState(() => _submittingId = assignment.id);
    try {
      await ref
          .read(assignmentsRepositoryProvider)
          .submit(
            assignmentId: assignment.id,
            profileId: profileId,
            content: content,
          );
      ref.invalidate(
        courseAssignmentsProvider('${widget.courseId}|$profileId'),
      );
      if (mounted) {
        setState(() {
          _selectedId = null;
          _answer.clear();
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Assignment submitted')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              apiErrorMessage(
                error,
                fallback: 'Could not submit this assignment.',
              ),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submittingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view assignments.'),
      );
    }
    final key = '${widget.courseId}|${profile.id}';
    final assignmentsAsync = ref.watch(courseAssignmentsProvider(key));
    return assignmentsAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _AssignmentState(
        title: 'Could not load assignments',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(courseAssignmentsProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (assignments) => RefreshIndicator(
        color: _navy,
        onRefresh: () => ref.refresh(courseAssignmentsProvider(key).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
          children: [
            TextButton.icon(
              onPressed: () => context.go('/assignments'),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: const Text('Back to assignments'),
              style: TextButton.styleFrom(
                alignment: Alignment.centerLeft,
                foregroundColor: const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Assignments',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontFamily: 'serif',
                color: const Color(0xFF0C1F33),
              ),
            ),
            const SizedBox(height: 5),
            Text(
              '${assignments.length} assignment${assignments.length == 1 ? '' : 's'} for this course',
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 17),
            if (assignments.isEmpty)
              const _AssignmentState(
                title: 'No assignments yet',
                message: 'There are no assignments for this course yet.',
                icon: Icons.assignment_outlined,
              )
            else
              ...assignments.map(
                (assignment) => _AssignmentCard(
                  assignment: assignment,
                  selected: _selectedId == assignment.id,
                  answerController: _answer,
                  isSubmitting: _submittingId == assignment.id,
                  anySubmitting: _submittingId != null,
                  onSelect: () => setState(() {
                    _selectedId = assignment.id;
                    _answer.clear();
                  }),
                  onCancel: () => setState(() {
                    _selectedId = null;
                    _answer.clear();
                  }),
                  onSubmit: () => _submit(profile.id, assignment),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AssignmentCard extends StatelessWidget {
  const _AssignmentCard({
    required this.assignment,
    required this.selected,
    required this.answerController,
    required this.isSubmitting,
    required this.anySubmitting,
    required this.onSelect,
    required this.onCancel,
    required this.onSubmit,
  });
  final LearnerAssignment assignment;
  final bool selected, isSubmitting, anySubmitting;
  final TextEditingController answerController;
  final VoidCallback onSelect, onCancel, onSubmit;

  @override
  Widget build(BuildContext context) {
    final submission = assignment.submission;
    final due = assignment.dueDate == null
        ? 'No deadline'
        : DateFormat('MMM d, y').format(assignment.dueDate!);
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 13),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    assignment.title,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0C1F33),
                    ),
                  ),
                ),
                if (assignment.submitted)
                  _StatusChip(graded: submission?.graded ?? false),
              ],
            ),
            if (assignment.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                assignment.description,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.45,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              spacing: 15,
              runSpacing: 7,
              children: [
                _Meta(icon: Icons.schedule, label: 'Due: $due'),
                _Meta(
                  icon: Icons.grade_outlined,
                  label: '${assignment.totalMarks} marks',
                ),
              ],
            ),
            const SizedBox(height: 13),
            if (assignment.submitted && submission != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F6F0),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'YOUR SUBMISSION',
                      style: TextStyle(
                        fontSize: 10,
                        letterSpacing: .5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 7),
                    SelectableText(
                      submission.content,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.45,
                        color: Color(0xFF0C1F33),
                      ),
                    ),
                    if (submission.fileUrl?.isNotEmpty == true) ...[
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () =>
                            _openSubmissionFile(context, submission.fileUrl!),
                        icon: const Icon(Icons.attach_file, size: 16),
                        label: const Text('Open attached file'),
                      ),
                    ],
                    if (submission.graded) ...[
                      const Divider(height: 20),
                      Text(
                        'Marks: ${_number(submission.marksAwarded ?? 0)}/${assignment.totalMarks}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: _green,
                        ),
                      ),
                      if (submission.feedback?.isNotEmpty == true) ...[
                        const SizedBox(height: 5),
                        Text(
                          'Feedback: ${submission.feedback}',
                          style: const TextStyle(
                            fontSize: 13,
                            height: 1.4,
                            color: Color(0xFF0C1F33),
                          ),
                        ),
                      ],
                    ],
                  ],
                ),
              )
            else if (selected) ...[
              TextField(
                controller: answerController,
                minLines: 4,
                maxLines: 8,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Write your answer...',
                  alignLabelWithHint: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 9,
                runSpacing: 8,
                children: [
                  OutlinedButton(
                    onPressed: anySubmitting ? null : onCancel,
                    child: const Text('Cancel'),
                  ),
                  ValueListenableBuilder<TextEditingValue>(
                    valueListenable: answerController,
                    builder: (context, value, child) => FilledButton.icon(
                      onPressed: value.text.trim().isEmpty || anySubmitting
                          ? null
                          : onSubmit,
                      icon: isSubmitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.send_outlined, size: 17),
                      label: Text(
                        isSubmitting ? 'Submitting…' : 'Submit assignment',
                      ),
                      style: FilledButton.styleFrom(backgroundColor: _green),
                    ),
                  ),
                ],
              ),
            ] else
              FilledButton.icon(
                onPressed: onSelect,
                icon: const Icon(Icons.edit_note, size: 18),
                label: const Text('Submit assignment'),
                style: FilledButton.styleFrom(backgroundColor: _navy),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.graded});
  final bool graded;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: graded ? const Color(0xFFEAF7EE) : const Color(0xFFFFF8E8),
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      graded ? 'GRADED' : 'SUBMITTED',
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w700,
        color: graded ? _green : const Color(0xFF9A6700),
      ),
    ),
  );
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.label});
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 15, color: const Color(0xFF64748B)),
      const SizedBox(width: 5),
      Text(
        label,
        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
      ),
    ],
  );
}

class _AssignmentState extends StatelessWidget {
  const _AssignmentState({
    required this.title,
    required this.message,
    this.icon = Icons.cloud_off_outlined,
    this.action,
  });
  final String title, message;
  final IconData icon;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 16),
    padding: const EdgeInsets.all(25),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 40, color: const Color(0xFFCBD5E1)),
        const SizedBox(height: 11),
        Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        if (action != null) ...[const SizedBox(height: 12), action!],
      ],
    ),
  );
}

Future<void> _openSubmissionFile(BuildContext context, String value) async {
  final uri = Uri.tryParse(value);
  if (uri != null &&
      await launchUrl(uri, mode: LaunchMode.externalApplication)) {
    return;
  }
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Could not open the attached file.')),
    );
  }
}

String _number(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);
