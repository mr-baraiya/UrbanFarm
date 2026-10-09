import 'package:flutter/foundation.dart'
    show kIsWeb, defaultTargetPlatform, TargetPlatform;

class AppConfig {
  /// Direct Google Gemini API Key for standalone APK mode (no backend deployment needed)
  /// Can be overridden with: flutter build apk --dart-define=GEMINI_API_KEY=your_key
  /// or with --dart-define-from-file=.env
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '',
  );

  /// Optional backend server URL. If set, routes through backend; otherwise calls Gemini directly.
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get apiBaseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:5000';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000';
    }

    return 'http://localhost:5000';
  }

  /// Request timeout in seconds
  static const Duration requestTimeout = Duration(seconds: 35);

  /// Max file upload size in bytes (5 MB)
  static const int maxFileSizeBytes = 5 * 1024 * 1024;

  /// Max image dimension for compression (long side)
  static const double maxImageDimension = 1280.0;

  /// Image compression quality (1-100)
  static const int imageQuality = 80;
}
