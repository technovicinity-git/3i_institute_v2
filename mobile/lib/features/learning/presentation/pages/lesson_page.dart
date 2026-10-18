import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:pdfx/pdfx.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../certificates/domain/certificate.dart';
import '../../../certificates/presentation/certificates_providers.dart';
import '../../../certificates/presentation/pages/certificates_page.dart';
import '../../../exams/presentation/exams_providers.dart';
import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/learning_models.dart';
import '../learning_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _navy = Color(0xFF12304E);
const _green = Color(0xFF22A146);

class LessonPage extends ConsumerStatefulWidget {
  const LessonPage({required this.courseId, required this.lessonId, super.key});
  final String courseId, lessonId;
  @override
  ConsumerState<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends ConsumerState<LessonPage> {
  final _noteController = TextEditingController();
  String _tab = 'overview';
  bool _noteLoaded = false,
      _saving = false,
      _noteSaved = false,
      _documentOpened = false,
      _documentCompleted = false;
  Timer? _documentTimer;
  @override
  void dispose() {
    _documentTimer?.cancel();
    _noteController.dispose();
    super.dispose();
  }

  void _refreshLearning(String profileId) {
    ref.invalidate(lessonProgressProvider('$profileId|${widget.lessonId}'));
    ref.invalidate(
      courseLearningContentProvider('${widget.courseId}|$profileId'),
    );
    ref.invalidate(enrolledCoursesProvider(profileId));
  }

  // Reloads the lesson list, video/document link, progress and note.
  Future<void> _reload(String profileId) async {
    ref
      ..invalidate(signedLessonUrlProvider(widget.lessonId))
      ..invalidate(lessonNoteProvider('$profileId|${widget.lessonId}'));
    _refreshLearning(profileId);
    try {
      await Future.wait([
        ref.read(
          courseLearningContentProvider('${widget.courseId}|$profileId').future,
        ),
        ref.read(signedLessonUrlProvider(widget.lessonId).future),
      ]);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.l10n.lessonReloadFailed),
          ),
        );
      }
    }
  }

  Future<void> _saveProgress(
    String profileId, {
    required int watched,
    required int position,
    bool completed = false,
  }) async {
    try {
      await ref
          .read(learningRepositoryProvider)
          .updateProgress(
            profileId,
            widget.lessonId,
            watchedSeconds: watched,
            lastPosition: position,
            completed: completed,
          );
      if (mounted) _refreshLearning(profileId);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.l10n.lessonProgressSaveFailed,
            ),
          ),
        );
      }
    }
  }

  void _startDocumentTimer(String profileId) {
    if (_documentTimer != null || _documentCompleted) return;
    _documentTimer = Timer(const Duration(seconds: 30), () async {
      await _saveProgress(profileId, watched: 30, position: 0, completed: true);
      if (mounted) setState(() => _documentCompleted = true);
    });
  }

  Future<void> _openDocument(String url, String profileId) async {
    if (url.isNotEmpty && mounted) {
      setState(() => _documentOpened = true);
      _startDocumentTimer(profileId);
    }
  }

  Future<void> _saveNote(String profileId) async {
    final content = _noteController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(context.l10n.lessonNoteEmpty)));
      return;
    }
    setState(() {
      _saving = true;
      _noteSaved = false;
    });
    try {
      await ref
          .read(learningRepositoryProvider)
          .saveNote(profileId, widget.lessonId, content);
      ref.invalidate(lessonNoteProvider('$profileId|${widget.lessonId}'));
      if (mounted) setState(() => _noteSaved = true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.l10n.lessonNoteSaveFailed),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return Scaffold(
        body: Center(child: Text(context.l10n.lessonSelectProfile)),
      );
    }
    final profileId = profile.id;
    final contentAsync = ref.watch(
      courseLearningContentProvider('${widget.courseId}|$profileId'),
    );
    final signedAsync = ref.watch(signedLessonUrlProvider(widget.lessonId));
    final progressAsync = ref.watch(
      lessonProgressProvider('$profileId|${widget.lessonId}'),
    );
    final noteAsync = ref.watch(
      lessonNoteProvider('$profileId|${widget.lessonId}'),
    );
    if (!_noteLoaded && noteAsync.hasValue) {
      _noteController.text = noteAsync.value!;
      _noteLoaded = true;
    }

    return contentAsync.when(
      loading: () => const Scaffold(
        backgroundColor: Color(0xFFFBF9F4),
        body: Center(child: CircularProgressIndicator(color: _navy)),
      ),
      error: (error, _) => Scaffold(
        backgroundColor: const Color(0xFFFBF9F4),
        appBar: AppBar(title: Text(context.l10n.lessonTitle)),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(context.l10n.lessonLoadFailed),
              TextButton(
                onPressed: () => ref.invalidate(
                  courseLearningContentProvider(
                    '${widget.courseId}|$profileId',
                  ),
                ),
                child: Text(context.l10n.commonTryAgain),
              ),
            ],
          ),
        ),
      ),
      data: (content) {
        final lessons = content.allLessons;
        final index = lessons.indexWhere((e) => e.id == widget.lessonId);
        final lesson = index >= 0 ? lessons[index] : null;
        if (lesson == null) {
          return Scaffold(
            backgroundColor: const Color(0xFFFBF9F4),
            appBar: AppBar(title: Text(context.l10n.lessonTitle)),
            body: Center(
              child: Text(context.l10n.lessonNotInCourse),
            ),
          );
        }
        final previous = index > 0 ? lessons[index - 1] : null;
        final next = index < lessons.length - 1 ? lessons[index + 1] : null;
        final courseUnlocked = content.progress >= 90;
        final progress = progressAsync.asData?.value ?? const LessonProgress();
        final signed = signedAsync.asData?.value;
        final isDocument = signed?.contentType.toLowerCase() == 'document';

        return Scaffold(
          backgroundColor: const Color(0xFFFBF9F4),
          appBar: AppBar(
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white,
            titleSpacing: 0,
            title: Text(
              content.courseTitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 16, color: _navy),
            ),
            actions: [
              IconButton(
                tooltip: context.l10n.lessonReload,
                onPressed: () => _reload(profileId),
                icon: const Icon(Icons.refresh, color: _navy),
              ),
              IconButton(
                tooltip: context.l10n.lessonCourseContent,
                onPressed: () =>
                    _showCourseContent(content, widget.courseId, lesson.id),
                icon: const Icon(Icons.format_list_bulleted, color: _navy),
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: RefreshIndicator(
            color: _navy,
            onRefresh: () => _reload(profileId),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: [
                _MediaPanel(
                  signedAsync: signedAsync,
                  isDocument: isDocument,
                  initialPosition: progress.lastPosition,
                  onProgress: (seconds, position, completed) => _saveProgress(
                    profileId,
                    watched: seconds,
                    position: position,
                    completed: completed,
                  ),
                  onRetryMedia: () =>
                      ref.invalidate(signedLessonUrlProvider(widget.lessonId)),
                  onDocumentOpen: signed == null
                      ? null
                      : () => _openDocument(signed.url, profileId),
                  documentOpened: _documentOpened,
                  documentCompleted: _documentCompleted,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: previous == null
                            ? null
                            : () => _goLesson(widget.courseId, previous.id),
                        icon: const Icon(Icons.chevron_left),
                        label: Text(context.l10n.lessonPrevious),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: next == null
                            ? null
                            : () => _goLesson(widget.courseId, next.id),
                        iconAlignment: IconAlignment.end,
                        icon: const Icon(Icons.chevron_right),
                        label: Text(context.l10n.lessonNext),
                        style: FilledButton.styleFrom(backgroundColor: _green),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  lesson.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: const Color(0xFF0C1F33),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 14,
                  runSpacing: 6,
                  children: [
                    Text(
                      context.l10n.lessonCourseName(content.courseTitle),
                      style: const TextStyle(
                        color: Color(0xFF475569),
                        fontSize: 13,
                      ),
                    ),
                    if (lesson.duration != null &&
                        lesson.type.toLowerCase() == 'video')
                      Text(
                        '◷ ${_formatDuration(lesson.duration!)}',
                        style: const TextStyle(
                          color: Color(0xFF475569),
                          fontSize: 13,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _TabButton(
                      text: context.l10n.lessonOverview,
                      selected: _tab == 'overview',
                      onTap: () => setState(() => _tab = 'overview'),
                    ),
                    const SizedBox(width: 22),
                    _TabButton(
                      text: context.l10n.lessonNotes,
                      selected: _tab == 'notes',
                      onTap: () => setState(() => _tab = 'notes'),
                    ),
                  ],
                ),
                const Divider(height: 1, color: Color(0xFFE3E8EF)),
                if (_tab == 'overview')
                  Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: Text(
                      lesson.description?.trim().isNotEmpty == true
                          ? lesson.description!
                          : context.l10n.lessonDefaultOverview,
                      style: const TextStyle(
                        height: 1.6,
                        color: Color(0xFF475569),
                      ),
                    ),
                  )
                else
                  Padding(
                    padding: const EdgeInsets.only(top: 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        TextField(
                          controller: _noteController,
                          minLines: 5,
                          maxLines: 10,
                          decoration: InputDecoration(
                            hintText: context.l10n.lessonNotesHint,
                            alignLabelWithHint: true,
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          onChanged: (_) {
                            if (_noteSaved) setState(() => _noteSaved = false);
                          },
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (_noteSaved)
                              Padding(
                                padding: EdgeInsets.only(right: 12),
                                child: Text(
                                  context.l10n.lessonSaved,
                                  style: TextStyle(color: _green),
                                ),
                              ),
                            FilledButton.icon(
                              onPressed: _saving
                                  ? null
                                  : () => _saveNote(profileId),
                              icon: _saving
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.save_outlined, size: 18),
                              label: Text(context.l10n.lessonSaveNote),
                              style: FilledButton.styleFrom(
                                backgroundColor: _navy,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 26),
                _ExamEligibilityCard(
                  progress: content.progress,
                  unlocked: courseUnlocked,
                  onTakeExam: () =>
                      context.push('/my-courses/${widget.courseId}/exams'),
                  footer: _CourseCertificateSection(
                    profileId: profileId,
                    courseId: widget.courseId,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _goLesson(String courseId, String lessonId) {
    _noteLoaded = false;
    _noteController.clear();
    _documentTimer?.cancel();
    _documentTimer = null;
    setState(() {
      _documentOpened = false;
      _documentCompleted = false;
    });
    context.go('/my-courses/$courseId/lessons/$lessonId');
  }

  void _showCourseContent(
    CourseLearningContent content,
    String courseId,
    String activeLessonId,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (sheetContext) => SafeArea(
        child: DraggableScrollableSheet(
          expand: false,
          initialChildSize: .75,
          maxChildSize: .95,
          builder: (context, controller) => Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 12, 14),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        context.l10n.lessonCourseContent,
                        style: Theme.of(
                          context,
                        ).textTheme.titleLarge?.copyWith(color: _navy),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 20),
                  children: [
                    for (final module in content.modules) ...[
                      Padding(
                        padding: const EdgeInsets.fromLTRB(8, 14, 8, 6),
                        child: Text(
                          module.title,
                          style: const TextStyle(
                            color: _navy,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      for (final lesson in module.lessons)
                        ListTile(
                          selected: lesson.id == activeLessonId,
                          selectedTileColor: const Color(0xFFF1F6F3),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(9),
                          ),
                          leading: Icon(
                            lesson.completed
                                ? Icons.check_circle
                                : lesson.type.toLowerCase() == 'video'
                                ? Icons.play_circle_outline
                                : Icons.description_outlined,
                            color: lesson.completed
                                ? _green
                                : const Color(0xFF64748B),
                          ),
                          title: Text(
                            lesson.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 14,
                              color: lesson.id == activeLessonId
                                  ? _green
                                  : _navy,
                            ),
                          ),
                          trailing: lesson.duration == null
                              ? null
                              : Text(
                                  _formatDuration(lesson.duration!),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                          onTap: () {
                            Navigator.pop(context);
                            if (lesson.id != activeLessonId) {
                              _goLesson(courseId, lesson.id);
                            }
                          },
                        ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MediaPanel extends StatelessWidget {
  const _MediaPanel({
    required this.signedAsync,
    required this.isDocument,
    required this.initialPosition,
    required this.onProgress,
    required this.onDocumentOpen,
    required this.onRetryMedia,
    required this.documentOpened,
    required this.documentCompleted,
  });
  final AsyncValue<SignedLessonUrl> signedAsync;
  final bool isDocument, documentOpened, documentCompleted;
  final int initialPosition;
  final void Function(int, int, bool) onProgress;
  final VoidCallback? onDocumentOpen;
  final VoidCallback onRetryMedia;
  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(12),
    child: isDocument
        ? SizedBox(
            height: MediaQuery.sizeOf(context).height * .68,
            child: ColoredBox(
              color: const Color(0xFFE9EDF2),
              child: Column(
                children: [
                  Expanded(
                    child: signedAsync.when(
                      loading: () => const Center(
                        child: CircularProgressIndicator(color: _navy),
                      ),
                      error: (_, _) => _MediaMessage(
                        icon: Icons.cloud_off_outlined,
                        text: context.l10n.lessonDocUnavailable,
                      ),
                      data: (media) => media.url.isEmpty
                          ? _MediaMessage(
                              icon: Icons.picture_as_pdf_outlined,
                              text: context.l10n.lessonDocUnavailable,
                            )
                          : _InlinePdfViewer(
                              url: media.url,
                              onOpened: onDocumentOpen,
                              onRetry: onRetryMedia,
                            ),
                    ),
                  ),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 9,
                    ),
                    color: const Color(0xFFFBF9F4),
                    child: Text(
                      documentCompleted
                          ? context.l10n.lessonMarkedComplete
                          : documentOpened
                          ? context.l10n.lessonReadOnlyKeepReading
                          : context.l10n.lessonReadOnlyPdf,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
        : AspectRatio(
            aspectRatio: 16 / 9,
            child: ColoredBox(
              color: const Color(0xFF111820),
              child: signedAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
                error: (_, _) => _MediaMessage(
                  icon: Icons.cloud_off_outlined,
                  text: context.l10n.lessonMediaUnavailable,
                ),
                data: (media) {
                  if (media.url.isEmpty) {
                    return _MediaMessage(
                      icon: Icons.hide_image_outlined,
                      text: context.l10n.lessonMediaUnavailable,
                    );
                  }
                  if (media.contentType.toLowerCase() == 'link') {
                    return _MediaMessage(
                      icon: Icons.open_in_new,
                      text: context.l10n.lessonOpenLinkTitle,
                      action: TextButton(
                        onPressed: () => launchUrl(
                          Uri.parse(media.url),
                          mode: LaunchMode.externalApplication,
                        ),
                        child: Text(context.l10n.lessonOpenLink),
                      ),
                    );
                  }
                  return _VideoLessonPlayer(
                    url: media.url,
                    referer: media.referer,
                    initialPosition: initialPosition,
                    onProgress: onProgress,
                    onRetry: onRetryMedia,
                  );
                },
              ),
            ),
          ),
  );
}

class _InlinePdfViewer extends ConsumerStatefulWidget {
  const _InlinePdfViewer({
    required this.url,
    required this.onOpened,
    required this.onRetry,
  });
  final String url;
  final VoidCallback? onOpened;
  final VoidCallback onRetry;

  @override
  ConsumerState<_InlinePdfViewer> createState() => _InlinePdfViewerState();
}

class _InlinePdfViewerState extends ConsumerState<_InlinePdfViewer> {
  late PdfController _controller;
  bool _opened = false;

  @override
  void initState() {
    super.initState();
    _controller = _createController(widget.url);
  }

  PdfController _createController(String url) =>
      PdfController(document: PdfDocument.openData(_fetchPdf(url)));

  Future<Uint8List> _fetchPdf(String url) async {
    // Learners get an API path (e.g. /materials/<id>/document) that streams
    // the PDF to the signed-in session; it needs the authenticated client.
    // Absolute URLs (instructor previews) are fetched directly.
    final isApiPath = !url.startsWith('http');
    final dio = isApiPath ? ref.read(apiClientProvider).dio : Dio();
    final response = await dio.get<List<int>>(
      url,
      options: Options(responseType: ResponseType.bytes),
    );
    final bytes = response.data;
    if (bytes == null || bytes.isEmpty) {
      throw const FormatException('The PDF file is empty.');
    }
    return Uint8List.fromList(bytes);
  }

  @override
  void didUpdateWidget(covariant _InlinePdfViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _controller.dispose();
      _opened = false;
      _controller = _createController(widget.url);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => PdfView(
    controller: _controller,
    scrollDirection: Axis.vertical,
    pageSnapping: false,
    onDocumentLoaded: (_) {
      if (_opened) return;
      _opened = true;
      widget.onOpened?.call();
    },
    builders: PdfViewBuilders<DefaultBuilderOptions>(
      options: const DefaultBuilderOptions(),
      documentLoaderBuilder: (_) =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      errorBuilder: (_, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.picture_as_pdf_outlined, color: _navy, size: 38),
              const SizedBox(height: 10),
              Text(
                context.l10n.lessonPdfFailed,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: widget.onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(context.l10n.lessonReloadPdf),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class _VideoLessonPlayer extends StatefulWidget {
  const _VideoLessonPlayer({
    required this.url,
    required this.referer,
    required this.initialPosition,
    required this.onProgress,
    required this.onRetry,
  });
  final String url;
  final String? referer;
  final int initialPosition;
  final void Function(int, int, bool) onProgress;
  final VoidCallback onRetry;
  @override
  State<_VideoLessonPlayer> createState() => _VideoLessonPlayerState();
}

class _VideoLessonPlayerState extends State<_VideoLessonPlayer> {
  VideoPlayerController? _controller;
  Timer? _timer;
  bool _initialized = false, _completionSent = false;
  String? _error;
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      final controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.url),
        formatHint: VideoFormat.hls,
        httpHeaders: widget.referer == null
            ? const <String, String>{}
            : {'Referer': widget.referer!},
      );
      _controller = controller;
      await controller.initialize();
      if (!mounted) return;
      if (controller.value.hasError) {
        throw StateError(
          controller.value.errorDescription ??
              'HLS stream initialization failed.',
        );
      }
      if (widget.initialPosition > 0) {
        await controller.seekTo(Duration(seconds: widget.initialPosition));
      }
      controller.addListener(_tick);
      _timer = Timer.periodic(const Duration(seconds: 5), (_) => _report());
      setState(() => _initialized = true);
    } catch (_) {
      if (mounted) {
        setState(() => _error = context.l10n.videoCheckConnection);
      }
    }
  }

  void _tick() {
    final c = _controller;
    if (c == null || !c.value.isInitialized || _completionSent) return;
    final d = c.value.duration.inSeconds;
    if (d > 0 && c.value.position.inSeconds >= d * .9) {
      _completionSent = true;
      _report(completed: true);
    }
    if (mounted) setState(() {});
  }

  void _report({bool completed = false}) {
    final c = _controller;
    if (c == null || !c.value.isInitialized) return;
    widget.onProgress(
      c.value.position.inSeconds,
      c.value.position.inSeconds,
      completed,
    );
  }

  @override
  void didUpdateWidget(covariant _VideoLessonPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _timer?.cancel();
      _controller?.removeListener(_tick);
      _controller?.dispose();
      _initialized = false;
      _completionSent = false;
      _initialize();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller?.removeListener(_tick);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return _MediaMessage(
        icon: Icons.error_outline,
        text: context.l10n.videoCouldNotPlay(_error!),
        action: TextButton.icon(
          onPressed: widget.onRetry,
          icon: const Icon(Icons.refresh, color: Colors.white),
          label: Text(context.l10n.commonTryAgain, style: const TextStyle(color: Colors.white)),
        ),
      );
    }
    final c = _controller;
    if (!_initialized || c == null) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
    final value = c.value;
    return Stack(
      alignment: Alignment.center,
      children: [
        VideoPlayer(c),
        IconButton.filled(
          onPressed: () => _togglePlayback(c),
          iconSize: 34,
          icon: Icon(value.isPlaying ? Icons.pause : Icons.play_arrow),
          style: IconButton.styleFrom(
            backgroundColor: Colors.black54,
            foregroundColor: Colors.white,
          ),
        ),
        Positioned(
          left: 10,
          right: 10,
          bottom: 2,
          child: Row(
            children: [
              Text(
                _formatDuration(value.position.inSeconds),
                style: const TextStyle(color: Colors.white, fontSize: 11),
              ),
              Expanded(
                child: VideoProgressIndicator(
                  c,
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
                style: const TextStyle(color: Colors.white, fontSize: 11),
              ),
            ],
          ),
        ),
        Positioned(
          left: 4,
          right: 4,
          bottom: 36,
          child: _VideoActionBar(controller: c, onFullscreen: _openFullscreen),
        ),
      ],
    );
  }

  Future<void> _openFullscreen() async {
    final controller = _controller;
    if (controller == null || !_initialized) return;
    await SystemChrome.setPreferredOrientations(const [
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    try {
      if (!mounted) return;
      // Root navigator so the page covers the learner layout's app bar/nav.
      await Navigator.of(context, rootNavigator: true).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => _FullscreenVideoPage(controller: controller),
        ),
      );
    } finally {
      await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      await SystemChrome.setPreferredOrientations(const []);
    }
  }

  Future<void> _togglePlayback(VideoPlayerController controller) async {
    try {
      if (controller.value.isPlaying) {
        await controller.pause();
      } else {
        await controller.play();
      }
    } catch (_) {
      if (mounted) {
        setState(() => _error = context.l10n.videoInterrupted);
      }
    }
  }
}

class _VideoActionBar extends StatefulWidget {
  const _VideoActionBar({required this.controller, this.onFullscreen});
  final VideoPlayerController controller;
  final VoidCallback? onFullscreen;

  @override
  State<_VideoActionBar> createState() => _VideoActionBarState();
}

class _VideoActionBarState extends State<_VideoActionBar> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_refresh);
  }

  @override
  void didUpdateWidget(covariant _VideoActionBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_refresh);
      widget.controller.addListener(_refresh);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_refresh);
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  Future<void> _seek(int seconds) async {
    final controller = widget.controller;
    final value = controller.value;
    final target = value.position.inSeconds + seconds;
    await controller.seekTo(
      Duration(seconds: target.clamp(0, value.duration.inSeconds).toInt()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final speed = widget.controller.value.playbackSpeed;
    return Row(
      children: [
        IconButton(
          tooltip: context.l10n.videoBack10,
          visualDensity: VisualDensity.compact,
          color: Colors.white,
          onPressed: () => _seek(-10),
          icon: const Icon(Icons.replay_10),
        ),
        IconButton(
          tooltip: context.l10n.videoForward10,
          visualDensity: VisualDensity.compact,
          color: Colors.white,
          onPressed: () => _seek(10),
          icon: const Icon(Icons.forward_10),
        ),
        const Spacer(),
        PopupMenuButton<double>(
          tooltip: context.l10n.videoSpeed,
          initialValue: speed,
          onSelected: widget.controller.setPlaybackSpeed,
          color: const Color(0xFF12304E),
          itemBuilder: (_) => [
            for (final rate in [0.5, 0.75, 1.0, 1.25, 1.5, 2.0])
              PopupMenuItem(
                value: rate,
                child: Text(
                  rate == 1 ? context.l10n.videoNormal : '${rate}x',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
          ],
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Text(
              '${speed}x',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        if (widget.onFullscreen != null)
          IconButton(
            tooltip: context.l10n.videoFullScreen,
            visualDensity: VisualDensity.compact,
            color: Colors.white,
            onPressed: widget.onFullscreen,
            icon: const Icon(Icons.fullscreen),
          ),
      ],
    );
  }
}

class _FullscreenVideoPage extends StatefulWidget {
  const _FullscreenVideoPage({required this.controller});
  final VideoPlayerController controller;

  @override
  State<_FullscreenVideoPage> createState() => _FullscreenVideoPageState();
}

class _FullscreenVideoPageState extends State<_FullscreenVideoPage> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_refresh);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_refresh);
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.black,
    body: Stack(
      alignment: Alignment.center,
      children: [
        Center(
          child: AspectRatio(
            aspectRatio: widget.controller.value.aspectRatio,
            child: VideoPlayer(widget.controller),
          ),
        ),
        IconButton.filled(
          tooltip: widget.controller.value.isPlaying ? context.l10n.videoPause : context.l10n.videoPlay,
          onPressed: () => widget.controller.value.isPlaying
              ? widget.controller.pause()
              : widget.controller.play(),
          iconSize: 38,
          style: IconButton.styleFrom(
            backgroundColor: Colors.black54,
            foregroundColor: Colors.white,
          ),
          icon: Icon(
            widget.controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
          ),
        ),
        Positioned(
          top: 8,
          left: 8,
          child: IconButton(
            tooltip: context.l10n.videoExitFullScreen,
            color: Colors.white,
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.fullscreen_exit),
          ),
        ),
        Positioned(
          left: 12,
          right: 12,
          bottom: 54,
          child: _VideoActionBar(controller: widget.controller),
        ),
        Positioned(
          left: 16,
          right: 16,
          bottom: 20,
          child: VideoProgressIndicator(
            widget.controller,
            allowScrubbing: true,
            colors: const VideoProgressColors(
              playedColor: _green,
              bufferedColor: Colors.white54,
              backgroundColor: Colors.white24,
            ),
          ),
        ),
      ],
    ),
  );
}

class _MediaMessage extends StatelessWidget {
  const _MediaMessage({required this.icon, required this.text, this.action});
  final IconData icon;
  final String text;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white70, size: 36),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white70),
          ),
        ),
        ?action,
      ],
    ),
  );
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.text,
    required this.selected,
    required this.onTap,
  });
  final String text;
  final bool selected;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.fromLTRB(2, 12, 2, 10),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: TextStyle(
              fontSize: 15,
              color: selected
                  ? const Color(0xFF157A34)
                  : const Color(0xFF475569),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 2,
            width: 70,
            color: selected ? const Color(0xFF157A34) : Colors.transparent,
          ),
        ],
      ),
    ),
  );
}

class _ExamEligibilityCard extends StatelessWidget {
  const _ExamEligibilityCard({
    required this.progress,
    required this.unlocked,
    required this.onTakeExam,
    this.footer,
  });
  final int progress;
  final bool unlocked;
  final VoidCallback onTakeExam;

  /// Shown below a divider at the bottom of the card (the certificate).
  final Widget? footer;

  static const _amber = Color(0xFFF59E0B);
  static const _ink = Color(0xFF0C1F33);
  static const _muted = Color(0xFF64748B);

  @override
  Widget build(BuildContext context) {
    final percent = progress.clamp(0, 100);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE3E8EF)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: (unlocked ? _green : _amber).withValues(alpha: .1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  unlocked
                      ? Icons.workspace_premium_outlined
                      : Icons.lock_outline,
                  size: 20,
                  color: unlocked ? _green : const Color(0xFFB45309),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.l10n.lessonCourseExam,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontFamily: 'serif',
                    color: _ink,
                    fontSize: 20,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            unlocked
                ? context.l10n.lessonExamUnlocked
                : context.l10n.lessonExamLocked(percent),
            style: const TextStyle(color: Color(0xFF475569), height: 1.4),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  context.l10n.lessonCourseProgress,
                  style: TextStyle(color: _muted, fontSize: 12),
                ),
              ),
              Text(
                '$percent%',
                style: const TextStyle(
                  color: _ink,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: percent / 100,
              minHeight: 8,
              backgroundColor: const Color(0xFFF1F5F9),
              color: unlocked ? _green : _amber,
              semanticsLabel: context.l10n.lessonCourseProgress,
              semanticsValue: '$percent%',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            unlocked
                ? context.l10n.lessonExamUnlockedShort
                : context.l10n.lessonExamUnlockHint,
            style: const TextStyle(color: _muted, fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 48,
            child: unlocked
                ? FilledButton.icon(
                    onPressed: onTakeExam,
                    icon: const Icon(Icons.description_outlined, size: 18),
                    label: Text(context.l10n.lessonTakeExam),
                    style: FilledButton.styleFrom(backgroundColor: _green),
                  )
                : FilledButton.icon(
                    onPressed: null,
                    icon: const Icon(Icons.lock_outline, size: 18),
                    label: Text(context.l10n.lessonLocked),
                    style: FilledButton.styleFrom(
                      disabledBackgroundColor: const Color(0xFFF3F4F6),
                      disabledForegroundColor: const Color(0xFF94A3B8),
                    ),
                  ),
          ),
          if (footer != null) ...[
            const SizedBox(height: 20),
            const Divider(height: 1, color: Color(0xFFE3E8EF)),
            const SizedBox(height: 20),
            footer!,
          ],
        ],
      ),
    );
  }
}

/// One-time course certificate (progress + last exam score), available
/// after the learner has attempted the course exam at least once.
class _CourseCertificateSection extends ConsumerStatefulWidget {
  const _CourseCertificateSection({
    required this.profileId,
    required this.courseId,
  });
  final String profileId, courseId;

  @override
  ConsumerState<_CourseCertificateSection> createState() =>
      _CourseCertificateSectionState();
}

class _CourseCertificateSectionState
    extends ConsumerState<_CourseCertificateSection> {
  static const _ink = Color(0xFF0C1F33);
  static const _muted = Color(0xFF64748B);

  bool _issuing = false;
  // Shown immediately after generating, before the refetch lands.
  LearnerCertificate? _issued;

  String get _key => '${widget.profileId}|${widget.courseId}';

  Future<void> _generate() async {
    if (_issuing) return;
    setState(() => _issuing = true);
    try {
      final certificate = await ref
          .read(certificatesRepositoryProvider)
          .issueExamCertificate(widget.profileId, widget.courseId);
      if (!mounted) return;
      setState(() => _issued = certificate);
      ref
        ..invalidate(examCertificateProvider(_key))
        ..invalidate(learnerCertificatesProvider(widget.profileId));
      await printCertificatePdf(context, certificate);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            apiErrorMessage(
              error,
              fallback:
                  context.l10n.lessonCertificateFailed,
            ),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _issuing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final certificateAsync = ref.watch(examCertificateProvider(_key));
    final exams = ref
        .watch(courseExamsProvider('${widget.courseId}|${widget.profileId}'))
        .asData
        ?.value;
    final hasExamAttempt = exams?.any((e) => e.attemptCount > 0) ?? false;
    final certificate = _issued ?? certificateAsync.asData?.value;

    if (certificate == null && certificateAsync.isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(8),
          child: SizedBox.square(
            dimension: 22,
            child: CircularProgressIndicator(strokeWidth: 2, color: _navy),
          ),
        ),
      );
    }

    if (certificate != null) return _buildIssued(context, certificate);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          context.l10n.lessonCourseCertificate,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: _ink,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          hasExamAttempt
              ? context.l10n.lessonCertificateHint
              : context.l10n.lessonCertificateLocked,
          style: const TextStyle(color: _muted, fontSize: 12, height: 1.4),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 48,
          child: OutlinedButton.icon(
            onPressed: hasExamAttempt && !_issuing ? _generate : null,
            icon: _issuing
                ? const SizedBox.square(
                    dimension: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Icon(
                    hasExamAttempt
                        ? Icons.workspace_premium_outlined
                        : Icons.lock_outline,
                    size: 18,
                  ),
            label: Text(_issuing ? context.l10n.lessonGenerating : context.l10n.lessonGenerateCertificate),
            style: OutlinedButton.styleFrom(
              foregroundColor: _navy,
              side: BorderSide(
                color: hasExamAttempt ? _navy : const Color(0xFFE3E8EF),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIssued(BuildContext context, LearnerCertificate certificate) {
    final details = certificate.details;
    final score = details?.score;
    final scoreText = details == null
        ? '—'
        : score == null
        ? context.l10n.lessonPending
        : '${_formatScore(score)}/${details.totalMarks}';

    Widget stat(String label, String value) => Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              letterSpacing: .4,
              color: _muted,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: _ink,
            ),
          ),
        ],
      ),
    );

    final attempt = details?.attemptNumber;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF9F4),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _green.withValues(alpha: .3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium, size: 34, color: _green),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.l10n.lessonCertificateGenerated,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: _ink,
                      ),
                    ),
                    if (certificate.issuedAt != null)
                      Text(
                        context.l10n.lessonIssuedOn(DateFormat.yMMMd().format(certificate.issuedAt!.toLocal())),
                        style: const TextStyle(fontSize: 12, color: _muted),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              stat(context.l10n.lessonCourseProgress, '${details?.progress ?? 0}%'),
              const SizedBox(width: 12),
              stat(context.l10n.lessonLastExamScore, scoreText),
            ],
          ),
          if (details?.examTitle?.isNotEmpty == true) ...[
            const SizedBox(height: 10),
            Text(
              context.l10n.lessonLatestAttempt(details!.examTitle!) +
              (attempt != null ? ' · ${context.l10n.lessonAttemptNumber(attempt)}' : ''),
              style: const TextStyle(fontSize: 12, color: _muted),
            ),
          ],
          const SizedBox(height: 12),
          Text.rich(
            TextSpan(
              text: '${context.l10n.lessonVerificationCode} ',
              children: [
                TextSpan(
                  text: certificate.verificationCode,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                    color: _ink,
                  ),
                ),
              ],
            ),
            style: const TextStyle(fontSize: 12, color: _muted),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: FilledButton.icon(
              onPressed: () => printCertificatePdf(context, certificate),
              icon: const Icon(Icons.picture_as_pdf_outlined, size: 18),
              label: Text(context.l10n.lessonDownloadPdf),
              style: FilledButton.styleFrom(backgroundColor: _navy),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatScore(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);

String _formatDuration(int seconds) {
  final duration = Duration(seconds: seconds);
  String two(int n) => n.toString().padLeft(2, '0');
  return duration.inHours > 0
      ? '${duration.inHours}:${two(duration.inMinutes.remainder(60))}:${two(duration.inSeconds.remainder(60))}'
      : '${duration.inMinutes}:${two(duration.inSeconds.remainder(60))}';
}
