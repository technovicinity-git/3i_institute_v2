class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.category,
    required this.title,
    required this.body,
    required this.read,
    required this.createdAt,
    this.learnerProfileId,
    this.route,
    this.data = const {},
  });

  final String id, type, category, title, body;
  final String? learnerProfileId, route;
  final bool read;
  final DateTime createdAt;
  final Map<String, dynamic> data;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map<String, dynamic>
        ? json['data'] as Map<String, dynamic>
        : const <String, dynamic>{};
    return AppNotification(
      id: '${json['id'] ?? ''}',
      type: '${json['type'] ?? ''}',
      category: '${json['category'] ?? 'general'}',
      title: '${json['title'] ?? ''}',
      body: '${json['body'] ?? ''}',
      read: json['read'] == true,
      createdAt:
          DateTime.tryParse('${json['createdAt'] ?? ''}')?.toLocal() ??
          DateTime.now(),
      learnerProfileId: json['learnerProfileId'] as String?,
      route: data['route'] as String?,
      data: data,
    );
  }

  AppNotification copyWith({bool? read}) => AppNotification(
    id: id,
    type: type,
    category: category,
    title: title,
    body: body,
    read: read ?? this.read,
    createdAt: createdAt,
    learnerProfileId: learnerProfileId,
    route: route,
    data: data,
  );
}

class NotificationsPage {
  const NotificationsPage({
    required this.items,
    required this.hasMore,
    required this.unreadCount,
  });
  final List<AppNotification> items;
  final bool hasMore;
  final int unreadCount;
}

class UnreadCounts {
  const UnreadCounts({this.account = 0, this.byProfile = const {}});
  final int account;
  final Map<String, int> byProfile;

  int forScope(String? learnerProfileId) =>
      learnerProfileId == null ? account : byProfile[learnerProfileId] ?? 0;

  factory UnreadCounts.fromJson(Map<String, dynamic> json) {
    final byProfile = json['byProfile'];
    return UnreadCounts(
      account: (json['account'] as num?)?.toInt() ?? 0,
      byProfile: byProfile is Map
          ? byProfile.map(
              (key, value) => MapEntry('$key', (value as num?)?.toInt() ?? 0),
            )
          : const {},
    );
  }
}
