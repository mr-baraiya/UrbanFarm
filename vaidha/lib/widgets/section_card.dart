import 'package:flutter/material.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final Color? cardColor;
  final Color? borderColor;
  final bool initiallyExpanded;
  final String? textContent;
  final List<String>? listItems;
  final bool isOrdered;

  const SectionCard({
    super.key,
    required this.title,
    required this.icon,
    this.iconColor,
    this.cardColor,
    this.borderColor,
    this.initiallyExpanded = false,
    this.textContent,
    this.listItems,
    this.isOrdered = false,
  });

  @override
  Widget build(BuildContext context) {
    // If no content, don't show the card
    final hasText = textContent != null && textContent!.trim().isNotEmpty;
    final hasItems = listItems != null && listItems!.isNotEmpty;
    if (!hasText && !hasItems) return const SizedBox.shrink();

    final theme = Theme.of(context);
    final effectiveIconColor = iconColor ?? theme.colorScheme.primary;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: cardColor ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: borderColor ?? theme.colorScheme.outlineVariant.withOpacity(0.6),
        ),
      ),
      child: Theme(
        // Remove default ExpansionTile borders
        data: theme.copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: initiallyExpanded,
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: effectiveIconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: effectiveIconColor),
          ),
          title: Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
          trailing: hasItems
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${listItems!.length}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                )
              : null,
          children: [
            if (hasText)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  textContent!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    height: 1.55,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
            if (hasItems)
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: EdgeInsets.only(top: hasText ? 10 : 0),
                itemCount: listItems!.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = listItems![index];
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 2, right: 12),
                        width: isOrdered ? 22 : 6,
                        height: isOrdered ? 22 : 6,
                        alignment: Alignment.center,
                        decoration: isOrdered
                            ? BoxDecoration(
                                color: effectiveIconColor.withOpacity(0.15),
                                shape: BoxShape.circle,
                              )
                            : BoxDecoration(
                                color: effectiveIconColor,
                                shape: BoxShape.circle,
                              ),
                        child: isOrdered
                            ? Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: effectiveIconColor,
                                ),
                              )
                            : null,
                      ),
                      Expanded(
                        child: Text(
                          item,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            height: 1.5,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
