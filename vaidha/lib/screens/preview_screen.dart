import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'result_screen.dart';

class PreviewScreen extends StatelessWidget {
  const PreviewScreen({super.key});

  void _showChangePhotoSheet(BuildContext context) {
    final provider = context.read<AppProvider>();
    final strings = provider.strings;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded),
                title: Text(strings.takePhoto),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  await provider.pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded),
                title: Text(strings.chooseFromGallery),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  await provider.pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _startAnalysis(BuildContext context) {
    final provider = context.read<AppProvider>();
    provider.analyzeCurrentPlant();

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const ResultScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final strings = provider.strings;
    final theme = Theme.of(context);

    if (!provider.hasImage) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted && Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      });
      return const Scaffold();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.previewTitle),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Image Preview Container
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: provider.imageBytes != null
                        ? Image.memory(
                            provider.imageBytes!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                          )
                        : (provider.imageFile != null
                            ? Image.file(
                                provider.imageFile!,
                                fit: BoxFit.cover,
                                width: double.infinity,
                              )
                            : const SizedBox.shrink()),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Status badge
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle_outline_rounded,
                        size: 16,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        strings.readyToAnalyze,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // "Analyze Plant" Button
              FilledButton.icon(
                onPressed: () => _startAnalysis(context),
                icon: const Icon(Icons.search_rounded, size: 22),
                label: Text(
                  strings.analyzeButton,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // "Change Photo" Button
              OutlinedButton.icon(
                onPressed: () => _showChangePhotoSheet(context),
                icon: const Icon(Icons.flip_camera_ios_outlined, size: 20),
                label: Text(strings.changePhoto),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
