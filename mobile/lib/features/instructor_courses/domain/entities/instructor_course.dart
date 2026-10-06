class InstructorCourse {
  const InstructorCourse({
    required this.id,
    required this.title,
    required this.summary,
    required this.description,
    required this.thumbnailUrl,
    required this.categoryId,
    required this.categoryName,
    required this.type,
    required this.level,
    required this.language,
    required this.minimumAge,
    required this.maximumAge,
    required this.status,
    required this.isDraft,
    required this.totalLessons,
    required this.studentCount,
    required this.learningOutcomes,
    required this.requirements,
  });
  final String id, title, summary, description, type, level, language, status;
  final String? thumbnailUrl, categoryId, categoryName;
  final int minimumAge, totalLessons, studentCount;
  final int? maximumAge;
  final bool isDraft;
  final List<String> learningOutcomes, requirements;
}

class InstructorCategory {
  const InstructorCategory({required this.id, required this.name});
  final String id, name;
}

class InstructorBatchOption {
  const InstructorBatchOption({required this.id, required this.name});
  final String id, name;
}

class InstructorAssignment {
  const InstructorAssignment({
    required this.id,
    required this.title,
    required this.dueDate,
    required this.status,
    required this.submissionCount,
    required this.totalMarks,
    required this.batchName,
  });
  final String id, title, status;
  final String? dueDate, batchName;
  final int submissionCount, totalMarks;
}

class InstructorSubmission {
  const InstructorSubmission({
    required this.id,
    required this.learnerName,
    required this.submittedAt,
    required this.content,
    required this.fileUrl,
    required this.marksAwarded,
    required this.feedback,
    required this.graded,
  });
  final String id, learnerName, submittedAt, content;
  final String? fileUrl, feedback;
  final num? marksAwarded;
  final bool graded;
}
