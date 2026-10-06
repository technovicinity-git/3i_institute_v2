import '../../domain/entities/account.dart';

class AccountModel extends Account {
  const AccountModel({
    required super.id,
    required super.firstName,
    required super.lastName,
    required super.email,
    required super.locale,
    required super.emailVerified,
    required super.role,
    super.avatarUrl,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) => AccountModel(
    id: json['id'] as String? ?? '',
    firstName: json['firstName'] as String? ?? '',
    lastName: json['lastName'] as String? ?? '',
    email: json['email'] as String? ?? '',
    locale: json['locale'] as String? ?? 'en',
    emailVerified: json['emailVerified'] as bool? ?? false,
    role: _roleName(json['role']),
    avatarUrl: _avatarUrl(json['avatarUrl']),
  );

  static String? _avatarUrl(Object? value) =>
      value is String && value.trim().isNotEmpty ? value.trim() : null;

  static String _roleName(Object? role) {
    if (role is String) return role;
    if (role is Map<String, dynamic>) return role['name'] as String? ?? '';
    return '';
  }
}
