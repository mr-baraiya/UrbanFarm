import 'package:flutter/material.dart';
import '../l10n/app_strings.dart';
import '../models/analysis_result.dart';
import '../services/tts_service.dart';

class VoiceReportPlayer extends StatefulWidget {
  final AnalysisResult result;
  final AppLanguage language;
  final AppStrings strings;
  final TtsService ttsService;

  const VoiceReportPlayer({
    super.key,
    required this.result,
    required this.language,
    required this.strings,
    required this.ttsService,
  });

  @override
  State<VoiceReportPlayer> createState() => _VoiceReportPlayerState();
}

class _VoiceReportPlayerState extends State<VoiceReportPlayer>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handlePlay() async {
    try {
      await widget.ttsService.readReport(
        result: widget.result,
        language: widget.language,
        strings: widget.strings,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Voice reading error: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.result.isPlant ||
        (widget.result.plantName.trim().isEmpty && widget.result.conditionName.trim().isEmpty)) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final strings = widget.strings;
    final tts = widget.ttsService;
    final isPlaying = tts.isPlaying;
    final isPaused = tts.isPaused;
    final isActive = isPlaying || isPaused;

    const primaryColor = Color(0xFF15803D);
    const primaryLight = Color(0xFFDCFCE7);

    return Container(
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFFF0FDF4) : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isActive
              ? primaryColor.withValues(alpha: 0.6)
              : theme.colorScheme.outlineVariant.withValues(alpha: 0.7),
          width: isActive ? 1.8 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isActive
                ? primaryColor.withValues(alpha: 0.12)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: isActive ? 12 : 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Speaker icon with subtle pulse when reading
              ScaleTransition(
                scale: isPlaying ? _pulseAnimation : const AlwaysStoppedAnimation(1.0),
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: isActive ? primaryColor : primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isPlaying
                        ? Icons.volume_up_rounded
                        : (isPaused ? Icons.pause_rounded : Icons.record_voice_over_rounded),
                    color: isActive ? Colors.white : primaryColor,
                    size: 26,
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // Title and Subtitle / Progress Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isActive
                          ? (isPlaying ? strings.voiceReading : strings.voicePaused)
                          : strings.listenReportVoice,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: isActive ? primaryColor : theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isActive && tts.currentSectionTitle.isNotEmpty
                          ? tts.currentSectionTitle
                          : strings.voiceReaderHelp,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontSize: 12.5,
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Action Buttons when active vs idle
          const SizedBox(height: 12),
          if (isActive) ...[
            // Progress tracker badge
            if (tts.totalChunks > 0)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: tts.totalChunks > 0
                        ? (tts.currentChunkIndex + 1) / tts.totalChunks
                        : 0.0,
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    valueColor: const AlwaysStoppedAnimation<Color>(primaryColor),
                    minHeight: 5,
                  ),
                ),
              ),

            Row(
              children: [
                // Pause / Resume Button
                Expanded(
                  flex: 3,
                  child: FilledButton.icon(
                    onPressed: () {
                      if (isPlaying) {
                        tts.pause();
                      } else {
                        tts.resume();
                      }
                    },
                    icon: Icon(
                      isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      size: 20,
                    ),
                    label: Text(
                      isPlaying ? strings.voicePause : strings.voiceResume,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: FilledButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Stop Button
                Expanded(
                  flex: 2,
                  child: OutlinedButton.icon(
                    onPressed: () => tts.stop(),
                    icon: const Icon(Icons.stop_rounded, size: 20, color: Color(0xFFDC2626)),
                    label: Text(
                      strings.voiceStop,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFDC2626),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFDC2626), width: 1.4),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            // Idle state: Prominent Green button to listen
            FilledButton.icon(
              onPressed: _handlePlay,
              icon: const Icon(Icons.volume_up_rounded, size: 22),
              label: Text(
                strings.listenReportVoice,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.2,
                ),
              ),
              style: FilledButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
