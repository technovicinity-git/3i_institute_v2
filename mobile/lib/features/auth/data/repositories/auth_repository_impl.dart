import '../../domain/entities/account.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remoteDataSource);

  final AuthRemoteDataSource _remoteDataSource;

  @override
  Future<Account?> restoreSession() async {
    final account = await _remoteDataSource.restoreSession();
    if (account != null && account.role != 'Account Holder') {
      await _remoteDataSource.logout();
      return null;
    }
    return account;
  }

  @override
  Future<Account> login({required String email, required String password}) async {
    final account = await _remoteDataSource.login(email: email, password: password);
    if (account.role != 'Account Holder') {
      await _remoteDataSource.logout();
      throw Exception('This app is for account holders. Please use an account holder login.');
    }
    return account;
  }

  @override
  Future<Account> loginWithGoogle({required String idToken, String? dateOfBirth}) async =>
      _requireAccountHolder(await _remoteDataSource.loginWithGoogle(idToken: idToken, dateOfBirth: dateOfBirth));

  @override
  Future<Account> loginWithApple({required String identityToken, String? dateOfBirth, String? firstName, String? lastName}) async =>
      _requireAccountHolder(await _remoteDataSource.loginWithApple(
        identityToken: identityToken,
        dateOfBirth: dateOfBirth,
        firstName: firstName,
        lastName: lastName,
      ));

  Future<Account> _requireAccountHolder(Account account) async {
    if (account.role != 'Account Holder') {
      await _remoteDataSource.logout();
      throw Exception('This app is for account holders. Please use an account holder login.');
    }
    return account;
  }

  @override
  Future<String> register({required String firstName, required String lastName, required String email, required String password, required String dateOfBirth, required String locale}) =>
      _remoteDataSource.register(firstName: firstName, lastName: lastName, email: email, password: password, dateOfBirth: dateOfBirth, locale: locale);

  @override
  Future<void> logout() => _remoteDataSource.logout();

  @override
  Future<void> forgotPassword(String email) => _remoteDataSource.forgotPassword(email);

  @override
  Future<void> resetPassword({required String token, required String password}) =>
      _remoteDataSource.resetPassword(token: token, password: password);

  @override
  Future<void> verifyEmail(String token) => _remoteDataSource.verifyEmail(token);

  @override
  Future<void> resendVerification(String email) => _remoteDataSource.resendVerification(email);
}
