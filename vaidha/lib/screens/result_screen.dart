import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../l10n/app_strings.dart';
import '../models/analysis_result.dart';
import '../providers/app_provider.dart';
import '../services/pdf_service.dart';
import '../services/tts_service.dart';
import '../widgets/confidence_chip.dart';
import '../widgets/section_card.dart';
import '../widgets/urban_farm_card.dart';
import '../widgets/voice_report_player.dart';
import 'main_shell_screen.dart';
import 'not_plant_screen.dart';
import 'preview_screen.dart';

class ResultScreen extends StatefulWidget {
  const ResultScreen({super.key});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  bool _isGeneratingPdf = false;
  late final TtsService _ttsService;

  @override
  void initState() {
    super.initState();
    _ttsService = TtsService();
    _ttsService.onStateChanged = (_) {
      if (mounted) setState(() {});
    };
    _ttsService.onProgress = (_, __, ___) {
      if (mounted) setState(() {});
    };
  }

  @override
  void dispose() {
    _ttsService.stop();
    _ttsService.dispose();
    super.dispose();
  }

  Future<void> _handleGeneratePdf(
    AnalysisResult result,
    AppStrings strings,
    AppProvider provider,
  ) async {
    setState(() => _isGeneratingPdf = true);
    try {
      await PdfService.downloadAndShareReport(
        result: result,
        strings: strings,
        imageBytes: provider.imageBytes,
        imageFile: provider.imageFile,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate PDF: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isGeneratingPdf = false);
      }
    }
  }

  void _returnHome(BuildContext context, AppProvider provider) {
    _ttsService.stop();
    provider.reset();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const MainShellScreen()),
      (route) => false,
    );
  }

  Future<void> _takeNewPhoto(BuildContext context, AppProvider provider, ImageSource source) async {
    _ttsService.stop();
    final success = await provider.pickImage(source);
    if (context.mounted && success && provider.hasImage) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const PreviewScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final strings = provider.strings;

    // If Non-plant detected, render NotPlantScreen
    if (provider.status == AppStatus.notPlant) {
      return const NotPlantScreen();
    }

    final hasResult = provider.currentResult != null && provider.status == AppStatus.success;

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          _ttsService.stop();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(strings.diagnosticReport),
          actions: [
            if (hasResult && provider.currentResult?.isPlant == true)
              IconButton(
                tooltip: _ttsService.isPlaying ? strings.voicePause : strings.listenReportVoice,
                icon: Icon(
                  _ttsService.isPlaying ? Icons.volume_up_rounded : Icons.record_voice_over_outlined,
                  color: _ttsService.isPlaying ? const Color(0xFF15803D) : null,
                ),
                onPressed: () {
                  if (_ttsService.isPlaying) {
                    _ttsService.pause();
                  } else if (_ttsService.isPaused) {
                    _ttsService.resume();
                  } else {
                    _ttsService.readReport(
                      result: provider.currentResult!,
                      language: provider.currentLanguage,
                      strings: strings,
                    );
                  }
                },
              ),
            IconButton(
              tooltip: 'Home',
              icon: const Icon(Icons.home_rounded),
              onPressed: () => _returnHome(context, provider),
            ),
          ],
        ),
        body: SafeArea(
          child: _buildBody(context, provider, strings),
        ),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    AppProvider provider,
    AppStrings strings,
  ) {
    final theme = Theme.of(context);

    // 1. Loading State
    if (provider.isLoading) {
      return _buildLoadingState(context, strings, theme);
    }

    // 2. Error State
    if (provider.status == AppStatus.error || provider.errorMessage != null) {
      return _buildErrorState(context, provider, strings, theme);
    }

    final result = provider.currentResult;
    if (result == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(strings.analyzingTitle),
          ],
        ),
      );
    }

    // 3. Success State with Diagnosis
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Diagnostic Header Card
          _buildTopSummaryCard(context, provider, result, strings, theme),
          const SizedBox(height: 14),

          // Voice Reading Card (Crucial for users who cannot read)
          VoiceReportPlayer(
            result: result,
            language: provider.currentLanguage,
            strings: strings,
            ttsService: _ttsService,
          ),
          const SizedBox(height: 14),

          // Download / Share PDF Report Button
          FilledButton.icon(
            onPressed: _isGeneratingPdf
                ? null
                : () => _handleGeneratePdf(result, strings, provider),
            icon: _isGeneratingPdf
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.picture_as_pdf_rounded, size: 20),
            label: Text(
              _isGeneratingPdf ? strings.generatingPdf : strings.downloadPdfReport,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF15803D),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Uncertainty Notice Box (if present)
          if (result.noteIfUnsure.trim().isNotEmpty) ...[
            _buildUncertaintyNotice(context, result.noteIfUnsure, strings, theme),
            const SizedBox(height: 16),
          ],

          // 1. Description (initiallyExpanded: true)
          SectionCard(
            title: strings.sectionDescription,
            icon: Icons.article_outlined,
            initiallyExpanded: true,
            textContent: result.description,
          ),

          // 2. Symptoms
          SectionCard(
            title: strings.sectionSymptoms,
            icon: Icons.checklist_rounded,
            listItems: result.symptoms,
          ),

          // 3. Causes
          SectionCard(
            title: strings.sectionCauses,
            icon: Icons.help_outline_rounded,
            listItems: result.causes,
          ),

          // 4. How to Treat (Step-by-step, initiallyExpanded: true)
          SectionCard(
            title: strings.sectionTreatmentSteps,
            icon: Icons.healing_rounded,
            initiallyExpanded: true,
            isOrdered: true,
            listItems: result.treatmentSteps,
          ),

          // 5. Medical Solutions (Chemical)
          SectionCard(
            title: strings.sectionMedicalSolutions,
            icon: Icons.science_outlined,
            listItems: result.medicalSolutions,
          ),

          // 6. Desi Remedies (Traditional Indian)
          SectionCard(
            title: strings.sectionDesiSolutions,
            icon: Icons.eco_rounded,
            listItems: result.desiSolutions,
          ),

          // 7. Recovery Tips
          SectionCard(
            title: strings.sectionRecoveryTips,
            icon: Icons.trending_up_rounded,
            listItems: result.recoveryTips,
          ),

          // 8. Prevention Tips
          SectionCard(
            title: strings.sectionPreventionTips,
            icon: Icons.shield_outlined,
            listItems: result.preventionTips,
          ),

          // 9. When to See an Expert
          SectionCard(
            title: strings.sectionExpertHelp,
            icon: Icons.person_search_rounded,
            textContent: result.whenToSeekExpertHelp,
          ),

          const SizedBox(height: 16),

          // Explore More Features - UrbanFarm Web Portal Card
          UrbanFarmCard(strings: strings),
          const SizedBox(height: 20),

          // Actions to Analyze Another Plant
          Row(
            children: [
              Expanded(
                child: FilledButton.tonalIcon(
                  onPressed: () => _takeNewPhoto(context, provider, ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_rounded, size: 18),
                  label: Text(
                    strings.takePhoto,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.tonalIcon(
                  onPressed: () => _takeNewPhoto(context, provider, ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_rounded, size: 18),
                  label: Text(
                    strings.chooseFromGallery,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Clean Home Reset Button
          OutlinedButton.icon(
            onPressed: () => _returnHome(context, provider),
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: Text(
              strings.analyzeAnother,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Disclaimer Footer
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              strings.disclaimer,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // Top Diagnostic Summary Card
  Widget _buildTopSummaryCard(
    BuildContext context,
    AppProvider provider,
    AnalysisResult result,
    AppStrings strings,
    ThemeData theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.6),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image Thumbnail
              if (provider.hasImage)
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: provider.imageBytes != null
                      ? Image.memory(
                          provider.imageBytes!,
                          width: 76,
                          height: 76,
                          fit: BoxFit.cover,
                        )
                      : (provider.imageFile != null
                          ? Image.file(
                              provider.imageFile!,
                              width: 76,
                              height: 76,
                              fit: BoxFit.cover,
                            )
                          : const SizedBox.shrink()),
                ),
              const SizedBox(width: 14),

              // Plant Identification & Condition
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result.conditionName.isNotEmpty
                          ? result.conditionName
                          : (result.isHealthy ? strings.healthyPlant : strings.conditionDetected),
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),

                    if (result.plantName.isNotEmpty)
                      Text(
                        result.plantName,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),

                    if (result.scientificName.isNotEmpty)
                      Text(
                        result.scientificName,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.outline,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1),
          const SizedBox(height: 12),

          // Badges Row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ConfidenceChip(
                confidence: result.confidence,
                strings: strings,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.6),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      result.isHealthy ? Icons.check_circle_outline_rounded : Icons.info_outline_rounded,
                      size: 14,
                      color: result.isHealthy ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      result.isHealthy ? strings.healthyPlant : strings.conditionDetected,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: result.isHealthy ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Uncertainty Box (Minimalist)
  Widget _buildUncertaintyNotice(
    BuildContext context,
    String note,
    AppStrings strings,
    ThemeData theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outlineVariant.withOpacity(0.6)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline_rounded, color: theme.colorScheme.primary, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  strings.noteIfUnsureTitle,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  note,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Loading Screen with App Logo (Replacing generic circle)
  Widget _buildLoadingState(BuildContext context, AppStrings strings, ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 84,
              height: 84,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.6),
                ),
              ),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              strings.analyzingTitle,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 17,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              strings.analyzingSubtitle,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: 140,
              child: LinearProgressIndicator(
                minHeight: 3,
                backgroundColor: theme.colorScheme.outlineVariant.withOpacity(0.4),
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Error State with Retry and Home reset
  Widget _buildErrorState(
    BuildContext context,
    AppProvider provider,
    AppStrings strings,
    ThemeData theme,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.errorContainer.withOpacity(0.6),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 52,
                color: theme.colorScheme.error,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              provider.errorMessage ?? strings.errGeneric,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _returnHome(context, provider),
                  icon: const Icon(Icons.home_rounded, size: 18),
                  label: const Text('Home'),
                ),
                const SizedBox(width: 14),
                FilledButton.icon(
                  onPressed: () => provider.retry(),
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: Text(strings.retry),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
