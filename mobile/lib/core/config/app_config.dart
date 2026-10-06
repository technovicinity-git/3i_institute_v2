abstract final class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://threei-institute-v2.onrender.com/api/v1',
  );

  /// Public website origin used for shareable links, e.g.
  /// `--dart-define=WEB_BASE_URL=https://example.com`.
  static const webBaseUrl = String.fromEnvironment('WEB_BASE_URL');

  static String get socketBaseUrl {
    const configured = String.fromEnvironment('SOCKET_BASE_URL');
    if (configured.isNotEmpty) return configured;
    return Uri.parse(apiBaseUrl).replace(path: '/', query: '').toString();
  }

  // On mobile, configure native client IDs in the platform projects and pass
  // the Google server/web client ID here for an ID token accepted by the API.
  static const googleServerClientId = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');
}
