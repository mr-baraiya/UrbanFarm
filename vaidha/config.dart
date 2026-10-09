import 'package:flutter/foundation.dart'
    show kIsWeb, defaultTargetPlatform, TargetPlatform;

/// Application configuration for Vaidha.
/// AI diagnoses are routed through the secure UrbanFarm backend,
/// eliminating the need to expose Google Gemini API keys in the mobile app bundle.
class AppConfig {
  /// Optional Gemini API key override for standalone offline testing only.
  /// Not required for normal production or backend-connected operation.
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '',
  );

  /// Custom backend server URL passed via `--dart-define=API_BASE_URL=...` or `.env`
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Resolves the active UrbanFarm Backend Base URL:
  /// - If explicitly set via environment, uses that URL (trimmed)
  /// - On Android Emulator: routes to `http://10.0.2.2:5000` (host machine localhost)
  /// - On Web / Desktop: routes to `http://localhost:5000`
  static String get apiBaseUrl {
    if (_envBaseUrl.isNotEmpty) {
      final clean = _envBaseUrl.trim();
      return clean.endsWith('/') ? clean.substring(0, clean.length - 1) : clean;
    }

    if (kIsWeb) {
      return 'http://localhost:5000';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000';
    }

    return 'http://localhost:5000';
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
