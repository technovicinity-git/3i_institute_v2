import '../../../core/network/api_client.dart';

class SitePageLink {
  const SitePageLink({required this.slug, required this.title});
  final String slug, title;
}

class SitePageContent {
  const SitePageContent({
    required this.title,
    required this.body,
    required this.updatedAt,
  });
  final String title, body;
  final DateTime? updatedAt;
}

class FaqEntry {
  const FaqEntry({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
  });
  final String id, category, question, answer;
}

class SiteContactInfo {
  const SiteContactInfo({
    required this.email,
    required this.phone,
    required this.address,
    required this.supportHours,
  });
  final String email, phone, address, supportHours;

  bool get isEmpty =>
      email.isEmpty && phone.isEmpty && address.isEmpty && supportHours.isEmpty;
}

/// Public site content managed in the admin "Content" section.
class ContentRepository {
  const ContentRepository(this._api);
  final ApiClient _api;

  Future<List<Map<String, dynamic>>> _list(String path) async {
    final response = await _api.dio.get<Map<String, dynamic>>(path);
    final data = response.data?['data'];
    return data is List
        ? data.whereType<Map<String, dynamic>>().toList()
        : const [];
  }

  Future<List<SitePageLink>> getPublishedPages() async =>
      (await _list('/site/pages'))
          .map(
            (p) => SitePageLink(
              slug: '${p['slug'] ?? ''}',
              title: '${p['title'] ?? ''}',
            ),
          )
          .toList();

  Future<SitePageContent> getPage(String slug) async {
    final response = await _api.dio.get<Map<String, dynamic>>(
      '/site/pages/$slug',
    );
    final data = response.data?['data'];
    final page = data is Map<String, dynamic> ? data : const {};
    return SitePageContent(
      title: '${page['title'] ?? ''}',
      body: '${page['body'] ?? ''}',
      updatedAt: DateTime.tryParse('${page['updatedAt'] ?? ''}')?.toLocal(),
    );
  }

  Future<List<FaqEntry>> getFaq() async => (await _list('/site/faq'))
      .map(
        (f) => FaqEntry(
          id: '${f['id'] ?? ''}',
          category: '${f['category'] ?? 'General'}',
          question: '${f['question'] ?? ''}',
          answer: '${f['answer'] ?? ''}',
        ),
      )
      .toList();

  Future<SiteContactInfo> getContactInfo() async {
    final response = await _api.dio.get<Map<String, dynamic>>('/site/settings');
    final data = response.data?['data'];
    final s = data is Map<String, dynamic> ? data : const {};
    String field(String key) => s[key] is String ? s[key] as String : '';
    return SiteContactInfo(
      email: field('contactEmail'),
      phone: field('contactPhone'),
      address: field('address'),
      supportHours: field('supportHours'),
    );
  }
}
