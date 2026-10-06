import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/instructor_course.dart';
import '../providers/instructor_courses_providers.dart';

class InstructorCourseFormPage extends ConsumerStatefulWidget {
  const InstructorCourseFormPage({this.courseId, super.key});
  final String? courseId;
  @override
  ConsumerState<InstructorCourseFormPage> createState() =>
      _InstructorCourseFormPageState();
}

class _InstructorCourseFormPageState
    extends ConsumerState<InstructorCourseFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController(),
      _summary = TextEditingController(),
      _description = TextEditingController(),
      _minAge = TextEditingController(text: '5'),
      _maxAge = TextEditingController();
  String? _category, _type = 'REGULAR', _level = '1', _language = 'en';
  List<String> _outcomes = [], _requirements = [];
  XFile? _thumbnail;
  String? _thumbnailUrl;
  bool _initialized = false, _saving = false;
  InstructorCourse? _course;
  bool get _editing => widget.courseId != null;

  @override
  void dispose() {
    _title.dispose();
    _summary.dispose();
    _description.dispose();
    _minAge.dispose();
    _maxAge.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cats = ref.watch(instructorCategoriesProvider);
    final courses = ref.watch(instructorCoursesProvider);
    if (_editing) {
      if (courses.isLoading || cats.isLoading) {
        return const Center(child: CircularProgressIndicator());
      }
      _course ??= courses.asData?.value
          .where((item) => item.id == widget.courseId)
          .firstOrNull;
      if (_course == null) return const Center(child: Text('Course not found'));
      if (!_initialized) _setInitial(_course!);
    }
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        TextButton.icon(
          onPressed: () => context.go('/instructor/courses'),
          icon: const Icon(Icons.chevron_left),
          label: const Text('Back to courses'),
          style: TextButton.styleFrom(alignment: Alignment.centerLeft),
        ),
        if (_editing) _CourseActionStrip(course: _course!),
        Text(
          _editing ? 'Edit Course' : 'Create New Course',
          style: const TextStyle(
            fontFamily: 'serif',
            fontSize: 28,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 18),
        cats.when(
          loading: () => const LinearProgressIndicator(),
          error: (_, _) => const Text('Unable to load course categories.'),
          data: (categories) => Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _thumbnailField(),
                const SizedBox(height: 16),
                _field(
                  'Course Title *',
                  _title,
                  maxLength: 255,
                  validator: (v) => v == null || v.trim().isEmpty
                      ? 'Title is required'
                      : null,
                ),
                _field(
                  'Summary *',
                  _summary,
                  maxLength: _editing ? 1000 : 500,
                  lines: 3,
                  validator: (v) => v == null || v.trim().length < 10
                      ? 'Enter at least 10 characters'
                      : null,
                ),
                _field(
                  'Description *',
                  _description,
                  lines: 6,
                  validator: (v) => v == null || v.trim().length < 10
                      ? 'Enter at least 10 characters'
                      : null,
                ),
                _dropdown<String>(
                  'Category *',
                  _category,
                  [
                    for (final c in categories)
                      DropdownMenuItem(value: c.id, child: Text(c.name)),
                  ],
                  (v) => setState(() => _category = v),
                  validator: (v) => v == null ? 'Select a category' : null,
                ),
                _dropdown<String>('Course Type *', _type, const [
                  DropdownMenuItem(value: 'REGULAR', child: Text('Regular')),
                  DropdownMenuItem(
                    value: 'ONLINE_CLASS',
                    child: Text('Online Class'),
                  ),
                ], (v) => setState(() => _type = v)),
                Row(
                  children: [
                    Expanded(
                      child: _dropdown<String>('Level *', _level, const [
                        DropdownMenuItem(value: '1', child: Text('Beginner')),
                        DropdownMenuItem(
                          value: '2',
                          child: Text('Intermediate'),
                        ),
                        DropdownMenuItem(value: '3', child: Text('Advanced')),
                      ], (v) => setState(() => _level = v)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _dropdown<String>('Language *', _language, const [
                        DropdownMenuItem(value: 'en', child: Text('English')),
                        DropdownMenuItem(value: 'bn', child: Text('Bangla')),
                        DropdownMenuItem(value: 'hi', child: Text('Hindi')),
                        DropdownMenuItem(value: 'ur', child: Text('Urdu')),
                        DropdownMenuItem(value: 'ar', child: Text('Arabic')),
                      ], (v) => setState(() => _language = v)),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Expanded(
                      child: _field(
                        'Minimum Age *',
                        _minAge,
                        numeric: true,
                        validator: _validateMinAge,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _field(
                        'Maximum Age (optional)',
                        _maxAge,
                        numeric: true,
                        validator: _validateMaxAge,
                      ),
                    ),
                  ],
                ),
                _stringListField('Learning Outcomes', _outcomes),
                _stringListField('Requirements (optional)', _requirements),
                const Divider(height: 28),
                if (_editing)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _save(
                            draft: !_course!.isDraft,
                            toggleDraft: true,
                          ),
                          child: Text(
                            _course!.isDraft ? 'Publish' : 'Save as Draft',
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton(
                          onPressed: _saving
                              ? null
                              : () => _save(draft: _course!.isDraft),
                          child: Text(_saving ? 'Saving…' : 'Save Changes'),
                        ),
                      ),
                    ],
                  )
                else
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _saving ? null : () => _save(draft: true),
                          child: const Text('Save as Draft'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton(
                          onPressed: _saving ? null : () => _save(draft: false),
                          child: Text(_saving ? 'Creating…' : 'Create Course'),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 22),
      ],
    );
  }

  void _setInitial(InstructorCourse course) {
    _initialized = true;
    _title.text = course.title;
    _summary.text = course.summary;
    _description.text = course.description;
    _category = course.categoryId;
    _type = course.type;
    _level = course.level;
    _language = course.language;
    _minAge.text = '${course.minimumAge}';
    _maxAge.text = course.maximumAge?.toString() ?? '';
    _outcomes = [...course.learningOutcomes];
    _requirements = [...course.requirements];
    _thumbnailUrl = course.thumbnailUrl;
  }

  String? _validateMinAge(String? value) {
    final age = int.tryParse(value ?? '');
    return age == null || age < 5 || age > 18
        ? 'Choose an age from 5 to 18'
        : null;
  }

  String? _validateMaxAge(String? value) {
    if (value == null || value.isEmpty) return null;
    final age = int.tryParse(value);
    final min = int.tryParse(_minAge.text) ?? 5;
    return age == null || age < min || age > 100
        ? 'Must be at least the minimum age'
        : null;
  }

  Widget _thumbnailField() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'Course Thumbnail',
        style: TextStyle(fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 8),
      Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(9),
            child: SizedBox(
              width: 150,
              height: 86,
              child: _thumbnail != null
                  ? Image.file(File(_thumbnail!.path), fit: BoxFit.cover)
                  : _thumbnailUrl != null
                  ? Image.network(
                      _thumbnailUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => _thumbnailPlaceholder(),
                    )
                  : _thumbnailPlaceholder(),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OutlinedButton.icon(
                  onPressed: _pickThumbnail,
                  icon: const Icon(Icons.photo_camera_outlined),
                  label: const Text('Choose image'),
                ),
                if (_thumbnail != null || _thumbnailUrl != null)
                  TextButton(
                    onPressed: () => setState(() {
                      _thumbnail = null;
                      _thumbnailUrl = null;
                    }),
                    child: const Text(
                      'Remove',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      const Text(
        'JPEG, PNG, WebP or GIF. Maximum 5 MB.',
        style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
      ),
    ],
  );
  Widget _thumbnailPlaceholder() => const ColoredBox(
    color: Color(0xFFF1F3F5),
    child: Center(
      child: Icon(Icons.image_outlined, color: Color(0xFF94A3B8), size: 30),
    ),
  );
  Future<void> _pickThumbnail() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
    if (image == null) return;
    final bytes = await image.length();
    if (bytes > 5 * 1024 * 1024) {
      _notify('Image size exceeds 5 MB');
      return;
    }
    setState(() => _thumbnail = image);
  }

  Widget _field(
    String label,
    TextEditingController controller, {
    int lines = 1,
    int? maxLength,
    bool numeric = false,
    String? Function(String?)? validator,
  }) => Padding(
    padding: const EdgeInsets.only(top: 14),
    child: TextFormField(
      controller: controller,
      maxLines: lines,
      maxLength: maxLength,
      keyboardType: numeric ? TextInputType.number : TextInputType.multiline,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        alignLabelWithHint: lines > 1,
      ),
    ),
  );
  Widget _dropdown<T>(
    String label,
    T? value,
    List<DropdownMenuItem<T>> items,
    ValueChanged<T?> changed, {
    String? Function(T?)? validator,
  }) => Padding(
    padding: const EdgeInsets.only(top: 14),
    child: DropdownButtonFormField<T>(
      initialValue: value,
      items: items,
      onChanged: changed,
      validator: validator,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    ),
  );
  Widget _stringListField(String title, List<String> values) => Padding(
    padding: const EdgeInsets.only(top: 18),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        Wrap(
          spacing: 6,
          children: [
            for (var i = 0; i < values.length; i++)
              InputChip(
                label: Text(values[i]),
                onDeleted: () => setState(() => values.removeAt(i)),
              ),
          ],
        ),
        TextButton.icon(
          onPressed: () => _addListItem(title, values),
          icon: const Icon(Icons.add),
          label: Text('Add ${title.toLowerCase()}'),
        ),
      ],
    ),
  );
  Future<void> _addListItem(String title, List<String> values) async {
    final controller = TextEditingController();
    final value = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add $title'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (value != null && value.isNotEmpty) setState(() => values.add(value));
    controller.dispose();
  }

  Future<void> _save({required bool draft, bool toggleDraft = false}) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final data = <String, dynamic>{
        'title': _title.text.trim(),
        'summary': _summary.text.trim(),
        'description': _description.text.trim(),
        'categoryId': _category,
        'type': _type,
        'level': _level,
        'language': _language,
        'minimumAge': int.parse(_minAge.text),
        'maximumAge': int.tryParse(_maxAge.text),
        'learningOutcomes': _outcomes,
        'requirements': _requirements,
        'isDraft': draft,
      };
      String courseId;
      if (_editing) {
        courseId = widget.courseId!;
        await ref
            .read(instructorCoursesRepositoryProvider)
            .updateCourse(courseId, data);
      } else {
        final course = await ref
            .read(instructorCoursesRepositoryProvider)
            .createCourse(data);
        courseId = course.id;
      }
      if (_thumbnail != null) {
        try {
          await ref
              .read(instructorCoursesRepositoryProvider)
              .uploadThumbnail(
                courseId,
                await _thumbnail!.readAsBytes(),
                _thumbnail!.name,
              );
        } catch (_) {
          _notify('Course saved, but thumbnail upload failed');
        }
      }
      ref.invalidate(instructorCoursesProvider);
      if (mounted) {
        _notify(
          _editing
              ? toggleDraft
                    ? (draft ? 'Course published' : 'Course saved as draft')
                    : 'Course updated successfully'
              : draft
              ? 'Draft saved successfully'
              : 'Course created successfully',
        );
        context.go('/instructor/courses');
      }
    } catch (error) {
      if (mounted) {
        _notify('Could not save course. Check the information and try again.');
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _notify(String message) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(message)));
}

class _CourseActionStrip extends StatelessWidget {
  const _CourseActionStrip({required this.course});
  final InstructorCourse course;
  @override
  Widget build(BuildContext context) {
    final id = course.id;
    final items = <(String, IconData, String)>[
      ('Details', Icons.edit_outlined, '/instructor/courses/$id/edit'),
      if (course.type == 'REGULAR')
        (
          'Materials',
          Icons.video_library_outlined,
          '/instructor/courses/$id/materials',
        ),
      if (course.type == 'ONLINE_CLASS')
        (
          'Batches',
          Icons.calendar_month_outlined,
          '/instructor/courses/$id/batches',
        ),
      ('Questions', Icons.help_outline, '/instructor/courses/$id/questions'),
      ('Exams', Icons.description_outlined, '/instructor/courses/$id/exams'),
      ('Students', Icons.people_outline, '/instructor/courses/$id/students'),
      if (course.type == 'ONLINE_CLASS')
        (
          'Assignments',
          Icons.assignment_outlined,
          '/instructor/courses/$id/assignments',
        ),
      ('View Course', Icons.visibility_outlined, '/courses/$id'),
    ];
    return SizedBox(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(right: 7),
              child: ActionChip(
                avatar: Icon(item.$2, size: 16),
                label: Text(item.$1),
                onPressed: () => context.go(item.$3),
              ),
            ),
        ],
      ),
    );
  }
}
