import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../l10n/app_strings.dart';
import '../models/analysis_result.dart';

enum TtsState {
  stopped,
  playing,
  paused,
}

class TtsChunk {
  final String sectionTitle;
  final String text;

  const TtsChunk({
    required this.sectionTitle,
    required this.text,
  });
}

class TtsService {
  final FlutterTts _flutterTts;
  TtsState _state = TtsState.stopped;
  String _currentSpokenText = '';
  String _currentSectionTitle = '';
  bool _isDisposed = false;

  void Function(TtsState state)? onStateChanged;
  void Function(int currentChunk, int totalChunks, String sectionTitle)? onProgress;
  void Function(String errorMessage)? onError;

  TtsService({FlutterTts? flutterTts}) : _flutterTts = flutterTts ?? FlutterTts() {
    _initTts();
  }

  TtsState get state => _state;
  bool get isPlaying => _state == TtsState.playing;
  bool get isPaused => _state == TtsState.paused;
  bool get isStopped => _state == TtsState.stopped;

  int get currentChunkIndex => 0;
  int get totalChunks => _currentSpokenText.isNotEmpty ? 1 : 0;
  String get currentSectionTitle => _currentSectionTitle;

  Future<void> _initTts() async {
    try {
      _flutterTts.setStartHandler(() {
        if (!_isDisposed) {
          _state = TtsState.playing;
          onStateChanged?.call(_state);
          onProgress?.call(1, 1, _currentSectionTitle);
        }
      });

      _flutterTts.setCompletionHandler(() {
        if (!_isDisposed) {
          _state = TtsState.stopped;
          _currentSectionTitle = '';
          onStateChanged?.call(_state);
          onProgress?.call(1, 1, '');
        }
      });

      _flutterTts.setCancelHandler(() {
        if (!_isDisposed) {
          _state = TtsState.stopped;
          _currentSectionTitle = '';
          onStateChanged?.call(_state);
          onProgress?.call(1, 1, '');
        }
      });

      _flutterTts.setPauseHandler(() {
        if (!_isDisposed) {
          _state = TtsState.paused;
          onStateChanged?.call(_state);
        }
      });

      _flutterTts.setContinueHandler(() {
        if (!_isDisposed) {
          _state = TtsState.playing;
          onStateChanged?.call(_state);
        }
      });

      _flutterTts.setErrorHandler((msg) {
        debugPrint('TtsService error: $msg');
        if (!_isDisposed) {
          _state = TtsState.stopped;
          _currentSectionTitle = '';
          onStateChanged?.call(_state);
          onError?.call(msg.toString());
        }
      });

      await _flutterTts.setSpeechRate(0.48);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);
    } catch (e) {
      debugPrint('Failed to initialize TTS: $e');
    }
  }

  /// Configure TTS voice engine for selected application language
  Future<void> _configureLanguage(AppLanguage language) async {
    try {
      List<String> candidateLocales;
      switch (language) {
        case AppLanguage.hindi:
          candidateLocales = ['hi-IN', 'hi_IN', 'hi'];
          break;
        case AppLanguage.gujarati:
          candidateLocales = ['gu-IN', 'gu_IN', 'gu', 'hi-IN', 'hi'];
          break;
        case AppLanguage.english:
          candidateLocales = ['en-IN', 'en-US', 'en-GB', 'en'];
          break;
      }

      bool configured = false;
      for (final loc in candidateLocales) {
        try {
          final res = await _flutterTts.setLanguage(loc);
          if (res == 1 || res == true || res == '1') {
            configured = true;
            break;
          }
        } catch (_) {}
      }

      if (!configured) {
        try {
          await _flutterTts.setLanguage('en-US');
        } catch (_) {}
      }
    } catch (e) {
      debugPrint('Error configuring TTS language: $e');
    }
  }

  /// Builds a concise spoken script:
  /// - Plant name detected
  /// - Status of the health (healthy vs condition detected)
  /// - What disease it has if any
  /// - If not a plant or invalid image: returns empty string (say NOTHING)
  /// - Summary of what to be done to get the treatment (not all details)
  static String buildSummarySpeech({
    required AnalysisResult result,
    required AppLanguage language,
  }) {
    // Strict Guard: If it's not a plant or invalid image, say NOTHING!
    if (!result.isPlant || (result.plantName.trim().isEmpty && result.conditionName.trim().isEmpty)) {
      return '';
    }

    final plantName = result.plantName.trim().isNotEmpty
        ? result.plantName.trim()
        : (result.scientificName.trim().isNotEmpty ? result.scientificName.trim() : '');

    // Extract treatment summary: concise summary of what to be done to get the treatment
    String treatmentSummary = '';
    if (result.treatmentSteps.isNotEmpty) {
      treatmentSummary = result.treatmentSteps.first.trim();
    } else if (result.desiSolutions.isNotEmpty) {
      treatmentSummary = result.desiSolutions.first.trim();
    } else if (result.medicalSolutions.isNotEmpty) {
      treatmentSummary = result.medicalSolutions.first.trim();
    } else if (result.description.trim().isNotEmpty) {
      treatmentSummary = result.description.trim();
    }

    // Clean up trailing punctuation
    if (treatmentSummary.endsWith('.')) {
      treatmentSummary = treatmentSummary.substring(0, treatmentSummary.length - 1).trim();
    }
    if (treatmentSummary.endsWith('।')) {
      treatmentSummary = treatmentSummary.substring(0, treatmentSummary.length - 1).trim();
    }

    switch (language) {
      case AppLanguage.hindi:
        final plantDisplay = plantName.isNotEmpty ? plantName : 'पौधा';
        if (result.isHealthy) {
          return 'पहचाना गया पौधा: $plantDisplay। स्वास्थ्य स्थिति: पौधा पूरी तरह स्वस्थ है। इसमें कोई बीमारी नहीं पाई गई।';
        } else {
          final diseaseName = result.conditionName.trim().isNotEmpty ? result.conditionName.trim() : 'रोग';
          final treatmentText = treatmentSummary.isNotEmpty ? ' उपचार सारांश: $treatmentSummary।' : '';
          return 'पहचाना गया पौधा: $plantDisplay। स्वास्थ्य स्थिति: रोग पाया गया है। रोग: $diseaseName।$treatmentText';
        }

      case AppLanguage.gujarati:
        final plantDisplay = plantName.isNotEmpty ? plantName : 'છોડ';
        if (result.isHealthy) {
          return 'ઓળખાયેલ છોડ: $plantDisplay. આરોગ્ય સ્થિતિ: છોડ તંદુરસ્ત છે. કોઈ રોગ જણાયો નથી.';
        } else {
          final diseaseName = result.conditionName.trim().isNotEmpty ? result.conditionName.trim() : 'રોગ';
          final treatmentText = treatmentSummary.isNotEmpty ? ' સારવાર સારાંશ: $treatmentSummary.' : '';
          return 'ઓળખાયેલ છોડ: $plantDisplay. આરોગ્ય સ્થિતિ: રોગ જણાયેલ છે. રોગ: $diseaseName.$treatmentText';
        }

      case AppLanguage.english:
        final plantDisplay = plantName.isNotEmpty ? plantName : 'Plant';
        if (result.isHealthy) {
          return 'Detected plant: $plantDisplay. Health status: Healthy. The plant shows no diseases.';
        } else {
          final diseaseName = result.conditionName.trim().isNotEmpty ? result.conditionName.trim() : 'Condition detected';
          final treatmentText = treatmentSummary.isNotEmpty ? ' Treatment summary: $treatmentSummary.' : '';
          return 'Detected plant: $plantDisplay. Health status: Disease detected. Condition: $diseaseName.$treatmentText';
        }
    }
  }

  /// Builds chunks containing the concise diagnostic summary for playback
  List<TtsChunk> buildReportChunks({
    required AnalysisResult result,
    required AppLanguage language,
    AppStrings? strings,
  }) {
    if (!result.isPlant || (result.plantName.trim().isEmpty && result.conditionName.trim().isEmpty)) {
      return const [];
    }

    final speech = buildSummarySpeech(result: result, language: language);
    if (speech.trim().isEmpty) return const [];

    final title = language == AppLanguage.hindi
        ? 'पौधा, स्थिति व उपचार सारांश'
        : (language == AppLanguage.gujarati ? 'છોડ, સ્થિતિ અને સારવાર સારાંશ' : 'Diagnosis & Treatment Summary');

    return [
      TtsChunk(sectionTitle: title, text: speech),
    ];
  }

  /// Start reading the concise diagnostic summary aloud
  Future<void> readReport({
    required AnalysisResult result,
    required AppLanguage language,
    AppStrings? strings,
  }) async {
    // If not a plant or invalid image, do not speak anything
    if (!result.isPlant || (result.plantName.trim().isEmpty && result.conditionName.trim().isEmpty)) {
      await stop();
      return;
    }

    final speech = buildSummarySpeech(result: result, language: language);
    if (speech.trim().isEmpty) {
      await stop();
      return;
    }

    await stop();

    _currentSpokenText = speech;
    _currentSectionTitle = language == AppLanguage.hindi
        ? 'पौधा, स्थिति व उपचार सारांश'
        : (language == AppLanguage.gujarati ? 'છોડ, સ્થિતિ અને સારવાર સારાંશ' : 'Diagnosis & Treatment Summary');

    await _configureLanguage(language);

    _state = TtsState.playing;
    onStateChanged?.call(_state);
    onProgress?.call(1, 1, _currentSectionTitle);

    try {
      await _flutterTts.speak(speech);
    } catch (e) {
      debugPrint('TTS speak error: $e');
      _state = TtsState.stopped;
      _currentSectionTitle = '';
      onStateChanged?.call(_state);
      onError?.call(e.toString());
    }
  }

  /// Pause current speech
  Future<void> pause() async {
    if (_state == TtsState.playing) {
      _state = TtsState.paused;
      try {
        await _flutterTts.pause();
      } catch (_) {
        await _flutterTts.stop();
      }
      onStateChanged?.call(_state);
    }
  }

  /// Resume reading
  Future<void> resume() async {
    if (_state == TtsState.paused && _currentSpokenText.isNotEmpty) {
      _state = TtsState.playing;
      onStateChanged?.call(_state);
      try {
        await _flutterTts.speak(_currentSpokenText);
      } catch (e) {
        _state = TtsState.stopped;
        onStateChanged?.call(_state);
      }
    }
  }

  /// Completely stop reading
  Future<void> stop() async {
    _state = TtsState.stopped;
    _currentSectionTitle = '';
    try {
      await _flutterTts.stop();
    } catch (_) {}
    if (!_isDisposed) {
      onStateChanged?.call(_state);
      onProgress?.call(1, 1, '');
    }
  }

  /// Dispose TTS resources
  void dispose() {
    _isDisposed = true;
    _state = TtsState.stopped;
    _currentSectionTitle = '';
    try {
      _flutterTts.stop();
    } catch (_) {}
  }
}
