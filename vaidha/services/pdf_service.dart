import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/analysis_result.dart';
import '../l10n/app_strings.dart';

class PdfService {
  static const String websiteUrl = 'https://urbanfarm.baraiyavishalbhai32.workers.dev';

  /// Generate and share/download the PDF report (Strictly 1 Page Maximum)
  /// Uses Unicode Noto Sans fonts (Devanagari, Gujarati, Latin) to ensure clear text rendering in any language without 'xx' glyph errors.
  static Future<void> downloadAndShareReport({
    required AnalysisResult result,
    required AppStrings strings,
    Uint8List? imageBytes,
    File? imageFile,
  }) async {
    Uint8List? resolvedBytes = imageBytes;
    if (resolvedBytes == null && !kIsWeb && imageFile != null) {
      try {
        if (await imageFile.exists()) {
          resolvedBytes = await imageFile.readAsBytes();
        }
      } catch (_) {}
    }
    final imageBytesData = resolvedBytes;

    final now = DateTime.now();
    final formattedDate =
        '${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year} ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    // 3-Color PDF Palette (Neutral White/Gray, Slate Dark, Forest Green)
    final greenPrimary = PdfColor.fromHex('#166534');
    final darkSlate = PdfColor.fromHex('#0F172A');
    final mediumSlate = PdfColor.fromHex('#475569');
    final borderColor = PdfColor.fromHex('#E2E8F0');
    final cardBgColor = PdfColor.fromHex('#F8FAFC');

    // 1. Load Unicode & Script Fonts with Fallbacks for English, Hindi (Devanagari) & Gujarati
    pw.Font baseFont;
    pw.Font boldFont;
    final fontFallbacks = <pw.Font>[];

    try {
      final latinRegular = await PdfGoogleFonts.notoSansRegular();
      final latinBold = await PdfGoogleFonts.notoSansBold();
      final devanagariRegular = await PdfGoogleFonts.notoSansDevanagariRegular();
      final devanagariBold = await PdfGoogleFonts.notoSansDevanagariBold();
      final gujaratiRegular = await PdfGoogleFonts.notoSansGujaratiRegular();
      final gujaratiBold = await PdfGoogleFonts.notoSansGujaratiBold();

      if (strings.language == AppLanguage.hindi) {
        baseFont = devanagariRegular;
        boldFont = devanagariBold;
        fontFallbacks.addAll([latinRegular, latinBold, gujaratiRegular, gujaratiBold]);
      } else if (strings.language == AppLanguage.gujarati) {
        baseFont = gujaratiRegular;
        boldFont = gujaratiBold;
        fontFallbacks.addAll([latinRegular, latinBold, devanagariRegular, devanagariBold]);
      } else {
        baseFont = latinRegular;
        boldFont = latinBold;
        fontFallbacks.addAll([devanagariRegular, devanagariBold, gujaratiRegular, gujaratiBold]);
      }
    } catch (e) {
      debugPrint('PdfService: Failed to load Google Fonts, falling back to built-in fonts: $e');
      baseFont = pw.Font.helvetica();
      boldFont = pw.Font.helveticaBold();
    }

    final theme = pw.ThemeData.withFont(
      base: baseFont,
      bold: boldFont,
      fontFallback: fontFallbacks,
    );

    final pdf = pw.Document(theme: theme);

    final dateLabel = strings.language == AppLanguage.hindi
        ? 'दिनांक'
        : (strings.language == AppLanguage.gujarati ? 'તારીખ' : 'Date');

    final headerReportBadge = strings.language == AppLanguage.hindi
        ? 'पौधा स्वास्थ्य रिपोर्ट'
        : (strings.language == AppLanguage.gujarati ? 'છોડ આરોગ્ય અહેવાલ' : 'PLANT HEALTH REPORT');

    final conditionTitle = result.conditionName.isNotEmpty
        ? result.conditionName
        : (result.isHealthy ? strings.healthyPlant : strings.conditionDetected);

    final confidenceText = result.confidence == 'high'
        ? strings.confHigh
        : (result.confidence == 'medium' ? strings.confMedium : strings.confLow);

    // Single-page PDF layout
    pdf.addPage(
      pw.Page(
        theme: theme,
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // 1. Header Bar
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        strings.appName,
                        style: pw.TextStyle(
                          fontSize: 20,
                          fontWeight: pw.FontWeight.bold,
                          color: greenPrimary,
                        ),
                      ),
                      pw.Text(
                        strings.appTagline,
                        style: pw.TextStyle(
                          fontSize: 9,
                          fontWeight: pw.FontWeight.bold,
                          color: mediumSlate,
                        ),
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: pw.BoxDecoration(
                          color: cardBgColor,
                          borderRadius: pw.BorderRadius.circular(4),
                          border: pw.Border.all(color: borderColor),
                        ),
                        child: pw.Text(
                          headerReportBadge,
                          style: pw.TextStyle(
                            fontSize: 8.5,
                            fontWeight: pw.FontWeight.bold,
                            color: greenPrimary,
                          ),
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        '$dateLabel: $formattedDate',
                        style: pw.TextStyle(fontSize: 8, color: mediumSlate),
                      ),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 8),
              pw.Divider(color: borderColor, thickness: 1),
              pw.SizedBox(height: 8),

              // 2. Diagnosis Hero Card
              pw.Container(
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  color: cardBgColor,
                  borderRadius: pw.BorderRadius.circular(8),
                  border: pw.Border.all(color: borderColor),
                ),
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    if (imageBytesData != null) ...[
                      pw.ClipRRect(
                        horizontalRadius: 6,
                        verticalRadius: 6,
                        child: pw.Image(
                          pw.MemoryImage(imageBytesData),
                          width: 54,
                          height: 54,
                          fit: pw.BoxFit.cover,
                        ),
                      ),
                      pw.SizedBox(width: 12),
                    ],
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            conditionTitle,
                            style: pw.TextStyle(
                              fontSize: 13,
                              fontWeight: pw.FontWeight.bold,
                              color: darkSlate,
                            ),
                          ),
                          pw.SizedBox(height: 2),
                          if (result.plantName.isNotEmpty)
                            pw.Text(
                              '${strings.plantName}: ${result.plantName} ${result.scientificName.isNotEmpty ? "(${result.scientificName})" : ""}',
                              style: pw.TextStyle(
                                fontSize: 9.5,
                                color: mediumSlate,
                              ),
                            ),
                        ],
                      ),
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Container(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: pw.BoxDecoration(
                            color: cardBgColor,
                            borderRadius: pw.BorderRadius.circular(4),
                            border: pw.Border.all(
                              color: result.isHealthy ? greenPrimary : mediumSlate,
                            ),
                          ),
                          child: pw.Text(
                            result.isHealthy ? strings.healthyPlant : strings.conditionDetected,
                            style: pw.TextStyle(
                              fontSize: 8,
                              fontWeight: pw.FontWeight.bold,
                              color: result.isHealthy ? greenPrimary : darkSlate,
                            ),
                          ),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Container(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: pw.BoxDecoration(
                            color: cardBgColor,
                            borderRadius: pw.BorderRadius.circular(4),
                            border: pw.Border.all(color: borderColor),
                          ),
                          child: pw.Text(
                            confidenceText,
                            style: pw.TextStyle(
                              fontSize: 8,
                              fontWeight: pw.FontWeight.bold,
                              color: mediumSlate,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 10),

              // 3. Main 2-Column Compact Grid (Designed specifically to fit on 1 page)
              pw.Expanded(
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    // LEFT COLUMN
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          // Description & Overview
                          if (result.description.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionDescription, greenPrimary),
                            pw.Text(
                              result.description,
                              maxLines: 4,
                              style: pw.TextStyle(fontSize: 8.5, color: darkSlate, lineSpacing: 1.3),
                            ),
                            pw.SizedBox(height: 8),
                          ],

                          // Symptoms
                          if (result.symptoms.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionSymptoms, greenPrimary),
                            _buildPdfBulletList(result.symptoms.take(3).toList(), darkSlate),
                            pw.SizedBox(height: 8),
                          ],

                          // Causes
                          if (result.causes.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionCauses, greenPrimary),
                            _buildPdfBulletList(result.causes.take(3).toList(), darkSlate),
                            pw.SizedBox(height: 8),
                          ],

                          // Prevention Tips
                          if (result.preventionTips.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionPreventionTips, greenPrimary),
                            _buildPdfBulletList(result.preventionTips.take(3).toList(), darkSlate),
                            pw.SizedBox(height: 8),
                          ],
                        ],
                      ),
                    ),

                    pw.SizedBox(width: 14),

                    // RIGHT COLUMN
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          // Step-by-Step Treatment
                          if (result.treatmentSteps.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionTreatmentSteps, greenPrimary),
                            _buildPdfNumberedList(result.treatmentSteps.take(3).toList(), darkSlate),
                            pw.SizedBox(height: 8),
                          ],

                          // Desi / Home Remedies
                          if (result.desiSolutions.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionDesiSolutions, greenPrimary),
                            pw.Container(
                              padding: const pw.EdgeInsets.all(6),
                              decoration: pw.BoxDecoration(
                                color: cardBgColor,
                                borderRadius: pw.BorderRadius.circular(6),
                                border: pw.Border.all(color: borderColor),
                              ),
                              child: _buildPdfBulletList(result.desiSolutions.take(2).toList(), darkSlate),
                            ),
                            pw.SizedBox(height: 8),
                          ],

                          // Chemical / Medical Solutions
                          if (result.medicalSolutions.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionMedicalSolutions, greenPrimary),
                            pw.Container(
                              padding: const pw.EdgeInsets.all(6),
                              decoration: pw.BoxDecoration(
                                color: cardBgColor,
                                borderRadius: pw.BorderRadius.circular(6),
                                border: pw.Border.all(color: borderColor),
                              ),
                              child: _buildPdfBulletList(result.medicalSolutions.take(2).toList(), darkSlate),
                            ),
                            pw.SizedBox(height: 8),
                          ],

                          // Expert Help or Unsure Note
                          if (result.whenToSeekExpertHelp.isNotEmpty || result.noteIfUnsure.isNotEmpty) ...[
                            _buildPdfSectionHeader(strings.sectionExpertHelp, greenPrimary),
                            pw.Text(
                              result.whenToSeekExpertHelp.isNotEmpty
                                  ? result.whenToSeekExpertHelp
                                  : result.noteIfUnsure,
                              maxLines: 3,
                              style: pw.TextStyle(fontSize: 8, color: mediumSlate, lineSpacing: 1.2),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // 4. Footer Bar
              pw.SizedBox(height: 4),
              pw.Divider(color: borderColor, thickness: 1),
              pw.SizedBox(height: 3),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Expanded(
                    child: pw.Text(
                      strings.disclaimer,
                      style: pw.TextStyle(fontSize: 6.8, color: mediumSlate),
                      maxLines: 2,
                    ),
                  ),
                  pw.SizedBox(width: 8),
                  pw.Text(
                    'vaidha.app',
                    style: pw.TextStyle(
                      fontSize: 7.5,
                      fontWeight: pw.FontWeight.bold,
                      color: greenPrimary,
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );

    final cleanCondition = result.conditionName.replaceAll(RegExp(r'[^\w\s-]'), '').trim().replaceAll(RegExp(r'\s+'), '_');
    final filename = 'Vaidha_Report_${cleanCondition.isEmpty ? "Diagnosis" : cleanCondition}.pdf';

    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: filename,
    );
  }

  static pw.Widget _buildPdfSectionHeader(String title, PdfColor color) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 3),
      child: pw.Text(
        title,
        style: pw.TextStyle(
          fontSize: 9,
          fontWeight: pw.FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  static pw.Widget _buildPdfBulletList(List<String> items, PdfColor textColor) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: items.map((item) {
        return pw.Padding(
          padding: const pw.EdgeInsets.only(bottom: 2),
          child: pw.Row(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text('- ', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.5, color: textColor)),
              pw.Expanded(
                child: pw.Text(
                  item,
                  style: pw.TextStyle(fontSize: 8.2, color: textColor, lineSpacing: 1.15),
                  maxLines: 2,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  static pw.Widget _buildPdfNumberedList(List<String> items, PdfColor textColor) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: items.asMap().entries.map((entry) {
        final idx = entry.key + 1;
        final item = entry.value;
        return pw.Padding(
          padding: const pw.EdgeInsets.only(bottom: 2),
          child: pw.Row(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text('$idx. ', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.5, color: textColor)),
              pw.Expanded(
                child: pw.Text(
                  item,
                  style: pw.TextStyle(fontSize: 8.2, color: textColor, lineSpacing: 1.15),
                  maxLines: 2,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
