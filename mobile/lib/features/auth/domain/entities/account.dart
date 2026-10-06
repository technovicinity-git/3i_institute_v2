class Account {
  const Account({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.locale,
    required this.emailVerified,
    required this.role,
    this.avatarUrl,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String locale;
  final bool emailVerified;
  final String role;
  final String? avatarUrl;

  String get fullName => '$firstName $lastName'.trim();
}
