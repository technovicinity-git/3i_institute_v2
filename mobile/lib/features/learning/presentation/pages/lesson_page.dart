import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:pdfx/pdfx.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/learning_models.dart';
import '../learning_providers.dart';

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
          const SnackBar(
            content: Text(
              'Progress could not be saved. It will retry next time.',
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
      ).showSnackBar(const SnackBar(content: Text('Note cannot be empty.')));
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
          const SnackBar(
            content: Text('Could not save note. Please try again.'),
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
      return const Scaffold(
        body: Center(child: Text('Select a learner profile to continue.')),
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
        appBar: AppBar(title: const Text('Lesson')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Could not load course lessons.'),
              TextButton(
                onPressed: () => ref.invalidate(
                  courseLearningContentProvider(
                    '${widget.courseId}|$profileId',
                  ),
                ),
                child: const Text('Try again'),
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
            appBar: AppBar(title: const Text('Lesson')),
            body: const Center(
              child: Text('This lesson is not part of the course.'),
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
                tooltip: 'Course content',
                onPressed: () =>
                    _showCourseContent(content, widget.courseId, lesson.id),
                icon: const Icon(Icons.format_list_bulleted, color: _navy),
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: ListView(
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
                      label: const Text('Previous'),
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
                      label: const Text('Next'),
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
                    'Course: ${content.courseTitle}',
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
                    text: 'Overview',
                    selected: _tab == 'overview',
                    onTap: () => setState(() => _tab = 'overview'),
                  ),
                  const SizedBox(width: 22),
                  _TabButton(
                    text: 'Notes',
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
                        : 'Continue through this lesson, then use the course content button to move between topics.',
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
                          hintText: 'Write your notes for this lesson...',
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
                            const Padding(
                              padding: EdgeInsets.only(right: 12),
                              child: Text(
                                'Saved',
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
                            label: const Text('Save note'),
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
              ),
            ],
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
                        'Course content',
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
                      error: (_, _) => const _MediaMessage(
                        icon: Icons.cloud_off_outlined,
                        text: 'Document unavailable',
                      ),
                      data: (media) => media.url.isEmpty
                          ? const _MediaMessage(
                              icon: Icons.picture_as_pdf_outlined,
                              text: 'Document unavailable',
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
                          ? 'Lesson marked complete'
                          : documentOpened
                          ? 'Read-only preview • Keep reading to complete this lesson'
                          : 'Read-only PDF preview',
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
                error: (_, _) => const _MediaMessage(
                  icon: Icons.cloud_off_outlined,
                  text: 'Lesson media unavailable',
                ),
                data: (media) {
                  if (media.url.isEmpty) {
                    return const _MediaMessage(
                      icon: Icons.hide_image_outlined,
                      text: 'Lesson media unavailable',
                    );
                  }
                  if (media.contentType.toLowerCase() == 'link') {
                    return _MediaMessage(
                      icon: Icons.open_in_new,
                      text: 'Open the lesson link',
                      action: TextButton(
                        onPressed: () => launchUrl(
                          Uri.parse(media.url),
                          mode: LaunchMode.externalApplication,
                        ),
                        child: const Text('Open link'),
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

class _InlinePdfViewer extends StatefulWidget {
  const _InlinePdfViewer({
    required this.url,
    required this.onOpened,
    required this.onRetry,
  });
  final String url;
  final VoidCallback? onOpened;
  final VoidCallback onRetry;

  @override
  State<_InlinePdfViewer> createState() => _InlinePdfViewerState();
}

class _InlinePdfViewerState extends State<_InlinePdfViewer> {
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
    final response = await Dio().get<List<int>>(
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
              const Text(
                'This PDF could not be displayed. Check your connection and try again.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: widget.onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Reload PDF'),
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
        setState(() => _error = 'Check your connection, then try again.');
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
        text: 'Video could not be played. ${_error!}',
        action: TextButton.icon(
          onPressed: widget.onRetry,
          icon: const Icon(Icons.refresh, color: Colors.white),
          label: const Text('Try again', style: TextStyle(color: Colors.white)),
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
      ],
    );
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
        setState(() => _error = 'Playback was interrupted. Please try again.');
      }
    }
  }
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
  const _ExamEligibilityCard({required this.progress, required this.unlocked});
  final int progress;
  final bool unlocked;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Row(
      children: [
        Icon(
          unlocked ? Icons.workspace_premium_outlined : Icons.lock_outline,
          color: unlocked ? _green : const Color(0xFF94A3B8),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Course exam',
                style: TextStyle(color: _navy, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 3),
              Text(
                unlocked
                    ? 'Exam eligibility unlocked'
                    : 'Complete 90% of the course to unlock (${progress.clamp(0, 100)}%)',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              ),
            ],
          ),
        ),
        if (!unlocked)
          const Text(
            '90%',
            style: TextStyle(color: _navy, fontWeight: FontWeight.w700),
          ),
      ],
    ),
  );
}

String _formatDuration(int seconds) {
  final duration = Duration(seconds: seconds);
  String two(int n) => n.toString().padLeft(2, '0');
  return duration.inHours > 0
      ? '${duration.inHours}:${two(duration.inMinutes.remainder(60))}:${two(duration.inSeconds.remainder(60))}'
      : '${duration.inMinutes}:${two(duration.inSeconds.remainder(60))}';
}
