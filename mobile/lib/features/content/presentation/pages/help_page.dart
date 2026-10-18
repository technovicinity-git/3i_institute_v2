import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../data/content_repository.dart';
import '../content_providers.dart';
import '../../../../core/l10n/l10n.dart';

const _ink = Color(0xFF0C1F33);
const _muted = Color(0xFF64748B);
const _border = Color(0xFFE3E8EF);
const _gold = Color(0xFFB8912F);

/// FAQ, contact details and policy links.
class HelpPage extends ConsumerStatefulWidget {
  const HelpPage({super.key});
  @override
  ConsumerState<HelpPage> createState() => _HelpPageState();
}

class _HelpPageState extends ConsumerState<HelpPage> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final faq = ref.watch(faqProvider);
    final contact = ref.watch(contactInfoProvider).asData?.value;
    final pages = ref.watch(publishedPagesProvider).asData?.value ?? const [];

    final q = _query.trim().toLowerCase();
    final items = (faq.asData?.value ?? const <FaqEntry>[])
        .where(
          (f) =>
              q.isEmpty ||
              f.question.toLowerCase().contains(q) ||
              f.answer.toLowerCase().contains(q),
        )
        .toList();
    final categories = <String, List<FaqEntry>>{};
    for (final item in items) {
      categories.putIfAbsent(item.category, () => []).add(item);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF12304E),
        elevation: 0,
        title: Text(context.l10n.helpTitle),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref
            ..invalidate(faqProvider)
            ..invalidate(contactInfoProvider)
            ..invalidate(publishedPagesProvider);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 40),
          children: [
            Text(
              context.l10n.helpFaq,
              style: TextStyle(fontFamily: 'serif', fontSize: 22, color: _ink),
            ),
            const SizedBox(height: 12),
            TextField(
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: context.l10n.helpSearch,
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                isDense: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: _border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: _border),
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (faq.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 30),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (categories.isEmpty)
              Text(
                q.isNotEmpty
                    ? context.l10n.helpNoMatch(_query)
                    : context.l10n.helpNone,
                style: const TextStyle(color: _muted),
              )
            else
              for (final entry in categories.entries) ...[
                Padding(
                  padding: const EdgeInsets.only(top: 6, bottom: 8),
                  child: Text(
                    entry.key.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: _muted,
                      letterSpacing: .5,
                    ),
                  ),
                ),
                Container(
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: _border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      for (final (i, item) in entry.value.indexed) ...[
                        if (i > 0) const Divider(height: 1, color: _border),
                        Theme(
                          data: Theme.of(
                            context,
                          ).copyWith(dividerColor: Colors.transparent),
                          child: ExpansionTile(
                            title: Text(
                              item.question,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _ink,
                              ),
                            ),
                            childrenPadding: const EdgeInsets.fromLTRB(
                              16,
                              0,
                              16,
                              14,
                            ),
                            expandedAlignment: Alignment.centerLeft,
                            children: [
                              Text(
                                item.answer,
                                style: const TextStyle(
                                  fontSize: 13,
                                  height: 1.5,
                                  color: Color(0xFF475569),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],
            if (contact != null && !contact.isEmpty) ...[
              const SizedBox(height: 14),
              Text(
                context.l10n.helpContactUs,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 22,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 10),
              _ContactCard(contact: contact),
            ],
            if (pages.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                context.l10n.helpPolicies,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 22,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: _border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    for (final (i, page) in pages.indexed) ...[
                      if (i > 0) const Divider(height: 1, color: _border),
                      ListTile(
                        title: Text(
                          page.title,
                          style: const TextStyle(fontSize: 14, color: _ink),
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/pages/${page.slug}'),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({required this.contact});
  final SiteContactInfo contact;

  @override
  Widget build(BuildContext context) {
    final rows = [
      if (contact.email.isNotEmpty)
        (
          Icons.mail_outline,
          contact.email,
          Uri(scheme: 'mailto', path: contact.email),
        ),
      if (contact.phone.isNotEmpty)
        (
          Icons.phone_outlined,
          contact.phone,
          Uri(
            scheme: 'tel',
            path: contact.phone.replaceAll(RegExp(r'[^\d+]'), ''),
          ),
        ),
      if (contact.supportHours.isNotEmpty)
        (Icons.schedule, contact.supportHours, null),
      if (contact.address.isNotEmpty)
        (Icons.place_outlined, contact.address, null),
    ];
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          for (final (i, row) in rows.indexed) ...[
            if (i > 0) const Divider(height: 1, color: _border),
            ListTile(
              leading: Icon(row.$1, color: _gold),
              title: Text(
                row.$2,
                style: const TextStyle(fontSize: 14, color: _ink),
              ),
              onTap: row.$3 == null
                  ? null
                  : () => launchUrl(
                      row.$3!,
                      mode: LaunchMode.externalApplication,
                    ),
            ),
          ],
        ],
      ),
    );
  }
}
