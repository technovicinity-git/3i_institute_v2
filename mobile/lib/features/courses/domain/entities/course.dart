class Course {
  const Course({
    required this.id,
    required this.title,
    required this.summary,
    required this.thumbnailUrl,
    required this.categoryName,
    required this.type,
    required this.level,
    required this.language,
    required this.minimumAge,
    this.maximumAge,
    required this.instructorName,
    required this.averageRating,
    required this.ratingCount,
    required this.enrolled,
    required this.wishlisted,
  });

  final String id;
  final String title;
  final String summary;
  final String? thumbnailUrl;
  final String categoryName;
  final String type;
  final String level;
  final String language;
  final int minimumAge;
  final int? maximumAge;
  final String instructorName;
  final double? averageRating;
  final int ratingCount;
  final bool enrolled;
  final bool wishlisted;

  String get levelLabel {
    switch (level.toLowerCase()) {
      case '1':
      case 'beginner':
        return 'BEGINNER';
      case '2':
      case 'intermediate':
        return 'INTERMEDIATE';
      case '3':
      case 'advanced':
        return 'ADVANCED';
      default:
        return 'ALL LEVELS';
    }
  }

  String get ageLabel {
    final max = maximumAge;
    if (max == null || max >= 99) return 'Ages $minimumAge+';
    return 'Ages $minimumAge–$max';
  }
}

class CoursePage {
  const CoursePage({required this.courses, required this.total, required this.totalPages});
  final List<Course> courses;
  final int total;
  final int totalPages;
}

class CourseCategory {
  const CourseCategory({required this.id, required this.name, required this.courseCount});
  final String id;
  final String name;
  final int courseCount;
}
