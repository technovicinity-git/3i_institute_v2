import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pdfx/pdfx.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/network/api_error_message.dart';
import '../../domain/entities/instructor_material.dart';
import '../providers/instructor_courses_providers.dart';
import '../widgets/course_action_strip.dart';

const _navy = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _green = Color(0xFF22A146);
const _blue = Color(0xFF2563EB);
const _purple = Color(0xFF7C3AED);
const _gold = Color(0xFFB8912F);

const _maxDocumentBytes = 50 * 1024 * 1024;
const _maxVideoBytes = 4 * 1024 * 1024 * 1024;

class InstructorMaterialsPage extends ConsumerStatefulWidget {
  const InstructorMaterialsPage({required this.courseId, super.key});
  final String courseId;
  @override
  ConsumerState<InstructorMaterialsPage> createState() =>
      _InstructorMaterialsPageState();
}

class _InstructorMaterialsPageState
    extends ConsumerState<InstructorMaterialsPage> {
  final _search = TextEditingController();
  String _filter = 'all';
  String? _openingId;
  bool _deleting = false;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final materials = ref.watch(instructorMaterialsProvider(widget.courseId));
    final course = ref
        .watch(instructorCoursesProvider)
        .asData
        ?.value
        .where((c) => c.id == widget.courseId)
        .firstOrNull;
    final items = materials.asData?.value ?? const <InstructorMaterial>[];
    final videoCount = items.where((m) => m.type == 'video').length;
    final docCount = items.where((m) => m.type == 'document').length;
    final query = _search.text.trim().toLowerCase();
    final filtered = items
        .where(
          (m) =>
              m.title.toLowerCase().contains(query) &&
              (_filter == 'all' || m.type == _filter),
        )
        .toList();

    return RefreshIndicator(
      onRefresh: () =>
          ref.refresh(instructorMaterialsProvider(widget.courseId).future),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: () => context.go('/instructor/courses'),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to courses'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          if (course != null) CourseActionStrip(course: course),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Course Materials',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 27,
                    color: _navy,
                  ),
                ),
              ),
              FilledButton.icon(
                onPressed: _chooseUpload,
                style: FilledButton.styleFrom(backgroundColor: _green),
                icon: const Icon(Icons.upload),
                label: const Text('Upload'),
              ),
            ],
          ),
          Text(
            '${items.length} materials • $videoCount videos • $docCount documents',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 16),
          ...materials.when(
            loading: () => const [
              Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(child: CircularProgressIndicator()),
              ),
            ],
            error: (_, _) => [
              _MaterialsMessage(
                icon: Icons.error_outline,
                iconColor: Colors.red,
                text: 'Failed to load materials',
                action: TextButton(
                  onPressed: () => ref.invalidate(
                    instructorMaterialsProvider(widget.courseId),
                  ),
                  child: const Text('Tap to retry'),
                ),
              ),
            ],
            data: (_) => [
              if (items.isEmpty)
                const _MaterialsMessage(
                  icon: Icons.video_library_outlined,
                  text:
                      'No materials yet. Upload your first video or document.',
                )
              else ...[
                Row(
                  children: [
                    Expanded(
                      child: _StatTile(
                        icon: Icons.videocam_outlined,
                        color: _blue,
                        value: videoCount,
                        label: 'Videos',
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _StatTile(
                        icon: Icons.description_outlined,
                        color: _purple,
                        value: docCount,
                        label: 'Documents',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _search,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search materials...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _search.text.isEmpty
                        ? null
                        : IconButton(
                            tooltip: 'Clear search',
                            icon: const Icon(Icons.close),
                            onPressed: () => setState(_search.clear),
                          ),
                    filled: true,
                    fillColor: Colors.white,
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _border),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  children: [
                    for (final (value, label) in const [
                      ('all', 'All Types'),
                      ('video', 'Videos'),
                      ('document', 'Documents'),
                    ])
                      ChoiceChip(
                        label: Text(label),
                        selected: _filter == value,
                        onSelected: (_) => setState(() => _filter = value),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (filtered.isEmpty)
                  const _MaterialsMessage(
                    icon: Icons.search,
                    text: 'No materials match your search.',
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: _border),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: Column(
                      children: [
                        for (var i = 0; i < filtered.length; i++) ...[
                          if (i > 0) const Divider(height: 1, color: _border),
                          _MaterialRow(
                            index: i,
                            material: filtered[i],
                            opening: _openingId == filtered[i].id,
                            onEdit: () => _edit(filtered[i]),
                            onPreview: () => _preview(filtered[i]),
                            onDelete: _deleting
                                ? null
                                : () => _delete(filtered[i]),
                          ),
                        ],
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _chooseUpload() async {
    final type = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Upload Material',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: _navy,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Choose what you would like to upload.',
                style: TextStyle(color: _muted),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _UploadOption(
                      icon: Icons.description_outlined,
                      color: _purple,
                      title: 'Document',
                      subtitle: 'PDF — max 50MB',
                      onTap: () => Navigator.pop(context, 'document'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _UploadOption(
                      icon: Icons.videocam_outlined,
                      color: _green,
                      title: 'Video',
                      subtitle: 'MP4 — max 4GB',
                      onTap: () => Navigator.pop(context, 'video'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    if (type == null || !mounted) return;
    context.push(
      '/instructor/courses/${widget.courseId}/materials/upload?type=$type',
    );
  }

  Future<void> _edit(InstructorMaterial material) async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _EditMaterialSheet(material: material),
    );
    if (saved == true) {
      ref.invalidate(instructorMaterialsProvider(widget.courseId));
      _notify('Material updated');
    }
  }

  Future<void> _delete(InstructorMaterial material) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete material?'),
        content: Text('Delete "${material.title}"? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    setState(() => _deleting = true);
    try {
      await ref
          .read(instructorCoursesRepositoryProvider)
          .deleteMaterial(material.id);
      ref.invalidate(instructorMaterialsProvider(widget.courseId));
      _notify('Material deleted');
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to delete material'));
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  Future<void> _preview(InstructorMaterial material) async {
    if (material.type != 'video' && material.type != 'document') {
      _notify('Preview not available for ${material.type}');
      return;
    }
    setState(() => _openingId = material.id);
    try {
      final media = await ref
          .read(instructorCoursesRepositoryProvider)
          .getMaterialMedia(material.id);
      if (!mounted) return;
      final isPdf = (media.mimeType ?? 'application/pdf') == 'application/pdf';
      if (material.type == 'document' && !isPdf) {
        await launchUrl(
          Uri.parse(media.url),
          mode: LaunchMode.externalApplication,
        );
        return;
      }
      await Navigator.of(context, rootNavigator: true).push<void>(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => material.type == 'video'
              ? _VideoPreviewPage(title: material.title, media: media)
              : _DocumentPreviewPage(title: material.title, url: media.url),
        ),
      );
    } catch (error) {
      _notify(
        apiErrorMessage(
          error,
          fallback: material.type == 'video'
              ? 'Failed to load video'
              : 'Failed to load document',
        ),
      );
    } finally {
      if (mounted) setState(() => _openingId = null);
    }
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _MaterialRow extends StatelessWidget {
  const _MaterialRow({
    required this.index,
    required this.material,
    required this.opening,
    required this.onEdit,
    required this.onPreview,
    required this.onDelete,
  });
  final int index;
  final InstructorMaterial material;
  final bool opening;
  final VoidCallback onEdit, onPreview;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _typeIcon(material.type);
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
      child: Row(
        children: [
          SizedBox(
            width: 26,
            child: Text(
              '${index + 1}'.padLeft(2, '0'),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: _gold,
              ),
            ),
          ),
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFF9F6F0),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  material.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: _navy,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  material.type == 'video'
                      ? '${material.type.toUpperCase()} • ${_formatDuration(material.duration)}'
                      : material.type.toUpperCase(),
                  style: const TextStyle(fontSize: 11, color: _muted),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Edit',
            onPressed: onEdit,
            color: _blue,
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.edit_outlined, size: 20),
          ),
          IconButton(
            tooltip: 'Preview',
            onPressed: opening ? null : onPreview,
            color: _green,
            visualDensity: VisualDensity.compact,
            icon: opening
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Icon(
                    material.type == 'video'
                        ? Icons.play_arrow_rounded
                        : Icons.visibility_outlined,
                    size: 20,
                  ),
          ),
          IconButton(
            tooltip: 'Delete',
            onPressed: onDelete,
            color: Colors.red,
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.delete_outline, size: 20),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });
  final IconData icon;
  final Color color;
  final int value;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: color.withValues(alpha: .1),
            borderRadius: BorderRadius.circular(9),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$value',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: _navy,
              ),
            ),
            Text(label, style: const TextStyle(fontSize: 11, color: _muted)),
          ],
        ),
      ],
    ),
  );
}

class _UploadOption extends StatelessWidget {
  const _UploadOption({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final Color color;
  final String title, subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white,
    shape: RoundedRectangleBorder(
      side: const BorderSide(color: _border, width: 2),
      borderRadius: BorderRadius.circular(13),
    ),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(13),
      splashColor: color.withValues(alpha: .08),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 8),
        child: Column(
          children: [
            CircleAvatar(
              radius: 26,
              backgroundColor: color.withValues(alpha: .1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
            ),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: _muted)),
          ],
        ),
      ),
    ),
  );
}

class _MaterialsMessage extends StatelessWidget {
  const _MaterialsMessage({
    required this.icon,
    required this.text,
    this.iconColor = const Color(0xFFCBD5E1),
    this.action,
  });
  final IconData icon;
  final Color iconColor;
  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(28),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _border),
      borderRadius: BorderRadius.circular(13),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: iconColor),
        const SizedBox(height: 10),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _muted),
        ),
        ?action,
      ],
    ),
  );
}

class _EditMaterialSheet extends ConsumerStatefulWidget {
  const _EditMaterialSheet({required this.material});
  final InstructorMaterial material;
  @override
  ConsumerState<_EditMaterialSheet> createState() => _EditMaterialSheetState();
}

class _EditMaterialSheetState extends ConsumerState<_EditMaterialSheet> {
  late final _title = TextEditingController(text: widget.material.title);
  late final _description = TextEditingController(
    text: widget.material.description ?? '',
  );
  late final _order = TextEditingController(text: '${widget.material.order}');
  bool _saving = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _order.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
    child: SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Edit Material',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: _navy,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _title,
              enabled: !_saving,
              maxLength: 255,
              decoration: const InputDecoration(
                labelText: 'Title *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _description,
              enabled: !_saving,
              minLines: 3,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Overview / Description',
                hintText: 'Brief overview of this lesson...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _order,
              enabled: !_saving,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Order',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _saving ? null : () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    icon: const Icon(Icons.save_outlined, size: 18),
                    label: Text(_saving ? 'Saving...' : 'Save Changes'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );

  Future<void> _save() async {
    final title = _title.text.trim();
    final order = int.tryParse(_order.text.trim());
    if (title.isEmpty) return _notify('Title is required');
    if (order == null || order < 0) {
      return _notify('Order must be a whole number of 0 or more');
    }
    final description = _description.text.trim();
    setState(() => _saving = true);
    try {
      await ref.read(instructorCoursesRepositoryProvider).updateMaterial(
        widget.material.id,
        {
          'title': title,
          // The materials list doesn't return descriptions, so only send one
          // the instructor actually typed rather than wiping the saved one.
          if (description.isNotEmpty) 'description': description,
          'order': order,
        },
      );
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to update material'));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _notify(String text) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
}

class InstructorMaterialUploadPage extends ConsumerStatefulWidget {
  const InstructorMaterialUploadPage({
    required this.courseId,
    required this.type,
    super.key,
  });
  final String courseId;

  /// Either `video` or `document`.
  final String type;
  @override
  ConsumerState<InstructorMaterialUploadPage> createState() =>
      _InstructorMaterialUploadPageState();
}

class _InstructorMaterialUploadPageState
    extends ConsumerState<InstructorMaterialUploadPage> {
  final _title = TextEditingController(),
      _description = TextEditingController(),
      _order = TextEditingController(text: '0');
  PlatformFile? _file, _captions;
  int? _fileSize;
  bool _uploading = false;
  double _progress = 0;

  bool get _isVideo => widget.type == 'video';
  Color get _accent => _isVideo ? _green : _purple;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _order.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit =
        !_uploading && _file != null && _title.text.trim().isNotEmpty;
    return PopScope(
      canPop: !_uploading,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _notify("Please wait — don't leave while the file uploads.");
        }
      },
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextButton.icon(
            onPressed: _uploading ? null : () => context.pop(),
            icon: const Icon(Icons.chevron_left),
            label: const Text('Back to materials'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          Text(
            _isVideo ? 'Upload Video' : 'Upload Document',
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 28,
              color: _navy,
            ),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _title,
            enabled: !_uploading,
            maxLength: 255,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              labelText: _isVideo ? 'Video Title *' : 'Document Title *',
              hintText: _isVideo
                  ? 'e.g. Introduction to Prophetic Medicine'
                  : 'e.g. Chapter 1 Notes',
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _description,
            enabled: !_uploading,
            minLines: 3,
            maxLines: 5,
            decoration: InputDecoration(
              labelText: 'Overview / Description (optional)',
              hintText: _isVideo
                  ? 'Brief overview of this lesson for the course page...'
                  : 'Brief description of this document...',
              helperText: _isVideo
                  ? 'This will appear on the course details page.'
                  : null,
              alignLabelWithHint: true,
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          _FilePickerField(
            label: _isVideo
                ? 'Video File * (MP4, max 4GB)'
                : 'Document File * (PDF — max 50MB)',
            icon: _isVideo ? Icons.videocam_outlined : Icons.picture_as_pdf,
            accent: _accent,
            fileName: _file?.name,
            detail: _fileSize == null ? null : _formatSize(_fileSize!),
            onPick: _uploading ? null : _pickMain,
            onClear: _uploading
                ? null
                : () => setState(() {
                    _file = null;
                    _fileSize = null;
                  }),
          ),
          if (_isVideo) ...[
            const SizedBox(height: 12),
            _FilePickerField(
              label: 'Caption File (VTT/SRT)',
              icon: Icons.closed_caption_outlined,
              accent: _accent,
              fileName: _captions?.name,
              onPick: _uploading ? null : _pickCaptions,
              onClear: _uploading
                  ? null
                  : () => setState(() => _captions = null),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _order,
            enabled: !_uploading,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Order',
              border: OutlineInputBorder(),
            ),
          ),
          if (_uploading) ...[
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: Text(
                    _progress >= 1
                        ? 'Processing upload...'
                        : _isVideo
                        ? 'Uploading to Bunny Stream...'
                        : 'Uploading document...',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: _navy,
                    ),
                  ),
                ),
                Text(
                  '${(_progress * 100).round()}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: _progress >= 1 ? null : _progress,
                minHeight: 8,
                color: _accent,
                backgroundColor: const Color(0xFFF1F5F9),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "Please don't close the app while the file uploads.",
              style: TextStyle(fontSize: 11, color: _muted),
            ),
          ],
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _uploading ? null : () => context.pop(),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: canSubmit ? _upload : null,
                  style: FilledButton.styleFrom(backgroundColor: _accent),
                  icon: Icon(
                    _isVideo ? Icons.upload : Icons.upload_file,
                    size: 18,
                  ),
                  label: Text(
                    _uploading
                        ? 'Uploading...'
                        : _isVideo
                        ? 'Upload Video'
                        : 'Upload Document',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _pickMain() async {
    try {
      final file = _isVideo
          ? await FilePicker.pickFile(type: FileType.video)
          : await FilePicker.pickFile(
              type: FileType.custom,
              allowedExtensions: const ['pdf'],
            );
      if (file == null) return;
      final size = file.lengthSync() ?? await file.length();
      if (size == null || size == 0) {
        return _notify('The selected file is empty or could not be read.');
      }
      if (_isVideo) {
        if (size > _maxVideoBytes) return _notify('Video must be under 4GB.');
      } else {
        if (size > _maxDocumentBytes) {
          return _notify('Document must be under 50MB.');
        }
        final header = await file
            .readAsByteStream()
            .expand((c) => c)
            .take(5)
            .toList();
        if (String.fromCharCodes(header) != '%PDF-') {
          return _notify('The selected file is not a valid PDF.');
        }
      }
      setState(() {
        _file = file;
        _fileSize = size;
      });
    } catch (_) {
      _notify('Could not open the selected file.');
    }
  }

  Future<void> _pickCaptions() async {
    try {
      // Custom extensions like .vtt/.srt have no reliable MIME mapping on
      // Android, so pick any file and validate the extension here.
      final file = await FilePicker.pickFile();
      if (file == null) return;
      final ext = file.extension?.toLowerCase();
      if (ext != 'vtt' && ext != 'srt') {
        return _notify('Captions must be a .vtt or .srt file.');
      }
      setState(() => _captions = file);
    } catch (_) {
      _notify('Could not open the selected file.');
    }
  }

  Future<void> _upload() async {
    final file = _file, size = _fileSize;
    final title = _title.text.trim();
    final order = int.tryParse(_order.text.trim());
    if (file == null || size == null) {
      return _notify(
        _isVideo ? 'Please select a video file' : 'Please select a document',
      );
    }
    if (title.isEmpty) {
      return _notify(
        _isVideo
            ? 'Please enter a video title'
            : 'Please enter a document title',
      );
    }
    if (order == null || order < 0) {
      return _notify('Order must be a whole number of 0 or more');
    }
    setState(() {
      _uploading = true;
      _progress = 0;
    });
    final repository = ref.read(instructorCoursesRepositoryProvider);
    void onProgress(int sent, int total) {
      if (!mounted || total <= 0) return;
      setState(() => _progress = (sent / total).clamp(0, 1).toDouble());
    }

    try {
      if (_isVideo) {
        final captions = _captions;
        await repository.uploadVideo(
          courseId: widget.courseId,
          title: title,
          description: _description.text.trim(),
          order: order,
          duration: await _readVideoDuration(file),
          video: _uploadFile(file, size, _videoMimeType(file.extension)),
          captions: captions == null
              ? null
              : _uploadFile(
                  captions,
                  captions.lengthSync() ?? await captions.length() ?? 0,
                  captions.extension?.toLowerCase() == 'vtt'
                      ? 'text/vtt'
                      : 'application/x-subrip',
                ),
          onProgress: onProgress,
        );
      } else {
        await repository.uploadDocument(
          courseId: widget.courseId,
          title: title,
          description: _description.text.trim(),
          order: order,
          document: _uploadFile(file, size, 'application/pdf'),
          onProgress: onProgress,
        );
      }
      ref.invalidate(instructorMaterialsProvider(widget.courseId));
      if (!mounted) return;
      _notify(_isVideo ? 'Video uploaded successfully' : 'Document uploaded');
      setState(() => _uploading = false);
      context.pop();
    } catch (error) {
      if (!mounted) return;
      setState(() => _uploading = false);
      _notify(
        apiErrorMessage(
          error,
          fallback: _isVideo
              ? 'Failed to upload video'
              : 'Failed to upload document',
        ),
      );
    }
  }

  MaterialUploadFile _uploadFile(PlatformFile file, int size, String mime) =>
      MaterialUploadFile(
        name: file.name,
        length: size,
        mimeType: mime,
        openRead: file.readAsByteStream,
      );

  /// Reads the duration from the local file so the course page can show it
  /// immediately. The backend falls back to Bunny's value if this is null.
  Future<int?> _readVideoDuration(PlatformFile file) async {
    final path = file.path;
    if (path == null) return null;
    final controller = VideoPlayerController.file(File(path));
    try {
      await controller.initialize();
      final seconds = controller.value.duration.inSeconds;
      return seconds > 0 ? seconds : null;
    } catch (_) {
      return null;
    } finally {
      await controller.dispose();
    }
  }

  void _notify(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _FilePickerField extends StatelessWidget {
  const _FilePickerField({
    required this.label,
    required this.icon,
    required this.accent,
    required this.fileName,
    required this.onPick,
    required this.onClear,
    this.detail,
  });
  final String label;
  final IconData icon;
  final Color accent;
  final String? fileName, detail;
  final VoidCallback? onPick, onClear;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        label,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 6),
      Material(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: _border),
          borderRadius: BorderRadius.circular(8),
        ),
        child: InkWell(
          onTap: onPick,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Icon(icon, color: fileName == null ? _muted : accent),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fileName ?? 'Tap to choose a file',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: fileName == null ? _muted : _navy,
                          fontWeight: fileName == null
                              ? FontWeight.normal
                              : FontWeight.w600,
                        ),
                      ),
                      if (detail != null)
                        Text(
                          detail!,
                          style: TextStyle(fontSize: 11, color: accent),
                        ),
                    ],
                  ),
                ),
                if (fileName != null)
                  IconButton(
                    tooltip: 'Remove file',
                    onPressed: onClear,
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.close, size: 18),
                  ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}

class _VideoPreviewPage extends StatefulWidget {
  const _VideoPreviewPage({required this.title, required this.media});
  final String title;
  final InstructorMaterialMedia media;
  @override
  State<_VideoPreviewPage> createState() => _VideoPreviewPageState();
}

class _VideoPreviewPageState extends State<_VideoPreviewPage> {
  late final VideoPlayerController _controller;
  bool _ready = false, _failed = false;

  @override
  void initState() {
    super.initState();
    final referer = widget.media.referer;
    _controller = VideoPlayerController.networkUrl(
      Uri.parse(widget.media.url),
      formatHint: VideoFormat.hls,
      httpHeaders: referer == null ? const {} : {'Referer': referer},
    )..addListener(_refresh);
    _controller
        .initialize()
        .then((_) {
          if (!mounted) return;
          setState(() => _ready = true);
          _controller.play();
        })
        .catchError((Object _) {
          if (mounted) setState(() => _failed = true);
        });
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_refresh);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final value = _controller.value;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(widget.title, overflow: TextOverflow.ellipsis),
      ),
      body: Center(
        child: _failed || value.hasError
            ? const Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'Video could not be played. It may still be processing — try again shortly.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70),
                ),
              )
            : !_ready
            ? const CircularProgressIndicator(color: Colors.white)
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AspectRatio(
                    aspectRatio: value.aspectRatio,
                    child: GestureDetector(
                      onTap: _toggle,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          VideoPlayer(_controller),
                          if (!value.isPlaying)
                            const CircleAvatar(
                              radius: 30,
                              backgroundColor: Colors.black54,
                              child: Icon(
                                Icons.play_arrow,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                    child: Row(
                      children: [
                        IconButton(
                          tooltip: value.isPlaying ? 'Pause' : 'Play',
                          color: Colors.white,
                          onPressed: _toggle,
                          icon: Icon(
                            value.isPlaying ? Icons.pause : Icons.play_arrow,
                          ),
                        ),
                        Text(
                          _formatDuration(value.position.inSeconds),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                        Expanded(
                          child: VideoProgressIndicator(
                            _controller,
                            allowScrubbing: true,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 12,
                            ),
                            colors: const VideoProgressColors(
                              playedColor: _green,
                              bufferedColor: Colors.white54,
                              backgroundColor: Colors.white24,
                            ),
                          ),
                        ),
                        Text(
                          _formatDuration(value.duration.inSeconds),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _toggle() =>
      _controller.value.isPlaying ? _controller.pause() : _controller.play();
}

class _DocumentPreviewPage extends StatefulWidget {
  const _DocumentPreviewPage({required this.title, required this.url});
  final String title, url;
  @override
  State<_DocumentPreviewPage> createState() => _DocumentPreviewPageState();
}

class _DocumentPreviewPageState extends State<_DocumentPreviewPage> {
  late PdfController _controller = _createController();

  PdfController _createController() =>
      PdfController(document: PdfDocument.openData(_fetchPdf()));

  Future<Uint8List> _fetchPdf() async {
    final response = await Dio().get<List<int>>(
      widget.url,
      options: Options(responseType: ResponseType.bytes),
    );
    final bytes = response.data;
    if (bytes == null || bytes.isEmpty) {
      throw const FormatException('The PDF file is empty.');
    }
    return Uint8List.fromList(bytes);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.title,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16),
          ),
          const Text(
            'Read-only preview',
            style: TextStyle(fontSize: 11, color: _muted),
          ),
        ],
      ),
      actions: [
        IconButton(
          tooltip: 'Open externally',
          onPressed: () => launchUrl(
            Uri.parse(widget.url),
            mode: LaunchMode.externalApplication,
          ),
          icon: const Icon(Icons.open_in_new),
        ),
      ],
    ),
    body: PdfView(
      controller: _controller,
      scrollDirection: Axis.vertical,
      pageSnapping: false,
      builders: PdfViewBuilders<DefaultBuilderOptions>(
        options: const DefaultBuilderOptions(),
        documentLoaderBuilder: (_) =>
            const Center(child: CircularProgressIndicator()),
        errorBuilder: (_, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.picture_as_pdf_outlined, size: 38),
                const SizedBox(height: 10),
                const Text(
                  'This PDF could not be displayed. Check your connection and try again.',
                  textAlign: TextAlign.center,
                ),
                TextButton.icon(
                  onPressed: () => setState(() {
                    _controller.dispose();
                    _controller = _createController();
                  }),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reload PDF'),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

(IconData, Color) _typeIcon(String type) => switch (type) {
  'video' => (Icons.videocam_outlined, _blue),
  'document' => (Icons.description_outlined, _purple),
  'audio' => (Icons.music_note_outlined, _green),
  'link' => (Icons.link, _gold),
  _ => (Icons.description_outlined, _muted),
};

String _formatDuration(int? seconds) {
  if (seconds == null || seconds <= 0) return '--:--';
  return '${seconds ~/ 60}:${(seconds % 60).toString().padLeft(2, '0')}';
}

String _formatSize(int bytes) {
  final mb = bytes / (1024 * 1024);
  return mb >= 1024
      ? '${(mb / 1024).toStringAsFixed(2)} GB'
      : '${mb.toStringAsFixed(1)} MB';
}

String _videoMimeType(String? extension) => switch (extension?.toLowerCase()) {
  'mov' => 'video/quicktime',
  'webm' => 'video/webm',
  'mkv' => 'video/x-matroska',
  'avi' => 'video/x-msvideo',
  'm4v' => 'video/x-m4v',
  _ => 'video/mp4',
};
