import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/subscription_providers.dart';

const _ink = Color(0xff0c1f33);
const _muted = Color(0xff475569);
const _green = Color(0xff22a146);
const _border = Color(0xffe3e8ef);
const _maxImages = 3;
const _maxImageBytes = 5 * 1024 * 1024;
const _minExplanation = 20;

/// Opens the form where the account holder asks for a fee waiver.
/// Returns true when a request was sent.
Future<bool> showWaiverRequestSheet(
  BuildContext context, {
  required ProfileSubscription profile,
}) async {
  final sent = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: Colors.white,
    builder: (_) => _WaiverSheet(profile: profile),
  );
  return sent ?? false;
}

class _UploadedImage {
  const _UploadedImage(this.bytes, this.url);
  final Uint8List bytes;
  final String url;
}

class _WaiverSheet extends ConsumerStatefulWidget {
  const _WaiverSheet({required this.profile});
  final ProfileSubscription profile;

  @override
  ConsumerState<_WaiverSheet> createState() => _WaiverSheetState();
}

class _WaiverSheetState extends ConsumerState<_WaiverSheet> {
  final _formKey = GlobalKey<FormState>();
  final _explanation = TextEditingController();
  final List<_UploadedImage> _images = [];
  bool _uploading = false;
  bool _sending = false;

  @override
  void dispose() {
    _explanation.dispose();
    super.dispose();
  }

  void _notify(String message) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(message)));

  Future<void> _pickImage() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (image == null) return;
    if (await image.length() > _maxImageBytes) {
      _notify('Image must be 5 MB or smaller');
      return;
    }
    final bytes = await image.readAsBytes();
    setState(() => _uploading = true);
    try {
      final url = await ref
          .read(subscriptionActionsProvider)
          .uploadProof(bytes, image.name, image.mimeType);
      if (mounted) setState(() => _images.add(_UploadedImage(bytes, url)));
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to upload the image'));
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _sending = true);
    try {
      await ref
          .read(subscriptionActionsProvider)
          .applyWaiver(
            learnerProfileId: widget.profile.id,
            explanation: _explanation.text.trim(),
            evidenceFiles: [for (final image in _images) image.url],
          );
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      _notify(
        apiErrorMessage(error, fallback: 'Failed to send the waiver request'),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    final left = profile.waiverApplicationsLeft;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Request a fee waiver for ${profile.displayName}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontFamily: 'serif',
                    color: _ink,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'If paying the full fee is difficult, tell us about your '
                  'situation. If approved, you’ll get 25–100% off '
                  '${profile.displayName}’s next one-month subscription, to '
                  'use within 30 days.',
                  style: const TextStyle(color: _muted, fontSize: 13),
                ),
                const SizedBox(height: 18),
                TextFormField(
                  controller: _explanation,
                  maxLines: 5,
                  maxLength: 3000,
                  decoration: const InputDecoration(
                    labelText: 'Your situation',
                    alignLabelWithHint: true,
                    hintText:
                        'e.g. family income, number of children studying, '
                        'recent changes in circumstances…',
                    border: OutlineInputBorder(),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: _border),
                    ),
                  ),
                  validator: (value) =>
                      (value?.trim().length ?? 0) < _minExplanation
                      ? 'Please write at least $_minExplanation characters'
                      : null,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Supporting documents (optional, up to $_maxImages images)',
                  style: TextStyle(fontWeight: FontWeight.w600, color: _ink),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    for (final image in _images)
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              image.bytes,
                              width: 84,
                              height: 84,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -10,
                            right: -10,
                            child: IconButton.filledTonal(
                              tooltip: 'Remove image',
                              iconSize: 14,
                              onPressed: () =>
                                  setState(() => _images.remove(image)),
                              icon: const Icon(Icons.close),
                            ),
                          ),
                        ],
                      ),
                    if (_images.length < _maxImages)
                      SizedBox(
                        width: 84,
                        height: 84,
                        child: OutlinedButton(
                          onPressed: _uploading ? null : _pickImage,
                          style: OutlinedButton.styleFrom(
                            padding: EdgeInsets.zero,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: _uploading
                              ? const SizedBox.square(
                                  dimension: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.add_photo_alternate_outlined),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  'You can request $left more ${left == 1 ? 'time' : 'times'} '
                  'for ${profile.displayName} in the next 12 months.',
                  style: const TextStyle(fontSize: 12, color: _muted),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 50,
                  child: FilledButton(
                    onPressed: _sending || _uploading ? null : _send,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    child: _sending
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Send request'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
