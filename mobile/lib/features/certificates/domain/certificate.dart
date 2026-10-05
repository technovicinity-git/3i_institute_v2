class LearnerCertificate {
  const LearnerCertificate({
    required this.id,
    required this.type,
    required this.verificationCode,
    required this.learnerName,
    required this.courseTitle,
    required this.issuerName,
    required this.issuedAt,
    required this.examId,
    required this.courseId,
    required this.details,
  });

  final String id, type, verificationCode, learnerName, courseTitle;
  final String? issuerName, examId, courseId;
  final DateTime? issuedAt;
  final CertificateDetails? details;

  factory LearnerCertificate.fromJson(Map<String, dynamic> json) =>
      LearnerCertificate(
        id: _string(json['id']),
        type: _string(json['type'], fallback: 'COMPLETION'),
        verificationCode: _string(json['verificationCode']),
        learnerName: _string(json['learnerNameSnapshot'], fallback: 'Learner'),
        courseTitle: _string(json['courseTitleSnapshot'], fallback: 'Course'),
        issuerName: json['issuerName'] as String?,
        issuedAt: DateTime.tryParse(_string(json['issuedAt'])),
        examId: json['examId'] as String?,
        courseId: json['courseId'] as String?,
        details: json['details'] is Map
            ? CertificateDetails.fromJson(
                Map<String, dynamic>.from(json['details'] as Map),
              )
            : null,
      );
}

class CertificateDetails {
  const CertificateDetails({
    this.progress,
    this.completedLessons,
    this.totalLessons,
    this.score,
    this.totalMarks = 0,
    this.examTitle,
    this.attemptNumber,
    this.passed,
    this.graded,
  });
  final int? progress, completedLessons, totalLessons, attemptNumber;
  final double? score;
  final int totalMarks;
  final String? examTitle;
  final bool? passed, graded;

  factory CertificateDetails.fromJson(Map<String, dynamic> j) =>
      CertificateDetails(
        progress: _nullableInt(j['progress']),
        completedLessons: _nullableInt(j['completedLessons']),
        totalLessons: _nullableInt(j['totalLessons']),
        score: (j['score'] as num?)?.toDouble(),
        totalMarks: _int(j['totalMarks']),
        examTitle: j['examTitle'] as String?,
        attemptNumber: _nullableInt(j['attemptNumber']),
        passed: j['passed'] as bool?,
        graded: j['graded'] as bool?,
      );
}

String _string(dynamic value, {String fallback = ''}) =>
    value is String && value.isNotEmpty ? value : fallback;
int _int(dynamic value) =>
    value is num ? value.round() : int.tryParse('$value') ?? 0;
int? _nullableInt(dynamic value) => value == null ? null : _int(value);
