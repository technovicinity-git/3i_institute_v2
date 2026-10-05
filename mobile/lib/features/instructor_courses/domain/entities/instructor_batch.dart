class InstructorBatch {
  const InstructorBatch({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.name,
    required this.capacity,
    required this.status,
    required this.enrolmentCount,
    required this.sessions,
  });
  final String id, courseId, courseTitle, name, status;
  final int capacity, enrolmentCount;
  final List<InstructorBatchSession> sessions;
}

class InstructorBatchSession {
  const InstructorBatchSession({
    required this.id,
    required this.title,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.meetingLink,
    required this.notes,
  });
  final String id, title, scheduledAt;
  final int durationMinutes;
  final String? meetingLink, notes;
}

class InstructorExistingSession {
  const InstructorExistingSession({
    required this.id,
    required this.title,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.batchName,
    required this.courseTitle,
  });
  final String id, title, scheduledAt, batchName, courseTitle;
  final int durationMinutes;
}
