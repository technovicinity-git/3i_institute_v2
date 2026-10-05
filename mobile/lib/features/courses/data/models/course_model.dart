import '../../domain/entities/course.dart';
import '../../domain/entities/course_details.dart';

Map<String, dynamic> asJsonMap(Object? value) =>
    value is Map<String, dynamic> ? value : const {};

List<Object?> asJsonList(Object? value) => value is List ? value.cast<Object?>() : const [];

String stringValue(Object? value, [String fallback = '']) => value is String ? value : fallback;
int intValue(Object? value, [int fallback = 0]) => value is num ? value.toInt() : fallback;
double? doubleValue(Object? value) => value is num ? value.toDouble() : null;
bool boolValue(Object? value) => value is bool && value;

class CourseModel extends Course {
  const CourseModel({
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
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    final category = asJsonMap(json['category']);
    final instructor = asJsonMap(json['instructor']);
    return CourseModel(
      id: stringValue(json['id']),
      title: stringValue(json['title'], 'Course'),
      summary: stringValue(json['summary']),
      thumbnailUrl: json['thumbnailUrl'] as String?,
      categoryName: stringValue(category['name'], 'Uncategorized'),
      type: stringValue(json['type'], 'REGULAR'),
      level: stringValue(json['level']),
      language: stringValue(json['language'], 'en'),
      minimumAge: intValue(json['minimumAge']),
      instructorName: stringValue(instructor['name']),
      averageRating: doubleValue(json['averageRating']),
      ratingCount: intValue(json['ratingCount']),
      enrolled: boolValue(json['enrolled']),
      wishlisted: boolValue(json['wishlisted']),
    );
  }
}

class CourseDetailsModel extends CourseDetails {
  const CourseDetailsModel({
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
    required super.description,
    required super.aboutParagraphs,
    required super.coverImageUrl,
    required super.learningOutcomes,
    required super.requirements,
    required super.whatIncluded,
    required super.faq,
    required super.durationWeeks,
    required super.totalLessons,
    required super.totalDurationMinutes,
    required super.instructorBio,
    required super.instructorAvatarUrl,
    required super.instructorCourseCount,
    required super.instructorStudentCount,
    required super.batches,
    required super.curriculum,
    required super.reviews,
    required super.relatedCourses,
    required super.enrolmentBatchId,
    required super.continueLessonId,
    required super.lastWatchedLessonId,
    required super.isCompleted,
  });

  factory CourseDetailsModel.fromJson(Map<String, dynamic> json) {
    final category = asJsonMap(json['category']);
    final instructor = asJsonMap(json['instructor']);
    final rating = asJsonMap(json['ratingSummary']);
    final about = asJsonList(json['aboutParagraphs']).whereType<String>().toList();
    final description = stringValue(json['description']);
    return CourseDetailsModel(
      id: stringValue(json['id']),
      title: stringValue(json['title'], 'Course'),
      summary: stringValue(json['summary']),
      thumbnailUrl: json['thumbnailUrl'] as String?,
      categoryName: stringValue(category['name'], 'General'),
      type: stringValue(json['type'], 'REGULAR'),
      level: stringValue(json['level']),
      language: stringValue(json['language'], 'en'),
      minimumAge: intValue(json['minimumAge']),
      instructorName: stringValue(instructor['name'], '3i Faculty'),
      averageRating: doubleValue(rating['average']),
      ratingCount: intValue(rating['total']),
      enrolled: boolValue(json['isEnrolled']),
      wishlisted: false,
      description: description,
      aboutParagraphs: about.isEmpty && description.isNotEmpty ? description.split('\n\n') : about,
      coverImageUrl: json['coverImageUrl'] as String?,
      learningOutcomes: asJsonList(json['learningOutcomes']).whereType<String>().toList(),
      requirements: asJsonList(json['requirements']).whereType<String>().toList(),
      whatIncluded: asJsonList(json['whatIncluded']).whereType<String>().toList(),
      faq: asJsonList(json['faq']).map((item) {
        final faq = asJsonMap(item);
        return CourseFaq(question: stringValue(faq['question']), answer: stringValue(faq['answer']));
      }).toList(),
      durationWeeks: intValue(json['durationWeeks']),
      totalLessons: intValue(json['totalLessons']),
      totalDurationMinutes: intValue(json['totalDurationMinutes']),
      instructorBio: stringValue(instructor['bio']),
      instructorAvatarUrl: (instructor['avatarUrl'] as String?)?.isEmpty == true ? null : instructor['avatarUrl'] as String?,
      instructorCourseCount: intValue(instructor['courseCount']),
      instructorStudentCount: intValue(instructor['studentCount']),
      batches: asJsonList(json['batches']).map((item) {
        final batch = asJsonMap(item);
        return CourseBatch(
          id: stringValue(batch['id']),
          name: stringValue(batch['name'], 'Class batch'),
          status: stringValue(batch['status']),
          capacity: intValue(batch['capacity']),
          sessions: asJsonList(batch['sessions']).map((sessionItem) {
            final session = asJsonMap(sessionItem);
            return CourseSession(
              id: stringValue(session['id']),
              title: stringValue(session['title'], 'Class session'),
              scheduledAt: DateTime.tryParse(stringValue(session['scheduledAt'])),
              durationMinutes: intValue(session['durationMinutes']),
              notes: session['notes'] as String?,
            );
          }).toList(),
        );
      }).toList(),
      curriculum: asJsonList(json['curriculum']).map((item) {
        final module = asJsonMap(item);
        return CourseModule(
          number: stringValue(module['moduleNum']),
          title: stringValue(module['title']),
          duration: stringValue(module['duration']),
          lessons: asJsonList(module['lessonsList']).map((lessonItem) {
            final lesson = asJsonMap(lessonItem);
            return CourseLesson(
              title: stringValue(lesson['title']),
              description: lesson['description'] as String?,
              duration: stringValue(lesson['duration']),
              type: lesson['type'] as String?,
            );
          }).toList(),
        );
      }).toList(),
      reviews: asJsonList(json['reviews']).map((item) {
        final review = asJsonMap(item);
        return CourseReview(
          name: stringValue(review['name'], 'Learner'),
          rating: intValue(review['rating']),
          text: stringValue(review['text']),
          date: DateTime.tryParse(stringValue(review['createdAt'])),
        );
      }).toList(),
      relatedCourses: asJsonList(json['relatedCourses']).map((item) {
        final related = asJsonMap(item);
        return CourseModel(
          id: stringValue(related['id']),
          title: stringValue(related['title']),
          summary: '',
          thumbnailUrl: related['thumbnailUrl'] as String?,
          categoryName: '',
          type: 'REGULAR',
          level: stringValue(related['level']),
          language: 'en',
          minimumAge: 0,
          instructorName: stringValue(related['instructor']),
          averageRating: doubleValue(related['rating']),
          ratingCount: 0,
          enrolled: false,
          wishlisted: false,
        );
      }).toList(),
      enrolmentBatchId: json['enrolmentBatchId'] as String?,
      continueLessonId: json['continueLessonId'] as String?,
      lastWatchedLessonId: json['lastWatchedLessonId'] as String?,
      isCompleted: boolValue(json['isCompleted']),
    );
  }
}
