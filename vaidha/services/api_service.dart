import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/analysis_result.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// System prompt generator for plant pathology & agronomy
  String _getSystemPrompt(String targetLanguage) =>
      '''You are an expert plant pathologist and agronomist. Analyze the uploaded image.
Step 1: Decide if the image's main subject is a plant, leaf, flower, fruit, vegetable or crop. If not (people, faces, animals, objects, text, screenshots, anything else), return is_plant=false, set every other field to an empty string or empty array, and stop. Do not describe the image. If a person is in the frame, reject unless the plant is clearly the main subject and no face is visible. Never describe or comment on people.
Step 2: If it is a plant, identify it (common name + scientific name if confident). Check for disease, pest damage, nutrient deficiency, or environmental stress. If healthy, say so and give general care tips.
Step 3: Be honest about uncertainty. Give confidence (high/medium/low). If low, tell the user to upload a clearer, closer daylight photo of the affected part. Never invent a diagnosis. If multiple conditions are possible, list the most likely first and mention alternatives.
Step 4: Write ALL text values in $targetLanguage. Short, simple sentences a farmer or home gardener can follow. JSON keys stay in English.
For chemical treatments, name the active ingredient (e.g. mancozeb, copper oxychloride, neem-based products) with typical usage guidance and remind the user to follow the product label and wear protection. For desi remedies, use ingredients easily available in India (neem oil/leaf spray, buttermilk spray, turmeric, garlic-chilli spray, baking soda spray, wood ash, cow-dung based preparations, etc.) with simple quantities.''';

  /// Schema definition for Gemini REST API
  Map<String, dynamic> get _geminiSchema => {
        'type': 'OBJECT',
        'properties': {
          'is_plant': {'type': 'BOOLEAN'},
          'plant_name': {'type': 'STRING'},
          'scientific_name': {'type': 'STRING'},
          'is_healthy': {'type': 'BOOLEAN'},
          'condition_name': {'type': 'STRING'},
          'confidence': {
            'type': 'STRING',
            'enum': ['high', 'medium', 'low']
          },
          'description': {'type': 'STRING'},
          'symptoms': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'causes': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'treatment_steps': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'medical_solutions': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'desi_solutions': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'recovery_tips': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'prevention_tips': {
            'type': 'ARRAY',
            'items': {'type': 'STRING'}
          },
          'when_to_seek_expert_help': {'type': 'STRING'},
          'note_if_unsure': {'type': 'STRING'},
        },
        'required': [
          'is_plant',
          'plant_name',
          'scientific_name',
          'is_healthy',
          'condition_name',
          'confidence',
          'description',
          'symptoms',
          'causes',
          'treatment_steps',
          'medical_solutions',
          'desi_solutions',
          'recovery_tips',
          'prevention_tips',
          'when_to_seek_expert_help',
          'note_if_unsure',
        ],
      };

  /// Main analyze method: supports direct Google Gemini API (no backend deployment needed)
  /// or falls back to backend proxy if configured.
  Future<AnalysisResult> analyzePlant({
    required String base64Image,
    required String mimeType,
    required String languageApiName,
  }) async {
    // 1. If Gemini API key is configured, call Gemini directly (Standalone APK)
    if (AppConfig.geminiApiKey.isNotEmpty &&
        AppConfig.geminiApiKey != 'your_gemini_api_key_here') {
      return _callGeminiDirectly(
        base64Image: base64Image,
        mimeType: mimeType,
        language: languageApiName,
      );
    }

    // 2. Otherwise route through backend proxy
    return _callBackendProxy(
      base64Image: base64Image,
      mimeType: mimeType,
      language: languageApiName,
    );
  }

  /// Direct Google Gemini Flash API call (100% standalone APK mode)
  Future<AnalysisResult> _callGeminiDirectly({
    required String base64Image,
    required String mimeType,
    required String language,
  }) async {
    const apiKey = AppConfig.geminiApiKey;
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    final requestBody = jsonEncode({
      'system_instruction': {
        'parts': [
          {'text': _getSystemPrompt(language)}
        ]
      },
      'contents': [
        {
          'parts': [
            {
              'inline_data': {
                'mime_type': mimeType,
                'data': base64Image,
              }
            },
            {
              'text':
                  'Analyze this image according to your instructions. Selected language for all output text is: $language.'
            }
          ]
        }
      ],
      'generationConfig': {
        'temperature': 0.2,
        'response_mime_type': 'application/json',
        'response_schema': _geminiSchema,
      }
    });

    ApiException? lastError;

    for (final model in modelsToTry) {
      final uri = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey',
      );

      try {
        final response = await _client
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: requestBody,
            )
            .timeout(AppConfig.requestTimeout);

        if (response.statusCode == 200) {
          final decoded = jsonDecode(utf8.decode(response.bodyBytes));
          final candidates = decoded['candidates'] as List?;
          if (candidates != null && candidates.isNotEmpty) {
            final contentParts = candidates[0]['content']?['parts'] as List?;
            if (contentParts != null && contentParts.isNotEmpty) {
              final jsonText = contentParts[0]['text']?.toString().trim() ?? '';
              final resultJson = jsonDecode(jsonText);
              return AnalysisResult.fromJson(resultJson as Map<String, dynamic>);
            }
          }
          throw ApiException('Unexpected response structure received from Gemini.');
        } else if (response.statusCode == 429) {
          throw ApiException('Too many requests, try again in a minute.', 429);
        } else if (response.statusCode == 400 || response.statusCode == 404) {
          // Model might not be available, try next fallback model
          lastError = ApiException('Model $model unavailable (${response.statusCode})');
          continue;
        } else {
          final errorMsg = _extractErrorMessage(response.body);
          throw ApiException(
            errorMsg.isNotEmpty ? errorMsg : 'AI service error (${response.statusCode})',
            response.statusCode,
          );
        }
      } on TimeoutException {
        throw ApiException(
          'Connection timed out (35s). Please check your internet connection.',
        );
      } catch (e) {
        if (e is ApiException) rethrow;
        final errStr = e.toString().toLowerCase();
        if (errStr.contains('socket') ||
            errStr.contains('clientexception') ||
            errStr.contains('failed to fetch') ||
            errStr.contains('xmlhttprequest') ||
            errStr.contains('networkerror')) {
          throw ApiException('No internet connection. Please check your network.');
        }
        lastError = ApiException(e.toString());
      }
    }

    throw lastError ??
        ApiException('Failed to connect to AI service. Please check your internet connection.');
  }

  /// Backend proxy call (used when API_BASE_URL is explicitly set)
  Future<AnalysisResult> _callBackendProxy({
    required String base64Image,
    required String mimeType,
    required String language,
  }) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/analyze');

    final payload = jsonEncode({
      'image': base64Image,
      'mimeType': mimeType,
      'language': language,
    });

    try {
      final response = await _client
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: payload,
          )
          .timeout(AppConfig.requestTimeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        return AnalysisResult.fromJson(decoded as Map<String, dynamic>);
      } else if (response.statusCode == 429) {
        throw ApiException('Too many requests, try again in a minute.', 429);
      } else {
        final errorMsg = _extractErrorMessage(response.body);
        throw ApiException(
          errorMsg.isNotEmpty ? errorMsg : 'Server error (${response.statusCode})',
          response.statusCode,
        );
      }
    } on TimeoutException {
      throw ApiException('Connection timed out. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('socket') ||
          errStr.contains('clientexception') ||
          errStr.contains('failed to fetch') ||
          errStr.contains('xmlhttprequest') ||
          errStr.contains('networkerror')) {
        throw ApiException('No internet connection. Please check your network.');
      }
      throw ApiException(e.toString());
    }
  }

  String _extractErrorMessage(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map) {
        if (decoded.containsKey('error')) {
          final err = decoded['error'];
          if (err is Map && err.containsKey('message')) {
            return err['message'].toString();
          }
          return err.toString();
        }
      }
    } catch (_) {}
    return '';
  }
}
