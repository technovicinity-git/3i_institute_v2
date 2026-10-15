import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_error_message.dart';
import '../providers/subscription_providers.dart';

const _ink = Color(0xff0c1f33);
const _muted = Color(0xff475569);
const _green = Color(0xff22a146);
const _border = Color(0xffe3e8ef);
const _otherMethod = 'Other';
const _maxImageBytes = 5 * 1024 * 1024;

/// Opens the form where the account holder submits a manual payment.
/// Returns true when a request was submitted.
Future<bool> showApplySubscriptionSheet(
  BuildContext context, {
  required ProfileSubscription profile,
  required PaymentSettings payment,
}) async {
  final submitted = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: Colors.white,
    builder: (_) => _ApplySheet(profile: profile, payment: payment),
  );
  return submitted ?? false;
}

class _ApplySheet extends ConsumerStatefulWidget {
  const _ApplySheet({required this.profile, required this.payment});
  final ProfileSubscription profile;
  final PaymentSettings payment;

  @override
  ConsumerState<_ApplySheet> createState() => _ApplySheetState();
}

class _ApplySheetState extends ConsumerState<_ApplySheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _amount;
  final _transactionId = TextEditingController();
  final _sender = TextEditingController();
  final _note = TextEditingController();
  late String _method;
  DateTime _paidAt = DateTime.now();
  Uint8List? _proofPreview;
  String? _proofUrl;
  bool _uploading = false;
  bool _submitting = false;

  // An approved waiver is applied automatically by the server
  int get _discount => widget.profile.waiverPercent ?? 0;
  bool get _fullyWaived => _discount >= 100;
  double get _amountDue =>
      discountedPrice(widget.payment.monthlyPrice, _discount);

  @override
  void initState() {
    super.initState();
    _method = widget.payment.accounts.isNotEmpty
        ? widget.payment.accounts.first.label
        : _otherMethod;
    _amount = TextEditingController(text: _amountDue.toStringAsFixed(2));
  }

  @override
  void dispose() {
    _amount.dispose();
    _transactionId.dispose();
    _sender.dispose();
    _note.dispose();
    super.dispose();
  }

  void _notify(String message) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(message)));

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _paidAt,
      firstDate: now.subtract(const Duration(days: 90)),
      lastDate: now,
    );
    if (picked != null) setState(() => _paidAt = picked);
  }

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
      if (mounted) {
        setState(() {
          _proofPreview = bytes;
          _proofUrl = url;
        });
      }
    } catch (error) {
      _notify(apiErrorMessage(error, fallback: 'Failed to upload the image'));
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final actions = ref.read(subscriptionActionsProvider);
      if (_fullyWaived) {
        await actions.apply(
          learnerProfileId: widget.profile.id,
          note: _note.text.trim(),
        );
      } else {
        await actions.apply(
          learnerProfileId: widget.profile.id,
          paymentMethod: _method,
          amount: double.parse(_amount.text.trim()),
          transactionId: _transactionId.text.trim(),
          // Noon local time so the date doesn't shift across timezones
          paidAt: DateTime(_paidAt.year, _paidAt.month, _paidAt.day, 12),
          senderAccount: _sender.text.trim(),
          note: _note.text.trim(),
          proofImageUrl: _proofUrl,
        );
      }
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      _notify(
        apiErrorMessage(error, fallback: 'Failed to submit your payment'),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  InputDecoration _decoration(String label, {String? hint}) => InputDecoration(
    labelText: label,
    hintText: hint,
    border: const OutlineInputBorder(),
    enabledBorder: const OutlineInputBorder(
      borderSide: BorderSide(color: _border),
    ),
  );

  @override
  Widget build(BuildContext context) {
    final payment = widget.payment;
    final profile = widget.profile;
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
                  '${profile.isSubscribed ? 'Renew' : 'Apply for'} ${profile.displayName}’s subscription',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontFamily: 'serif',
                    color: _ink,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _fullyWaived
                      ? '${profile.displayName}’s fee waiver covers the whole '
                            'month, so no payment is needed. An admin will '
                            'approve it and subscribe ${profile.displayName} '
                            'for one month.'
                      : 'Enter the details of your '
                            '${formatMoney(_amountDue, payment.currency)} '
                            'payment. An admin will check it and subscribe '
                            '${profile.displayName} for one month.',
                  style: const TextStyle(color: _muted, fontSize: 13),
                ),
                if (_discount > 0) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _green.withValues(alpha: .1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _green.withValues(alpha: .3)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.discount_outlined,
                          size: 20,
                          color: Color(0xff157a34),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _fullyWaived
                                ? '$_discount% fee waiver applied. Nothing to pay this month.'
                                : '$_discount% fee waiver applied: '
                                      '${formatMoney(payment.monthlyPrice, payment.currency)} → '
                                      '${formatMoney(_amountDue, payment.currency)}. '
                                      'It’s used once this subscription is approved.',
                            style: const TextStyle(fontSize: 13, color: _ink),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                if (!_fullyWaived) ...[
                  DropdownButtonFormField<String>(
                    initialValue: _method,
                    isExpanded: true,
                    decoration: _decoration('Paid to'),
                    items: [
                      for (final account in payment.accounts)
                        DropdownMenuItem(
                          value: account.label,
                          child: Text(
                            '${account.label} · ${account.accountNumber}',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      const DropdownMenuItem(
                        value: _otherMethod,
                        child: Text('Other'),
                      ),
                    ],
                    onChanged: (value) =>
                        setState(() => _method = value ?? _otherMethod),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _amount,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: _decoration(
                            'Amount (${payment.currency})',
                          ),
                          validator: (value) {
                            final amount = double.tryParse(value?.trim() ?? '');
                            return amount == null || amount <= 0
                                ? 'Enter the amount paid'
                                : null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: InkWell(
                          onTap: _pickDate,
                          child: InputDecorator(
                            decoration: _decoration('Payment date'),
                            child: Text(DateFormat.yMMMd().format(_paidAt)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _transactionId,
                    maxLength: 100,
                    textCapitalization: TextCapitalization.characters,
                    decoration: _decoration(
                      'Transaction ID / reference',
                      hint: 'e.g. 9KD7X2LQ1P',
                    ),
                    validator: (value) => (value?.trim().length ?? 0) < 3
                        ? 'Enter the transaction ID'
                        : null,
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _sender,
                    maxLength: 100,
                    decoration: _decoration(
                      'Paid from (optional)',
                      hint: 'Your account or mobile number',
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                TextFormField(
                  controller: _note,
                  maxLength: 1000,
                  maxLines: 2,
                  decoration: _decoration('Note (optional)'),
                ),
                if (!_fullyWaived) ...[
                  const SizedBox(height: 8),
                  const Text(
                    'Payment screenshot / receipt (optional)',
                    style: TextStyle(fontWeight: FontWeight.w600, color: _ink),
                  ),
                  const SizedBox(height: 8),
                  if (_proofPreview != null)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              _proofPreview!,
                              height: 130,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -10,
                            right: -10,
                            child: IconButton.filledTonal(
                              tooltip: 'Remove image',
                              iconSize: 16,
                              onPressed: () => setState(() {
                                _proofPreview = null;
                                _proofUrl = null;
                              }),
                              icon: const Icon(Icons.close),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    OutlinedButton.icon(
                      onPressed: _uploading ? null : _pickImage,
                      icon: _uploading
                          ? const SizedBox.square(
                              dimension: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.add_photo_alternate_outlined),
                      label: Text(_uploading ? 'Uploading...' : 'Add image'),
                    ),
                ],
                const SizedBox(height: 22),
                SizedBox(
                  height: 50,
                  child: FilledButton(
                    onPressed: _submitting || _uploading ? null : _submit,
                    style: FilledButton.styleFrom(backgroundColor: _green),
                    child: _submitting
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(_fullyWaived ? 'Submit' : 'Submit payment'),
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
