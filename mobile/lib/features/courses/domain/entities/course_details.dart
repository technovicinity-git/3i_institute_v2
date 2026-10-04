import 'course.dart';

class CourseDetails extends Course {
  const CourseDetails({
    required super.id,
    required super.title,
    required super.summary,
    required super.thumbnailUrl,
    required super.categoryName,
    required super.type,
    required super.level,
    required super.language,
    required super.minimumAge,
    required super.instructorName,
    required super.averageRating,
    required super.ratingCount,
    required super.enrolled,
    required super.wishlisted,
    required this.description,
    required this.aboutParagraphs,
    required this.coverImageUrl,
    required this.learningOutcomes,
    required this.requirements,
    required this.whatIncluded,
    required this.faq,
    required this.durationWeeks,
    required this.totalLessons,
    required this.totalDurationMinutes,
    required this.instructorBio,
    required this.instructorAvatarUrl,
    required this.instructorCourseCount,
    required this.instructorStudentCount,
    required this.batches,
    required this.curriculum,
    required this.reviews,
    required this.relatedCourses,
    required this.enrolmentBatchId,
    required this.continueLessonId,
    required this.lastWatchedLessonId,
    required this.isCompleted,
  });

  final String description;
  final List<String> aboutParagraphs;
  final String? coverImageUrl;
  final List<String> learningOutcomes;
  final List<String> requirements;
  final List<String> whatIncluded;
  final List<CourseFaq> faq;
  final int durationWeeks;
  final int totalLessons;
  final int totalDurationMinutes;
  final String instructorBio;
  final String? instructorAvatarUrl;
  final int instructorCourseCount;
  final int instructorStudentCount;
  final List<CourseBatch> batches;
  final List<CourseModule> curriculum;
  final List<CourseReview> reviews;
  final List<Course> relatedCourses;
  final String? enrolmentBatchId;
  final String? continueLessonId;
  final String? lastWatchedLessonId;
  final bool isCompleted;
}

class CourseFaq {
  const CourseFaq({required this.question, required this.answer});
  final String question;
  final String answer;
}

class CourseBatch {
  const CourseBatch({required this.id, required this.name, required this.status, required this.capacity, required this.sessions});
  final String id;
  final String name;
  final String status;
  final int capacity;
  final List<CourseSession> sessions;
}

class CourseSession {
  const CourseSession({required this.id, required this.title, required this.scheduledAt, required this.durationMinutes, required this.notes});
  final String id;
  final String title;
  final DateTime? scheduledAt;
  final int durationMinutes;
  final String? notes;
}

class CourseModule {
  const CourseModule({required this.number, required this.title, required this.duration, required this.lessons});
  final String number;
  final String title;
  final String duration;
  final List<CourseLesson> lessons;
}

class CourseLesson {
  const CourseLesson({required this.title, required this.description, required this.duration, required this.type});
  final String title;
  final String? description;
  final String duration;
  final String? type;
}

class CourseReview {
  const CourseReview({required this.name, required this.rating, required this.text, required this.date});
  final String name;
  final int rating;
  final String text;
  final DateTime? date;
}
