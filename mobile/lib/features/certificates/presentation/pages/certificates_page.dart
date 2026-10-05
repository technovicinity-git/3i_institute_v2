import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart' as pdf;
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../profiles/presentation/providers/learner_profiles_providers.dart';
import '../../domain/certificate.dart';
import '../certificates_providers.dart';

const _navy = Color(0xFF12304E);
const _gold = Color(0xFFB8912F);

enum _CertificateFilter { all, attendance, completion, exam }

class CertificatesPage extends ConsumerStatefulWidget {
  const CertificatesPage({super.key});
  @override
  ConsumerState<CertificatesPage> createState() => _CertificatesPageState();
}

class _CertificatesPageState extends ConsumerState<CertificatesPage> {
  final _search = TextEditingController();
  _CertificateFilter _filter = _CertificateFilter.all;
  String? _expandedId;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(activeLearnerProfileProvider);
    if (profile == null) {
      return const Center(
        child: Text('Select a learner profile to view certificates.'),
      );
    }
    final key = profile.id;
    final certificatesAsync = ref.watch(learnerCertificatesProvider(key));
    return certificatesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: _navy)),
      error: (error, _) => _CertificateState(
        icon: Icons.cloud_off_outlined,
        title: 'Could not load your certificates',
        message: 'Check your connection and try again.',
        action: TextButton(
          onPressed: () => ref.invalidate(learnerCertificatesProvider(key)),
          child: const Text('Try again'),
        ),
      ),
      data: (certificates) {
        final query = _search.text.trim().toLowerCase();
        final filtered = certificates
            .where((certificate) {
              if (_filter != _CertificateFilter.all &&
                  !_matchesFilter(certificate, _filter)) {
                return false;
              }
              if (query.isEmpty) {
                return true;
              }
              return [
                certificate.courseTitle,
                certificate.learnerName,
                certificate.verificationCode,
                certificate.id,
                certificate.details?.examTitle ?? '',
              ].any((value) => value.toLowerCase().contains(query));
            })
            .toList(growable: false);
        return RefreshIndicator(
          color: _navy,
          onRefresh: () => ref.refresh(learnerCertificatesProvider(key).future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(18, 22, 18, 32),
            children: [
              const Text(
                'YOUR ACHIEVEMENTS',
                style: TextStyle(
                  fontSize: 10,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w700,
                  color: _gold,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                'My Certificates',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontFamily: 'serif',
                  color: const Color(0xFF0C1F33),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'View, verify, and save certificates from your courses.',
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 19),
              TextField(
                controller: _search,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search course, exam, or code...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _search.text.isEmpty
                      ? null
                      : IconButton(
                          onPressed: () {
                            _search.clear();
                            setState(() {});
                          },
                          icon: const Icon(Icons.close),
                        ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(11),
                    borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(11),
                    borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (final filter in _CertificateFilter.values) ...[
                      if (filter != _CertificateFilter.values.first)
                        const SizedBox(width: 8),
                      ChoiceChip(
                        label: Text(_filterName(filter)),
                        selected: _filter == filter,
                        onSelected: (_) => setState(() => _filter = filter),
                        selectedColor: const Color(0xFFEAF0F5),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _filter == filter
                              ? _navy
                              : const Color(0xFF64748B),
                        ),
                        side: BorderSide(
                          color: _filter == filter
                              ? _navy
                              : const Color(0xFFE3E8EF),
                        ),
                        showCheckmark: false,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 17),
              if (filtered.isEmpty)
                _CertificateState(
                  icon: Icons.workspace_premium_outlined,
                  title: certificates.isEmpty
                      ? 'No certificates yet'
                      : 'No certificates match',
                  message: certificates.isEmpty
                      ? 'Certificates you earn will appear here.'
                      : 'Try another search or certificate type.',
                  action: certificates.isEmpty
                      ? null
                      : TextButton(
                          onPressed: () {
                            _search.clear();
                            setState(() => _filter = _CertificateFilter.all);
                          },
                          child: const Text('Clear filters'),
                        ),
                )
              else ...[
                Text(
                  'Showing ${filtered.length} of ${certificates.length} certificates',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 10),
                ...filtered.map(
                  (certificate) => _CertificateCard(
                    certificate: certificate,
                    expanded: _expandedId == certificate.id,
                    onToggle: () => setState(
                      () => _expandedId = _expandedId == certificate.id
                          ? null
                          : certificate.id,
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({
    required this.certificate,
    required this.expanded,
    required this.onToggle,
  });
  final LearnerCertificate certificate;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final issued = certificate.issuedAt == null
        ? 'Date unavailable'
        : DateFormat.yMMMMd().format(certificate.issuedAt!);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(13),
        side: const BorderSide(color: Color(0xFFE3E8EF)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F3E8),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.workspace_premium_outlined,
                            size: 15,
                            color: _gold,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            _typeLabel(certificate.type),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF8A6A22),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.verified,
                      size: 16,
                      color: Color(0xFF22A146),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'Valid',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF22A146),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  certificate.courseTitle,
                  style: const TextStyle(
                    fontSize: 17,
                    color: Color(0xFF0C1F33),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    const Icon(
                      Icons.event_outlined,
                      size: 15,
                      color: Color(0xFF64748B),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'Issued $issued',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
                if (certificate.details?.examTitle?.isNotEmpty == true) ...[
                  const SizedBox(height: 8),
                  Text(
                    certificate.details!.examTitle!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF475569),
                    ),
                  ),
                  if (certificate.details!.score != null)
                    Text(
                      'Result ${_number(certificate.details!.score!)} / ${certificate.details!.totalMarks}${certificate.details!.passed == true ? '  •  Passed' : ''}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0C1F33),
                      ),
                    ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onToggle,
                        icon: Icon(
                          expanded
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          size: 17,
                        ),
                        label: Text(expanded ? 'Hide' : 'Preview'),
                      ),
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () =>
                            _printCertificate(context, certificate),
                        icon: const Icon(
                          Icons.picture_as_pdf_outlined,
                          size: 17,
                        ),
                        label: const Text('Save PDF'),
                        style: FilledButton.styleFrom(backgroundColor: _navy),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (expanded) _CertificatePreview(certificate: certificate),
        ],
      ),
    );
  }
}

class _CertificatePreview extends StatelessWidget {
  const _CertificatePreview({required this.certificate});
  final LearnerCertificate certificate;
  @override
  Widget build(BuildContext context) {
    final details = certificate.details;
    final issued = certificate.issuedAt == null
        ? 'Date unavailable'
        : DateFormat.yMMMMd().format(certificate.issuedAt!);
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFEFA),
        border: Border.all(color: _gold.withValues(alpha: .6), width: 2),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Column(
        children: [
          Text(
            certificate.issuerName ?? '3i International Islamic Institute',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              letterSpacing: 1.1,
              fontWeight: FontWeight.w700,
              color: Color(0xFF9A7624),
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 11),
            child: Divider(color: Color(0xFFD8C58E), height: 1),
          ),
          const Text(
            'CERTIFICATE OF ACHIEVEMENT',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              letterSpacing: .3,
              color: _navy,
            ),
          ),
          const SizedBox(height: 15),
          const Text(
            'Presented to',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Text(
            certificate.learnerName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 22,
              fontFamily: 'serif',
              color: Color(0xFF0C1F33),
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'For',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Text(
            certificate.courseTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0C1F33),
            ),
          ),
          if (details?.examTitle?.isNotEmpty == true) ...[
            const SizedBox(height: 9),
            Text(
              details!.examTitle!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
            ),
            if (details.score != null)
              Text(
                'Result: ${_number(details.score!)} / ${details.totalMarks}${details.passed == null
                    ? ''
                    : details.passed!
                    ? ' • Passed'
                    : ' • Not passed'}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
          ],
          if (details?.progress != null) ...[
            const SizedBox(height: 8),
            Text(
              'Course progress ${details!.progress}%',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
          const SizedBox(height: 12),
          Text(
            'Issued $issued',
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
          const Divider(color: Color(0xFFD8C58E), height: 24),
          Text(
            'Certificate ID  ${certificate.id}',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 9, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          SelectableText(
            'Verification code  ${certificate.verificationCode}',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: _navy,
            ),
          ),
          TextButton.icon(
            onPressed: () async {
              await Clipboard.setData(
                ClipboardData(text: certificate.verificationCode),
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Verification code copied')),
                );
              }
            },
            icon: const Icon(Icons.copy, size: 15),
            label: const Text('Copy code'),
          ),
        ],
      ),
    );
  }
}

class _CertificateState extends StatelessWidget {
  const _CertificateState({
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title, message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 14),
    padding: const EdgeInsets.all(26),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE3E8EF)),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        Icon(icon, size: 42, color: const Color(0xFFCBD5E1)),
        const SizedBox(height: 12),
        Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: Color(0xFF0C1F33),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        ?action,
      ],
    ),
  );
}

Future<void> _printCertificate(
  BuildContext context,
  LearnerCertificate certificate,
) async {
  final details = certificate.details;
  final date = certificate.issuedAt == null
      ? 'Date unavailable'
      : DateFormat.yMMMMd().format(certificate.issuedAt!);
  final document = pw.Document();
  document.addPage(
    pw.Page(
      pageFormat: pdf.PdfPageFormat.a4.landscape,
      margin: const pw.EdgeInsets.all(32),
      build: (_) => pw.Container(
        padding: const pw.EdgeInsets.all(28),
        decoration: pw.BoxDecoration(
          border: pw.Border.all(
            color: pdf.PdfColor.fromInt(0xFF12304E),
            width: 3,
          ),
        ),
        child: pw.Container(
          padding: const pw.EdgeInsets.all(22),
          decoration: pw.BoxDecoration(
            border: pw.Border.all(color: pdf.PdfColors.amber, width: 1),
          ),
          child: pw.Column(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            children: [
              pw.Text(
                certificate.issuerName ?? '3i International Islamic Institute',
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(
                  color: pdf.PdfColors.brown,
                  fontSize: 14,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 24),
              pw.Text(
                'CERTIFICATE OF ACHIEVEMENT',
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(
                  color: pdf.PdfColor.fromInt(0xFF12304E),
                  fontSize: 24,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text(
                'This certificate is proudly presented to',
                style: const pw.TextStyle(fontSize: 13),
              ),
              pw.SizedBox(height: 8),
              pw.Text(
                certificate.learnerName,
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(
                  fontSize: 28,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 15),
              pw.Text(
                'for completing',
                style: const pw.TextStyle(fontSize: 13),
              ),
              pw.SizedBox(height: 7),
              pw.Text(
                certificate.courseTitle,
                textAlign: pw.TextAlign.center,
                style: pw.TextStyle(
                  fontSize: 21,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              if (details?.examTitle?.isNotEmpty == true) ...[
                pw.SizedBox(height: 12),
                pw.Text(
                  details!.examTitle!,
                  textAlign: pw.TextAlign.center,
                  style: const pw.TextStyle(fontSize: 12),
                ),
                if (details.score != null)
                  pw.Text(
                    'Result: ${_number(details.score!)} / ${details.totalMarks}${details.passed == true ? ' — Passed' : ''}',
                    style: const pw.TextStyle(fontSize: 12),
                  ),
              ],
              if (details?.progress != null)
                pw.Padding(
                  padding: const pw.EdgeInsets.only(top: 9),
                  child: pw.Text(
                    'Course progress at issuance: ${details!.progress}%',
                    style: const pw.TextStyle(fontSize: 11),
                  ),
                ),
              pw.SizedBox(height: 18),
              pw.Text('Issued: $date', style: const pw.TextStyle(fontSize: 11)),
              pw.SizedBox(height: 5),
              pw.Text(
                'Certificate ID: ${certificate.id}',
                style: const pw.TextStyle(fontSize: 9),
              ),
              pw.Text(
                'Verification code: ${certificate.verificationCode}',
                style: const pw.TextStyle(fontSize: 9),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  try {
    final filename =
        '${certificate.courseTitle}-${certificate.verificationCode}'
            .replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '-')
            .toLowerCase();
    await Printing.layoutPdf(
      name: '$filename.pdf',
      onLayout: (_) async => document.save(),
    );
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open PDF preview.')),
      );
    }
  }
}

bool _matchesFilter(
  LearnerCertificate certificate,
  _CertificateFilter filter,
) => switch (filter) {
  _CertificateFilter.all => true,
  _CertificateFilter.attendance => certificate.type == 'ATTENDANCE',
  _CertificateFilter.completion => certificate.type == 'COMPLETION',
  _CertificateFilter.exam => certificate.type == 'EXAM',
};
String _filterName(_CertificateFilter filter) => switch (filter) {
  _CertificateFilter.all => 'All types',
  _CertificateFilter.attendance => 'Attendance',
  _CertificateFilter.completion => 'Completion',
  _CertificateFilter.exam => 'Exam',
};
String _typeLabel(String type) => switch (type) {
  'ATTENDANCE' => 'Attendance',
  'EXAM' => 'Exam',
  _ => 'Course completion',
};
String _number(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(1);
