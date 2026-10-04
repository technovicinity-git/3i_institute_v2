abstract final class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://threei-institute-v2.onrender.com/api/v1',
  );

  // On mobile, configure native client IDs in the platform projects and pass
  // the Google server/web client ID here for an ID token accepted by the API.
  static const googleServerClientId = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');
}
