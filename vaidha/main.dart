import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/app_provider.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final appProvider = AppProvider();
  await appProvider.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<AppProvider>.value(value: appProvider),
      ],
      child: const PlantDoctorApp(),
    ),
  );
}

class PlantDoctorApp extends StatelessWidget {
  const PlantDoctorApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Primary forest green seed color (Color 1: Forest Green, Color 2: Slate, Color 3: Crisp Neutral)
    const seedColor = Color(0xFF166534);

    final lightColorScheme = ColorScheme.fromSeed(
      seedColor: seedColor,
      brightness: Brightness.light,
      surface: Colors.white,
    );

    final darkColorScheme = ColorScheme.fromSeed(
      seedColor: seedColor,
      brightness: Brightness.dark,
    );

    // Modern typography with multilingual fallback support (English, Hindi, Gujarati)
    TextTheme buildTextTheme(Brightness brightness) {
      final baseTextTheme = brightness == Brightness.light
          ? ThemeData.light().textTheme
          : ThemeData.dark().textTheme;

      return GoogleFonts.nunitoTextTheme(baseTextTheme);
    }

    return MaterialApp(
      title: 'Vaidha',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.light,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: lightColorScheme,
        textTheme: buildTextTheme(Brightness.light),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
          scrolledUnderElevation: 0,
          backgroundColor: Color(0xFFF8FAFC),
        ),
        navigationBarTheme: NavigationBarThemeData(
          elevation: 0,
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFF166534).withValues(alpha: 0.12),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: darkColorScheme,
        textTheme: buildTextTheme(Brightness.dark),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
          scrolledUnderElevation: 0,
          backgroundColor: Color(0xFF0F172A),
        ),
        navigationBarTheme: NavigationBarThemeData(
          elevation: 0,
          backgroundColor: const Color(0xFF0F172A),
          indicatorColor: const Color(0xFF166534).withValues(alpha: 0.25),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
