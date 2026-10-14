abstract final class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://threei-institute-v2.onrender.com/api/v1',
  );

  /// Public website origin used for shareable course links and certificate
  /// verification URLs. Override per build with
  /// `--dart-define=WEB_BASE_URL=https://example.com`.
  static const webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'https://threei-institute-v2-1.onrender.com',
  );

  static String get socketBaseUrl {
    const configured = String.fromEnvironment('SOCKET_BASE_URL');
    if (configured.isNotEmpty) return configured;
    return Uri.parse(apiBaseUrl).replace(path: '/', query: '').toString();
  }

  /// The backend's **web** OAuth client ID (`GOOGLE_CLIENT_ID`). Android asks
  /// Google for an ID token issued to this ID so the API accepts it. Client
  /// IDs are public, so a default is safe to ship. The iOS client ID lives in
  /// `ios/Flutter/GoogleSignIn.xcconfig`.
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue:
        '922079022580-ogulm9oa60ve83chpiqq61nnkot34hn7.apps.googleusercontent.com',
  );
}
