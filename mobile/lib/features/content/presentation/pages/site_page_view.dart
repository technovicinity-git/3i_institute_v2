import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../content_providers.dart';
import '../widgets/simple_markdown.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../../core/format/date_format.dart';

/// A published info/legal page, e.g. the privacy policy.
class SitePageView extends ConsumerWidget {
  const SitePageView({required this.slug, super.key});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = ref.watch(sitePageProvider(slug));
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF12304E),
        elevation: 0,
        title: Text(page.asData?.value.title ?? ''),
      ),
      body: page.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.description_outlined,
                  size: 42,
                  color: Color(0xFF94A3B8),
                ),
                const SizedBox(height: 12),
                Text(context.l10n.pageUnavailable),
                TextButton(
                  onPressed: () => ref.invalidate(sitePageProvider(slug)),
                  child: Text(context.l10n.commonTryAgain),
                ),
              ],
            ),
          ),
        ),
        data: (content) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
          children: [
            Text(
              content.title,
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 26,
                color: Color(0xFF0C1F33),
              ),
            ),
            if (content.updatedAt != null) ...[
              const SizedBox(height: 6),
              Text(
                context.l10n.pageUpdated(formatDate(content.updatedAt!, DateStyle.longDate)),
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
            ],
            const SizedBox(height: 20),
            SimpleMarkdown(content.body),
          ],
        ),
      ),
    );
  }
}
