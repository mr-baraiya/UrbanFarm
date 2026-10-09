import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'main_shell_screen.dart';
import 'preview_screen.dart';

class NotPlantScreen extends StatelessWidget {
  const NotPlantScreen({super.key});

  Future<void> _handleNewPhoto(BuildContext context, ImageSource source) async {
    final provider = context.read<AppProvider>();
    final success = await provider.pickImage(source);
    if (context.mounted && success && provider.hasImage) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const PreviewScreen()),
      );
    }
  }

  void _returnHome(BuildContext context) {
    final provider = context.read<AppProvider>();
    provider.reset();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const MainShellScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final strings = provider.strings;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.notPlantTitle),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            tooltip: 'Home',
            icon: const Icon(Icons.home_rounded),
            onPressed: () => _returnHome(context),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),

              // Illustration / Icon Container
              Center(
                child: Container(
                  width: 96,
                  height: 96,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: theme.colorScheme.outlineVariant.withOpacity(0.6),
                    ),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.yard_outlined,
                      size: 48,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Title
              Text(
                strings.notPlantTitle,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              // Friendly explanation
              Text(
                strings.notPlantMessage,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const Spacer(),

              // Option 1: Take Camera Photo directly
              FilledButton.icon(
                onPressed: () => _handleNewPhoto(context, ImageSource.camera),
                icon: const Icon(Icons.camera_alt_rounded, size: 20),
                label: Text(
                  strings.takePhoto,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Option 2: Choose from Gallery directly
              FilledButton.tonalIcon(
                onPressed: () => _handleNewPhoto(context, ImageSource.gallery),
                icon: const Icon(Icons.photo_library_rounded, size: 20),
                label: Text(
                  strings.chooseFromGallery,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Option 3: Return Home (Clean Reset)
              OutlinedButton.icon(
                onPressed: () => _returnHome(context),
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: Text(strings.tryAgain),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
