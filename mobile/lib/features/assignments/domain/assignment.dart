class LearnerAssignment {
  const LearnerAssignment({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.title,
    required this.description,
    required this.dueDate,
    required this.totalMarks,
    required this.status,
    required this.submitted,
    required this.submission,
  });

  final String id, courseId, courseTitle, title, description, status;
  final DateTime? dueDate;
  final int totalMarks;
  final bool submitted;
  final AssignmentSubmission? submission;

  factory LearnerAssignment.fromJson(Map<String, dynamic> j) =>
      LearnerAssignment(
        id: _str(j['id']),
        courseId: _str(j['courseId']),
        courseTitle: _str(j['courseTitle']),
        title: _str(j['title'], 'Assignment'),
        description: _str(j['description']),
        dueDate: DateTime.tryParse(_str(j['dueDate']))?.toLocal(),
        totalMarks: _int(j['totalMarks']),
        status: _str(j['status']),
        submitted: j['submitted'] as bool? ?? false,
        submission: j['submission'] is Map
            ? AssignmentSubmission.fromJson(
                Map<String, dynamic>.from(j['submission'] as Map),
              )
            : null,
      );
}

class AssignmentSubmission {
  const AssignmentSubmission({
    required this.id,
    required this.content,
    required this.fileUrl,
    required this.marksAwarded,
    required this.feedback,
    required this.graded,
    required this.submittedAt,
  });
  final String id, content;
  final String? fileUrl, feedback;
  final double? marksAwarded;
  final bool graded;
  final DateTime? submittedAt;
  factory AssignmentSubmission.fromJson(Map<String, dynamic> j) =>
      AssignmentSubmission(
        id: _str(j['id']),
        content: _str(j['content']),
        fileUrl: j['fileUrl'] as String?,
        marksAwarded: (j['marksAwarded'] as num?)?.toDouble(),
        feedback: j['feedback'] as String?,
        graded: j['graded'] as bool? ?? false,
        submittedAt: DateTime.tryParse(_str(j['submittedAt']))?.toLocal(),
      );
}

String _str(dynamic value, [String fallback = '']) =>
    value is String && value.isNotEmpty ? value : fallback;
int _int(dynamic value) =>
    value is num ? value.round() : int.tryParse('$value') ?? 0;
