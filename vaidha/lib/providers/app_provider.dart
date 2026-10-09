import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb, Uint8List;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';
import '../l10n/app_strings.dart';
import '../models/analysis_result.dart';
import '../services/api_service.dart';

enum AppStatus {
  idle,
  imageSelected,
  loading,
  success,
  notPlant,
  error,
}

class AppProvider extends ChangeNotifier {
  final ApiService _apiService;
  final ImagePicker _picker;

  AppProvider({
    ApiService? apiService,
    ImagePicker? picker,
  })  : _apiService = apiService ?? ApiService(),
        _picker = picker ?? ImagePicker();

  AppLanguage _currentLanguage = AppLanguage.english;
  AppStatus _status = AppStatus.idle;

  File? _imageFile;
  Uint8List? _imageBytes;
  String? _imageBase64;
  String? _mimeType;

  AnalysisResult? _currentResult;
  String? _errorMessage;

  // Language cache for currently selected image
  final Map<String, AnalysisResult> _cacheByLanguage = {};

  bool _isFirstLaunch = false;

  // Getters
  AppLanguage get currentLanguage => _currentLanguage;
  AppStrings get strings => AppStrings.of(_currentLanguage);
  AppStatus get status => _status;
  File? get imageFile => _imageFile;
  Uint8List? get imageBytes => _imageBytes;
  AnalysisResult? get currentResult => _currentResult;
  String? get errorMessage => _errorMessage;

  bool get isLoading => _status == AppStatus.loading;
  bool get hasImage => _imageBytes != null || _imageFile != null;
  bool get isFirstLaunch => _isFirstLaunch;

  /// Load language preference on startup
  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final onboarded = prefs.getBool('plant_doctor_onboarded') ?? false;
      final savedLangCode = prefs.getString('plant_doctor_language');
      if (savedLangCode != null) {
        _currentLanguage = AppLanguage.fromCode(savedLangCode);
      }
      _isFirstLaunch = !onboarded;
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to load saved language: $e');
    }
  }

  /// Complete initial language onboarding
  Future<void> completeOnboarding(AppLanguage language) async {
    _isFirstLaunch = false;
    _currentLanguage = language;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('plant_doctor_language', language.code);
      await prefs.setBool('plant_doctor_onboarded', true);
    } catch (e) {
      debugPrint('Failed to complete onboarding: $e');
    }
  }

  /// Change active language and persist to SharedPreferences
  Future<void> setLanguage(AppLanguage language) async {
    if (_currentLanguage == language) return;
    _currentLanguage = language;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('plant_doctor_language', language.code);
    } catch (e) {
      debugPrint('Failed to save language: $e');
    }

    // If currently displaying a result, switch to cached or re-fetch in new language
    if ((_status == AppStatus.success || _status == AppStatus.notPlant) &&
        _imageBase64 != null) {
      if (_cacheByLanguage.containsKey(language.code)) {
        _currentResult = _cacheByLanguage[language.code];
        if (_currentResult?.isPlant == false) {
          _status = AppStatus.notPlant;
        } else {
          _status = AppStatus.success;
        }
        notifyListeners();
      } else {
        // Request diagnosis in the newly selected language
        await analyzeCurrentPlant();
      }
    }
  }

  /// Pick image from Camera or Gallery with 1280px dimension and ~80 quality
  Future<bool> pickImage(ImageSource source) async {
    try {
      _errorMessage = null;

      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: AppConfig.maxImageDimension,
        maxHeight: AppConfig.maxImageDimension,
        imageQuality: AppConfig.imageQuality,
      );

      if (pickedFile == null) return false;

      final bytes = await pickedFile.readAsBytes();
      final fileLength = bytes.length;

      // Check max size 5 MB
      if (fileLength > AppConfig.maxFileSizeBytes) {
        _errorMessage = strings.errFileTooLarge;
        _status = AppStatus.error;
        notifyListeners();
        return false;
      }

      // Check extension (from pickedFile.name or pickedFile.path)
      final fileName = pickedFile.name.isNotEmpty ? pickedFile.name : pickedFile.path;
      final ext = fileName.contains('.') ? fileName.split('.').last.toLowerCase() : 'jpg';
      if (!['jpg', 'jpeg', 'png', 'webp'].contains(ext)) {
        _errorMessage = strings.errInvalidFormat;
        _status = AppStatus.error;
        notifyListeners();
        return false;
      }

      // Determine MIME type
      String mime = 'image/jpeg';
      if (ext == 'png') {
        mime = 'image/png';
      } else if (ext == 'webp') {
        mime = 'image/webp';
      }

      final base64String = base64Encode(bytes);

      // Save state and clear previous image cache
      _imageBytes = bytes;
      if (!kIsWeb) {
        try {
          _imageFile = File(pickedFile.path);
        } catch (_) {
          _imageFile = null;
        }
      } else {
        _imageFile = null;
      }
      _imageBase64 = base64String;
      _mimeType = mime;
      _currentResult = null;
      _cacheByLanguage.clear();
      _status = AppStatus.imageSelected;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to pick image: ${e.toString()}';
      _status = AppStatus.error;
      notifyListeners();
      return false;
    }
  }

  /// Send image to backend or Gemini for analysis
  Future<void> analyzeCurrentPlant() async {
    if (_imageBase64 == null || _mimeType == null) {
      _errorMessage = 'No image selected for analysis.';
      _status = AppStatus.error;
      notifyListeners();
      return;
    }

    final langKey = _currentLanguage.code;

    // Check if result already in cache
    if (_cacheByLanguage.containsKey(langKey)) {
      _currentResult = _cacheByLanguage[langKey];
      _status = _currentResult?.isPlant == true ? AppStatus.success : AppStatus.notPlant;
      _errorMessage = null;
      notifyListeners();
      return;
    }

    _status = AppStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _apiService.analyzePlant(
        base64Image: _imageBase64!,
        mimeType: _mimeType!,
        languageApiName: _currentLanguage.apiName,
      );

      // Cache the result for this language
      _cacheByLanguage[langKey] = result;
      _currentResult = result;

      if (!result.isPlant) {
        _status = AppStatus.notPlant;
      } else {
        _status = AppStatus.success;
      }
      notifyListeners();
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _status = AppStatus.error;
      notifyListeners();
    } catch (e) {
      _errorMessage = strings.errGeneric;
      _status = AppStatus.error;
      notifyListeners();
    }
  }

  /// Reset everything cleanly back to idle state
  void reset() {
    _status = AppStatus.idle;
    _imageFile = null;
    _imageBytes = null;
    _imageBase64 = null;
    _mimeType = null;
    _currentResult = null;
    _errorMessage = null;
    _cacheByLanguage.clear();
    notifyListeners();
  }

  /// Retry last analysis without stale cache
  void retry() {
    _cacheByLanguage.remove(_currentLanguage.code);
    if (_imageBase64 != null) {
      analyzeCurrentPlant();
    } else {
      reset();
    }
  }
}
