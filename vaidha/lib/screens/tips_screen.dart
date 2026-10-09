import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';

class TipsScreen extends StatelessWidget {
  const TipsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final strings = provider.strings;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.tipsPageTitle),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Guide Banner (Minimalist)
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.6),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.school_outlined,
                        color: theme.colorScheme.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            strings.howItWorksTitle,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            strings.homeSubtitle,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Section 1: How to use in 3 steps
              Text(
                strings.stepSectionTitle,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              _buildStepCard(
                context,
                stepLabel: strings.stepLabel,
                stepNumber: '1',
                title: strings.step1Title,
                description: strings.step1Desc,
                icon: Icons.camera_alt_outlined,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 10),

              _buildStepCard(
                context,
                stepLabel: strings.stepLabel,
                stepNumber: '2',
                title: strings.step2Title,
                description: strings.step2Desc,
                icon: Icons.biotech_outlined,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 10),

              _buildStepCard(
                context,
                stepLabel: strings.stepLabel,
                stepNumber: '3',
                title: strings.step3Title,
                description: strings.step3Desc,
                icon: Icons.health_and_safety_outlined,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 24),

              // Section 2: Photography Golden Rules
              Text(
                strings.photoRulesSectionTitle,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.6),
                  ),
                ),
                child: Column(
                  children: [
                    _buildRuleRow(
                      context,
                      isPositive: true,
                      title: strings.photoRule1Title,
                      description: strings.photoRule1Desc,
                    ),
                    const Divider(height: 20),
                    _buildRuleRow(
                      context,
                      isPositive: true,
                      title: strings.photoRule2Title,
                      description: strings.photoRule2Desc,
                    ),
                    const Divider(height: 20),
                    _buildRuleRow(
                      context,
                      isPositive: true,
                      title: strings.photoRule3Title,
                      description: strings.photoRule3Desc,
                    ),
                    const Divider(height: 20),
                    _buildRuleRow(
                      context,
                      isPositive: false,
                      title: strings.photoRule4Title,
                      description: strings.photoRule4Desc,
                    ),
                    const Divider(height: 20),
                    _buildRuleRow(
                      context,
                      isPositive: false,
                      title: strings.photoRule5Title,
                      description: strings.photoRule5Desc,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Section 3: Popular Desi Remedies Quick Guide
              Text(
                strings.desiRemediesSectionTitle,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              _buildRemedyCard(
                title: strings.remedy1Title,
                bestFor: strings.remedy1BestFor,
                instructions: strings.remedy1Instructions,
                tag: strings.organicTag,
                targetLabel: strings.targetLabel,
                theme: theme,
              ),
              const SizedBox(height: 10),

              _buildRemedyCard(
                title: strings.remedy2Title,
                bestFor: strings.remedy2BestFor,
                instructions: strings.remedy2Instructions,
                tag: strings.antifungalTag,
                targetLabel: strings.targetLabel,
                theme: theme,
              ),
              const SizedBox(height: 10),

              _buildRemedyCard(
                title: strings.remedy3Title,
                bestFor: strings.remedy3BestFor,
                instructions: strings.remedy3Instructions,
                tag: strings.protectiveTag,
                targetLabel: strings.targetLabel,
                theme: theme,
              ),
              const SizedBox(height: 20),

              // Section 4: Safety & Expert Advice (Minimalist)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: theme.colorScheme.outlineVariant.withOpacity(0.6)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.info_outline_rounded,
                      color: theme.colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            strings.agronomicAdvisoryTitle,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            strings.disclaimer,
                            style: TextStyle(
                              fontSize: 12,
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepCard(
    BuildContext context, {
    required String stepLabel,
    required String stepNumber,
    required String title,
    required String description,
    required IconData icon,
    required Color color,
  }) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.6),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Icon(icon, color: color, size: 24),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '$stepLabel $stepNumber',
                        style: TextStyle(
                          color: color,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleRow(
    BuildContext context, {
    required bool isPositive,
    required String title,
    required String description,
  }) {
    final theme = Theme.of(context);
    final iconColor = isPositive ? const Color(0xFF16A34A) : const Color(0xFFDC2626);
    final icon = isPositive ? Icons.check_circle_rounded : Icons.cancel_rounded;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: iconColor, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRemedyCard({
    required String title,
    required String bestFor,
    required String instructions,
    required String tag,
    required String targetLabel,
    required ThemeData theme,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.6),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  tag,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '$targetLabel: $bestFor',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            instructions,
            style: TextStyle(
              fontSize: 12,
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}
