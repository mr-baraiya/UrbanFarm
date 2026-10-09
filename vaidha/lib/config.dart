import 'package:flutter/foundation.dart'
    show kIsWeb, defaultTargetPlatform, TargetPlatform;

/// Application configuration for Vaidha.
/// AI diagnoses are routed through the secure UrbanFarm backend,
/// eliminating the need to expose Google Gemini API keys in the mobile app bundle.
class AppConfig {
  /// Default live production backend server URL
  static const String defaultProductionUrl = 'https://urbanfarm-server.vercel.app';

  /// Optional Gemini API key override for standalone offline testing only.
  /// Not required for normal production or backend-connected operation.
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '',
  );

  /// Custom backend server URL passed via `--dart-define=API_BASE_URL=...` or `.env`
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Resolves the active UrbanFarm Backend Base URL:
  /// - If explicitly set via environment, uses that URL
  /// - Default production fallback: https://urbanfarm-server.vercel.app
  /// Automatically strips trailing slashes and '/api' suffix so endpoint routing is always clean.
  static String get apiBaseUrl {
    String url = _envBaseUrl.trim();
    if (url.isEmpty) {
      url = defaultProductionUrl;
    }

    // Strip trailing slashes
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }

    // If url ends with /api, strip it so we don't produce double /api/api/...
    if (url.endsWith('/api')) {
      url = url.substring(0, url.length - 4);
    }

    return url;
  }

  /// Network request timeout (40 seconds for AI vision pathology processing)
  static const Duration requestTimeout = Duration(seconds: 40);

  /// Max file upload size in bytes (5 MB)
  static const int maxFileSizeBytes = 5 * 1024 * 1024;

  /// Max image dimension for compression before upload (long side)
  static const double maxImageDimension = 1280.0;

  /// Image compression quality (1-100)
  static const int imageQuality = 80;
}
