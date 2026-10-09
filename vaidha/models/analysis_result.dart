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
    List<String> parseStringList(dynamic value) {
      if (value is List) {
        return value
            .map((item) => item?.toString().trim() ?? '')
            .where((item) => item.isNotEmpty)
            .toList();
      }
      return <String>[];
    }

    final rawConfidence = json['confidence']?.toString().toLowerCase().trim() ?? 'medium';
    final normalizedConfidence =
        ['high', 'medium', 'low'].contains(rawConfidence) ? rawConfidence : 'medium';

    return AnalysisResult(
      isPlant: json['is_plant'] == true,
      plantName: json['plant_name']?.toString().trim() ?? '',
      scientificName: json['scientific_name']?.toString().trim() ?? '',
      isHealthy: json['is_healthy'] == true,
      conditionName: json['condition_name']?.toString().trim() ?? '',
      confidence: normalizedConfidence,
      description: json['description']?.toString().trim() ?? '',
      symptoms: parseStringList(json['symptoms']),
      causes: parseStringList(json['causes']),
      treatmentSteps: parseStringList(json['treatment_steps']),
      medicalSolutions: parseStringList(json['medical_solutions']),
      desiSolutions: parseStringList(json['desi_solutions']),
      recoveryTips: parseStringList(json['recovery_tips']),
      preventionTips: parseStringList(json['prevention_tips']),
      whenToSeekExpertHelp: json['when_to_seek_expert_help']?.toString().trim() ?? '',
      noteIfUnsure: json['note_if_unsure']?.toString().trim() ?? '',
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
