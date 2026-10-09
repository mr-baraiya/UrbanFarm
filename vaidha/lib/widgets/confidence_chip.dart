import 'package:flutter/material.dart';
import '../l10n/app_strings.dart';

class ConfidenceChip extends StatelessWidget {
  final String confidence;
  final AppStrings strings;

  const ConfidenceChip({
    super.key,
    required this.confidence,
    required this.strings,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isHigh = confidence.toLowerCase() == 'high';
    final Color fg = isHigh ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant;
    final IconData icon = isHigh ? Icons.check_circle_outline_rounded : Icons.info_outline_rounded;
    
    String label;
    switch (confidence.toLowerCase()) {
      case 'high':
        label = strings.confHigh;
        break;
      case 'low':
        label = strings.confLow;
        break;
      case 'medium':
      default:
        label = strings.confMedium;
        break;
    }

    return Container(
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
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
