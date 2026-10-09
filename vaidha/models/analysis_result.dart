class AnalysisResult {
  final bool isPlant;
  final String plantName;
  final String scientificName;
  final bool isHealthy;
  final String conditionName;
  final String confidence; // 'high', 'medium', 'low'
  final String description;
  final List<String> symptoms;
  final List<String> causes;
  final List<String> treatmentSteps;
  final List<String> medicalSolutions;
  final List<String> desiSolutions;
  final List<String> recoveryTips;
  final List<String> preventionTips;
  final String whenToSeekExpertHelp;
  final String noteIfUnsure;

  const AnalysisResult({
    required this.isPlant,
    required this.plantName,
    required this.scientificName,
    required this.isHealthy,
    required this.conditionName,
    required this.confidence,
    required this.description,
    required this.symptoms,
    required this.causes,
    required this.treatmentSteps,
    required this.medicalSolutions,
    required this.desiSolutions,
    required this.recoveryTips,
    required this.preventionTips,
    required this.whenToSeekExpertHelp,
    required this.noteIfUnsure,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    // Unwrap nested diagnosis object if backend sends { success: true, diagnosis: { ... } }
    final Map<String, dynamic> data = (json['diagnosis'] is Map<String, dynamic>)
        ? json['diagnosis'] as Map<String, dynamic>
        : json;

    List<String> parseStringList(dynamic value) {
      if (value is List) {
        return value
            .map((item) => item?.toString().trim() ?? '')
            .where((item) => item.isNotEmpty)
            .toList();
      } else if (value is String && value.trim().isNotEmpty) {
        return value
            .split('\n')
            .map((s) => s.trim().replaceAll(RegExp(r'^[-•*\d.]+\s*'), ''))
            .where((s) => s.isNotEmpty)
            .toList();
      }
      return <String>[];
    }

    final rawConfidence = (data['confidenceLevel'] ??
            data['confidence_level'] ??
            data['confidence'])
        ?.toString()
        .toLowerCase()
        .trim() ??
        'medium';

    final normalizedConfidence =
        ['high', 'medium', 'low'].contains(rawConfidence) ? rawConfidence : 'medium';

    final isPlant = data['is_plant'] == true || data['isPlant'] == true;
    final isHealthy = data['is_healthy'] == true || data['isHealthy'] == true;

    final conditionName = data['condition_name']?.toString().trim() ??
        data['diseaseName']?.toString().trim() ??
        data['disease']?.toString().trim() ??
        (isHealthy ? 'Healthy Plant' : '');

    final description = data['description']?.toString().trim() ??
        data['short_explanation']?.toString().trim() ??
        data['shortExplanation']?.toString().trim() ??
        '';

    final whenToSeek = data['when_to_seek_expert_help']?.toString().trim() ??
        data['when_to_contact_expert']?.toString().trim() ??
        data['whenToContactExpert']?.toString().trim() ??
        data['whenToSeekExpertHelp']?.toString().trim() ??
        '';

    final noteIfUnsure = data['note_if_unsure']?.toString().trim() ??
        data['noteIfUnsure']?.toString().trim() ??
        '';

    return AnalysisResult(
      isPlant: isPlant,
      plantName: data['plant_name']?.toString().trim() ??
          data['plantName']?.toString().trim() ??
          '',
      scientificName: data['scientific_name']?.toString().trim() ??
          data['scientificName']?.toString().trim() ??
          '',
      isHealthy: isHealthy,
      conditionName: conditionName,
      confidence: normalizedConfidence,
      description: description,
      symptoms: parseStringList(
          data['symptoms'] ?? data['observed_symptoms'] ?? data['observedSymptoms']),
      causes: parseStringList(
          data['causes'] ?? data['possible_causes'] ?? data['possibleCauses'] ?? data['cause']),
      treatmentSteps: parseStringList(data['treatment_steps'] ??
          data['treatmentSteps'] ??
          data['immediate_actions'] ??
          data['immediateActions'] ??
          data['treatment']),
      medicalSolutions: parseStringList(data['medical_solutions'] ??
          data['medicalSolutions'] ??
          data['modern_solutions'] ??
          data['modernSolutions']),
      desiSolutions: parseStringList(data['desi_solutions'] ??
          data['desiSolutions'] ??
          data['natural_solutions'] ??
          data['naturalSolutions']),
      recoveryTips: parseStringList(data['recovery_tips'] ?? data['recoveryTips']),
      preventionTips: parseStringList(data['prevention_tips'] ?? data['preventionTips']),
      whenToSeekExpertHelp: whenToSeek,
      noteIfUnsure: noteIfUnsure,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_plant': isPlant,
      'plant_name': plantName,
      'scientific_name': scientificName,
      'is_healthy': isHealthy,
      'condition_name': conditionName,
      'confidence': confidence,
      'description': description,
      'symptoms': symptoms,
      'causes': causes,
      'treatment_steps': treatmentSteps,
      'medical_solutions': medicalSolutions,
      'desi_solutions': desiSolutions,
      'recovery_tips': recoveryTips,
      'prevention_tips': preventionTips,
      'when_to_seek_expert_help': whenToSeekExpertHelp,
      'note_if_unsure': noteIfUnsure,
    };
  }

  /// Empty template for not-a-plant state
  factory AnalysisResult.notPlant() {
    return const AnalysisResult(
      isPlant: false,
      plantName: '',
      scientificName: '',
      isHealthy: false,
      conditionName: '',
      confidence: 'low',
      description: '',
      symptoms: [],
      causes: [],
      treatmentSteps: [],
      medicalSolutions: [],
      desiSolutions: [],
      recoveryTips: [],
      preventionTips: [],
      whenToSeekExpertHelp: '',
      noteIfUnsure: '',
    );
  }
}
