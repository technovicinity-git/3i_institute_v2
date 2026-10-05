class EnrolledCourse {
  const EnrolledCourse({
    required this.id,
    required this.courseId,
    required this.title,
    required this.type,
    required this.instructorName,
    required this.level,
    required this.progress,
    required this.completedMaterials,
    required this.totalMaterials,
    required this.continueLessonId,
    required this.thumbnailUrl,
    required this.isCompleted,
    this.batchId,
    this.batchName,
    this.nextSession,
  });
  final String id, courseId, title, type, instructorName, level;
  final int progress, completedMaterials, totalMaterials;
  final String? continueLessonId, thumbnailUrl;
  final String? batchId, batchName;
  final NextClassSession? nextSession;
  final bool isCompleted;
  factory EnrolledCourse.fromJson(Map<String, dynamic> json) => EnrolledCourse(
    id: json['id'] as String? ?? '',
    courseId: json['courseId'] as String? ?? '',
    title: json['title'] as String? ?? 'Course',
    type: json['type'] as String? ?? '',
    instructorName:
        (json['instructor'] as Map?)?['name'] as String? ?? 'Instructor',
    level: json['level']?.toString() ?? '',
    progress: _int(json['progress']),
    completedMaterials: _int(json['completedMaterials']),
    totalMaterials: _int(json['totalMaterials']),
    continueLessonId: json['continueLessonId'] as String?,
    thumbnailUrl: json['thumbnailUrl'] as String?,
    isCompleted: json['isCompleted'] as bool? ?? false,
    batchId: json['batchId'] as String?,
    batchName: json['batchName'] as String?,
    nextSession: json['nextSession'] is Map<String, dynamic>
        ? NextClassSession.fromJson(json['nextSession'] as Map<String, dynamic>)
        : null,
  );
}

class NextClassSession {
  const NextClassSession({required this.title, required this.scheduledAt});
  final String title, scheduledAt;
  factory NextClassSession.fromJson(Map<String, dynamic> json) =>
      NextClassSession(
        title: json['title'] as String? ?? 'Live class',
        scheduledAt: json['scheduledAt'] as String? ?? '',
      );
}

class LiveSession {
  const LiveSession({
    required this.id,
    required this.title,
    required this.scheduledAt,
    required this.durationMinutes,
    this.meetingLink,
  });
  final String id, title, scheduledAt;
  final int durationMinutes;
  final String? meetingLink;
  factory LiveSession.fromJson(Map<String, dynamic> json) => LiveSession(
    id: json['id'] as String? ?? '',
    title: json['title'] as String? ?? 'Live class',
    scheduledAt: json['scheduledAt'] as String? ?? '',
    durationMinutes: _int(json['durationMinutes']),
    meetingLink: json['meetingLink'] as String?,
  );
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.courseId,
    required this.senderId,
    required this.displayName,
    required this.message,
    required this.createdAt,
    this.batchId,
    this.learnerProfileId,
    this.avatarUrl,
    this.isInstructor = false,
  });
  final String id, courseId, senderId, displayName, message, createdAt;
  final String? batchId, learnerProfileId, avatarUrl;
  final bool isInstructor;
  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'] as String? ?? '',
    courseId: json['courseId'] as String? ?? '',
    senderId: json['senderId'] as String? ?? '',
    displayName: json['displayName'] as String? ?? 'Learner',
    message: json['message'] as String? ?? '',
    createdAt: json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
    batchId: json['batchId'] as String?,
    learnerProfileId: json['learnerProfileId'] as String?,
    avatarUrl: json['avatarUrl'] as String?,
    isInstructor: json['isInstructor'] as bool? ?? false,
  );
}

class LessonItem {
  const LessonItem({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.duration,
    required this.order,
    required this.completed,
  });
  final String id, title, type;
  final String? description;
  final int? duration;
  final int order;
  final bool completed;
  factory LessonItem.fromJson(Map<String, dynamic> json) => LessonItem(
    id: json['id'] as String? ?? '',
    title: json['title'] as String? ?? 'Lesson',
    description: json['description'] as String?,
    type: json['type'] as String? ?? '',
    duration: json['duration'] == null ? null : _int(json['duration']),
    order: _int(json['order']),
    completed: json['completed'] as bool? ?? false,
  );
}

class LessonModule {
  const LessonModule({
    required this.id,
    required this.title,
    required this.order,
    required this.lessons,
  });
  final String id, title;
  final int order;
  final List<LessonItem> lessons;
  factory LessonModule.fromJson(Map<String, dynamic> json) => LessonModule(
    id: json['id'] as String? ?? '',
    title: json['title'] as String? ?? 'Module',
    order: _int(json['order']),
    lessons:
        ((json['lessons'] as List?) ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(LessonItem.fromJson)
            .toList()
          ..sort((a, b) => a.order.compareTo(b.order)),
  );
}

class CourseLearningContent {
  const CourseLearningContent({
    required this.courseId,
    required this.courseTitle,
    required this.modules,
    required this.progress,
    required this.completedLessons,
    required this.totalLessons,
  });
  final String courseId, courseTitle;
  final List<LessonModule> modules;
  final int progress, completedLessons, totalLessons;
  factory CourseLearningContent.fromJson(Map<String, dynamic> json) {
    final modules =
        ((json['modules'] as List?) ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(LessonModule.fromJson)
            .toList()
          ..sort((a, b) => a.order.compareTo(b.order));
    return CourseLearningContent(
      courseId: json['courseId'] as String? ?? '',
      courseTitle: json['courseTitle'] as String? ?? 'Course',
      modules: modules,
      progress: _int(json['progress']),
      completedLessons: _int(json['completedLessons']),
      totalLessons: _int(json['totalLessons']),
    );
  }
  List<LessonItem> get allLessons =>
      modules.expand((m) => m.lessons).toList(growable: false);
}

class SignedLessonUrl {
  const SignedLessonUrl(
    this.url,
    this.contentType,
    this.mimeType,
    this.referer,
  );
  final String url, contentType;
  final String? mimeType, referer;
  factory SignedLessonUrl.fromJson(Map<String, dynamic> j) => SignedLessonUrl(
    j['url'] as String? ?? '',
    j['contentType'] as String? ?? '',
    j['mimeType'] as String?,
    j['referer'] as String?,
  );
}

class LessonProgress {
  const LessonProgress({
    this.watchedSeconds = 0,
    this.lastPosition = 0,
    this.completed = false,
  });
  final int watchedSeconds, lastPosition;
  final bool completed;
  factory LessonProgress.fromJson(Map<String, dynamic> j) => LessonProgress(
    watchedSeconds: _int(j['watchedSeconds']),
    lastPosition: _int(j['lastPosition']),
    completed: j['completed'] as bool? ?? false,
  );
}

int _int(dynamic value) =>
    value is num ? value.round() : int.tryParse('$value') ?? 0;
