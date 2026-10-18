import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/course.dart';
import '../providers/courses_providers.dart';
import '../widgets/course_card.dart';
import '../widgets/landing_layout.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../../../core/l10n/l10n.dart';

// Values the API filters on; "All ages" is the backend's own band name.
const _ageBands = ['5-8', '9-12', '13-15', '16-17', '18+', 'All ages'];
String _ageBandLabel(AppLocalizations l10n, String band) {
  if (band == 'All ages') return l10n.commonAllAges;
  if (band.endsWith('+')) return l10n.commonAgesFrom(band.substring(0, band.length - 1));
  final parts = band.split('-');
  return l10n.commonAgeRange(parts.first, parts.last);
}
Map<String, String> _sortOptions(AppLocalizations l10n) => {
  'popularity': l10n.coursesSortPopularity,
  'newest': l10n.coursesSortNewest,
  'rating': l10n.coursesSortRating,
  'title': l10n.coursesSortTitle,
};

class CoursesPage extends ConsumerStatefulWidget {
  const CoursesPage({super.key});

  @override
  ConsumerState<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends ConsumerState<CoursesPage> {
  final _search = TextEditingController();
  Timer? _debounce;
  String _searchTerm = '';
  String _categoryId = '';
  String _format = '';
  String _language = '';
  String _ageBand = '';
  String _sortBy = 'popularity';
  int _page = 1;

  @override
  void dispose() {
    _debounce?.cancel();
    _search.dispose();
    super.dispose();
  }

  Map<String, String> _filters(String? profileId) => {
        'page': '$_page',
        'limit': '12',
        'sortBy': _sortBy,
        if (_searchTerm.isNotEmpty) 'search': _searchTerm,
        if (_categoryId.isNotEmpty) 'category': _categoryId,
        if (_format.isNotEmpty) 'format': _format,
        if (_language.isNotEmpty) 'language': _language,
        if (_ageBand.isNotEmpty) 'ageBand': _ageBand,
        if (profileId != null) 'learnerProfileId': profileId,
      };

  void _changeFilter(VoidCallback change) => setState(() {
        change();
        _page = 1;
      });

  void _clearFilters() {
    _debounce?.cancel();
    _search.clear();
    setState(() {
      _searchTerm = '';
      _categoryId = '';
      _format = '';
      _language = '';
      _ageBand = '';
      _sortBy = 'popularity';
      _page = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    final query = Uri(queryParameters: _filters(profile?.id)).query;
    final coursesAsync = ref.watch(coursesProvider(query));
    final categoriesAsync = ref.watch(courseCategoriesProvider);
    final totalPages = coursesAsync.asData?.value.totalPages ?? 0;

    return ColoredBox(
      color: const Color(0xFFFBF9F4),
      child: RefreshIndicator(
        onRefresh: () async => ref.invalidate(coursesProvider(query)),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1440),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(18, 28, 18, 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.l10n.coursesTitle, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontFamily: 'serif', color: const Color(0xFF0C1F33))),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _search,
                          textInputAction: TextInputAction.search,
                          onChanged: (value) {
                            _debounce?.cancel();
                            _debounce = Timer(const Duration(milliseconds: 400), () {
                              if (mounted) setState(() {
                                _searchTerm = value.trim();
                                _page = 1;
                              });
                            });
                          },
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.search, color: Color(0xFF475569)),
                            hintText: context.l10n.coursesSearch,
                            suffixIcon: _search.text.isEmpty
                                ? null
                                : IconButton(
                                    tooltip: context.l10n.coursesClearSearch,
                                    onPressed: () {
                                      _debounce?.cancel();
                                      _search.clear();
                                      setState(() {
                                        _searchTerm = '';
                                        _page = 1;
                                      });
                                    },
                                    icon: const Icon(Icons.close),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _FilterControls(
                          categories: categoriesAsync.asData?.value ?? const [],
                          categoryId: _categoryId,
                          format: _format,
                          language: _language,
                          ageBand: _ageBand,
                          sortBy: _sortBy,
                          onCategory: (value) => _changeFilter(() => _categoryId = value ?? ''),
                          onFormat: (value) => _changeFilter(() => _format = value ?? ''),
                          onLanguage: (value) => _changeFilter(() => _language = value ?? ''),
                          onAgeBand: (value) => _changeFilter(() => _ageBand = value ?? ''),
                          onSort: (value) => _changeFilter(() => _sortBy = value ?? 'popularity'),
                          onClear: _clearFilters,
                        ),
                        const SizedBox(height: 10),
                        coursesAsync.when(
                          loading: () => Text(context.l10n.coursesLoading, style: const TextStyle(color: Color(0xFF475569))),
                          error: (_, __) => Text(context.l10n.coursesLoadFailed, style: const TextStyle(color: Color(0xFFB42318))),
                          data: (data) => Text(context.l10n.coursesCount(data.total), style: const TextStyle(color: Color(0xFF475569))),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            coursesAsync.when(
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: _CourseError(onRetry: () => ref.invalidate(coursesProvider(query))),
              ),
              data: (data) => data.courses.isEmpty
                  ? SliverFillRemaining(hasScrollBody: false, child: _EmptyCourses(onClear: _clearFilters))
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(18, 10, 18, 22),
                      sliver: SliverLayoutBuilder(
                        builder: (context, constraints) {
                          final columns = constraints.crossAxisExtent >= 950
                              ? 4
                              : constraints.crossAxisExtent >= 620
                                  ? 2
                                  : 1;
                          return SliverGrid.builder(
                            itemCount: data.courses.length,
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: columns,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              mainAxisExtent: columns == 1 ? 390 : 382,
                            ),
                            itemBuilder: (context, index) => CourseCard(course: data.courses[index]),
                          );
                        },
                      ),
                    ),
            ),
            if (totalPages > 1)
              SliverToBoxAdapter(
                child: _Pagination(
                  page: _page,
                  totalPages: totalPages,
                  onPage: (page) => setState(() => _page = page),
                ),
              ),
            const SliverToBoxAdapter(child: LandingFooter()),
          ],
        ),
      ),
    );
  }
}

class _FilterControls extends StatelessWidget {
  const _FilterControls({
    required this.categories,
    required this.categoryId,
    required this.format,
    required this.language,
    required this.ageBand,
    required this.sortBy,
    required this.onCategory,
    required this.onFormat,
    required this.onLanguage,
    required this.onAgeBand,
    required this.onSort,
    required this.onClear,
  });

  final List<CourseCategory> categories;
  final String categoryId;
  final String format;
  final String language;
  final String ageBand;
  final String sortBy;
  final ValueChanged<String?> onCategory;
  final ValueChanged<String?> onFormat;
  final ValueChanged<String?> onLanguage;
  final ValueChanged<String?> onAgeBand;
  final ValueChanged<String?> onSort;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _filterDropDown<String>(
                label: context.l10n.coursesCategory,
                value: categoryId,
                items: [DropdownMenuItem(value: '', child: Text(context.l10n.coursesAllCategories)), ...categories.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name, overflow: TextOverflow.ellipsis)))],
                onChanged: onCategory,
              ),
              _filterDropDown<String>(
                label: context.l10n.coursesType,
                value: format,
                items: [DropdownMenuItem(value: '', child: Text(context.l10n.coursesAllTypes)), DropdownMenuItem(value: 'self-paced', child: Text(context.l10n.coursesTypeRegular)), DropdownMenuItem(value: 'live', child: Text(context.l10n.coursesTypeLive)), DropdownMenuItem(value: 'hybrid', child: Text(context.l10n.coursesTypeHybrid))],
                onChanged: onFormat,
              ),
              _filterDropDown<String>(
                label: context.l10n.coursesLanguage,
                value: language,
                items: [DropdownMenuItem(value: '', child: Text(context.l10n.coursesAllLanguages)), ...supportedLanguageCodes.map((code) => DropdownMenuItem(value: code, child: Text(languageNames[code]!)))],
                onChanged: onLanguage,
              ),
              _filterDropDown<String>(
                label: context.l10n.coursesAge,
                value: ageBand,
                items: [DropdownMenuItem(value: '', child: Text(context.l10n.commonAllAges)), ..._ageBands.map((age) => DropdownMenuItem(value: age, child: Text(_ageBandLabel(context.l10n, age))))],
                onChanged: onAgeBand,
              ),
              _filterDropDown<String>(
                label: context.l10n.coursesSort,
                value: sortBy,
                items: _sortOptions(context.l10n).entries.map((entry) => DropdownMenuItem(value: entry.key, child: Text(entry.value))).toList(),
                onChanged: onSort,
              ),
            ],
          ),
          TextButton.icon(
            onPressed: onClear,
            icon: const Icon(Icons.filter_alt_off_outlined, size: 17),
            label: Text(context.l10n.coursesClearFilters),
            style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 4)),
          ),
        ],
      );

  Widget _filterDropDown<T>({required String label, required T value, required List<DropdownMenuItem<T>> items, required ValueChanged<T?> onChanged}) =>
      SizedBox(
        width: 164,
        child: DropdownButtonFormField<T>(
          initialValue: value,
          isExpanded: true,
          decoration: InputDecoration(labelText: label, isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12), fillColor: Colors.white),
          items: items,
          onChanged: onChanged,
        ),
      );
}

class _Pagination extends StatelessWidget {
  const _Pagination({required this.page, required this.totalPages, required this.onPage});
  final int page;
  final int totalPages;
  final ValueChanged<int> onPage;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 28),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(onPressed: page > 1 ? () => onPage(page - 1) : null, icon: const Icon(Icons.chevron_left)),
            Text(context.l10n.coursesPageOf(page, totalPages), style: const TextStyle(fontWeight: FontWeight.w600)),
            IconButton(onPressed: page < totalPages ? () => onPage(page + 1) : null, icon: const Icon(Icons.chevron_right)),
          ],
        ),
      );
}

class _EmptyCourses extends StatelessWidget {
  const _EmptyCourses({required this.onClear});
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.search_off, size: 44, color: Color(0xFF94A3B8)),
              const SizedBox(height: 12),
              Text(context.l10n.coursesNoResults, textAlign: TextAlign.center),
              TextButton(onPressed: onClear, child: Text(context.l10n.coursesClearAllFilters)),
            ],
          ),
        ),
      );
}

class _CourseError extends StatelessWidget {
  const _CourseError({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(context.l10n.coursesLoadFailed),
            const SizedBox(height: 8),
            FilledButton.tonal(onPressed: onRetry, child: Text(context.l10n.commonTryAgain)),
          ],
        ),
      );
}
