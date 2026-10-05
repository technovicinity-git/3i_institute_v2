class WishlistItem {
  const WishlistItem({
    required this.id,
    required this.addedAt,
    required this.course,
  });
  final String id;
  final DateTime? addedAt;
  final WishlistCourse course;

  factory WishlistItem.fromJson(Map<String, dynamic> j) => WishlistItem(
    id: _string(j['wishlistItemId']),
    addedAt: DateTime.tryParse(_string(j['addedAt']))?.toLocal(),
    course: WishlistCourse.fromJson(
      j['course'] is Map
          ? Map<String, dynamic>.from(j['course'] as Map)
          : const {},
    ),
  );
}

class WishlistCourse {
  const WishlistCourse({
    required this.id,
    required this.title,
    required this.summary,
    required this.thumbnailUrl,
    required this.categoryId,
    required this.level,
    required this.minimumAge,
    required this.instructorName,
    required this.averageRating,
    required this.ratingCount,
    required this.enrolmentCount,
    required this.format,
  });
  final String id, title, summary, categoryId, level, instructorName, format;
  final String? thumbnailUrl;
  final int minimumAge, ratingCount, enrolmentCount;
  final double? averageRating;

  String get levelLabel => switch (level.toLowerCase()) {
    '1' || 'beginner' => 'BEGINNER',
    '2' || 'intermediate' => 'INTERMEDIATE',
    '3' || 'advanced' => 'ADVANCED',
    _ => 'ALL LEVELS',
  };
  String get ageLabel => minimumAge >= 18
      ? '18+'
      : minimumAge >= 16
      ? '16–17'
      : minimumAge >= 13
      ? '13–15'
      : minimumAge >= 9
      ? '9–12'
      : minimumAge >= 5
      ? '5–8'
      : 'All ages';

  factory WishlistCourse.fromJson(Map<String, dynamic> j) {
    final instructor = j['instructor'] is Map
        ? Map<String, dynamic>.from(j['instructor'] as Map)
        : const <String, dynamic>{};
    return WishlistCourse(
      id: _string(j['id']),
      title: _string(j['title'], fallback: 'Course'),
      summary: _string(j['summary']),
      thumbnailUrl: j['thumbnailUrl'] as String?,
      categoryId: _string(j['categoryId']),
      level: '${j['level'] ?? ''}',
      minimumAge: _int(j['minimumAge']),
      instructorName: _string(instructor['name'], fallback: 'Instructor'),
      averageRating: (j['averageRating'] as num?)?.toDouble(),
      ratingCount: _int(j['ratingCount']),
      enrolmentCount: _int(j['enrolmentCount']),
      format: _string(j['format']),
    );
  }
}

class WishlistData {
  const WishlistData({required this.items, required this.total});
  final List<WishlistItem> items;
  final int total;
  factory WishlistData.fromJson(Map<String, dynamic> j) => WishlistData(
    items: ((j['items'] as List?) ?? const [])
        .whereType<Map>()
        .map((e) => WishlistItem.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false),
    total: _int(j['total']),
  );
}

String _string(dynamic value, {String fallback = ''}) =>
    value is String && value.isNotEmpty ? value : fallback;
int _int(dynamic value) =>
    value is num ? value.round() : int.tryParse('$value') ?? 0;
