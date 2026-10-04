class Account {
  const Account({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.locale,
    required this.emailVerified,
    required this.role,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String locale;
  final bool emailVerified;
  final String role;

  String get fullName => '$firstName $lastName'.trim();
}
