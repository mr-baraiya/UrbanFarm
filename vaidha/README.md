# Vaidha — AI Plant Doctor Mobile App

> **Vaidha (વૈદ્ય / वैद्य)** is the standalone cross-platform mobile application companion for **UrbanFarm**, offering instant offline-first leaf disease diagnosis, multilingual audio prescriptions, and treatment guidance powered by Google Gemini Vision.

---

## Key Features

1. **AI Vision Pathogen Diagnosis**
   - Direct integration with **Google Gemini Flash Vision** for instantaneous leaf disease scanning and health scoring.
   - Generates botanical diagnosis, cause analysis, chemical treatment, and organic-first remedies.

2. **Dual Operation Modes**
   - **Standalone Direct Mode:** Calls Google Gemini REST API directly using `GEMINI_API_KEY` — no backend server required.
   - **Backend Proxy Mode:** Routes requests through the UrbanFarm Node.js/Express backend API if configured via `API_BASE_URL`.

3. **Trilingual Localization & Voice Assistant**
   - Native support for **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.
   - Built-in Text-to-Speech (`flutter_tts`) reads prescriptions aloud in the farmer's preferred language.

4. **Prescription PDF Export & Sharing**
   - Generates formatted, printable medical-style botanical prescriptions (`pdf`, `printing`) with QR codes and organic dosage instructions.

---

## Directory Structure

```text
vaidha/
├── assets/
│   └── images/
│       └── logo.png              # App branding logo
├── l10n/
│   └── app_strings.dart          # Trilingual translations (EN, HI, GU)
├── models/
│   └── analysis_result.dart      # Disease analysis data models
├── providers/
│   └── app_provider.dart         # Global state & image processing
├── screens/
│   ├── home_screen.dart          # Scan & camera capture launcher
│   ├── preview_screen.dart       # Image preview before analysis
│   ├── result_screen.dart        # Detailed diagnosis & prescription
│   ├── language_selection_screen.dart
│   ├── not_plant_screen.dart     # Non-plant validation fallback
│   ├── settings_screen.dart      # Language & config preferences
│   ├── splash_screen.dart        # Splash animation
│   └── tips_screen.dart          # Organic care & pest prevention tips
├── services/
│   ├── api_service.dart          # Gemini & backend HTTP client
│   ├── pdf_service.dart          # PDF prescription generator
│   └── tts_service.dart          # Text-to-speech audio reader
├── widgets/                      # Reusable UI cards, chips & players
├── .env.example                  # Environment configuration template
├── .gitignore                    # Flutter / secrets ignore rules
├── config.dart                   # Application configuration & environment loader
└── pubspec.yaml                  # Flutter package dependencies
```

---

## Environment Setup & Configuration

### 1. Configure `.env`

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Google Gemini Vision API Key (Get free key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API Base URL (Optional)
API_BASE_URL=https://urbanfarm-server.vercel.app
```

> **Security Note:** The `.env` file contains sensitive API keys and is excluded from Git via `.gitignore`. Never commit `.env` with real credentials to source control.

---

## How to Build the App (Without Running)

When building in an environment where the mobile emulator or device is not attached, compile the app using the following commands:

### Install Dependencies
```bash
flutter pub get
```

### Build APK with Environment Variables

#### Method 1: Using `--dart-define-from-file` (Recommended for Flutter 3.7+)
```bash
flutter build apk --release --dart-define-from-file=.env
```

#### Method 2: Using `--dart-define` Flags
```bash
flutter build apk --release \
  --dart-define=GEMINI_API_KEY=your_gemini_api_key_here \
  --dart-define=API_BASE_URL=https://urbanfarm-server.vercel.app
```

#### Build App Bundle for Google Play (AAB)
```bash
flutter build appbundle --release --dart-define-from-file=.env
```

#### Build Output Location
The compiled release APK will be generated at:
```text
build/app/outputs/flutter-apk/app-release.apk
```

---

## Development Dependencies

- **Flutter SDK:** `>=3.10.0`
- **Dart SDK:** `>=3.0.0 <4.0.0`
- **Key Packages:**
  - `provider` — Reactive state management
  - `google_fonts` — Clean modern typography (Nunito)
  - `image_picker` — Camera and gallery image picker
  - `shared_preferences` — Language and local settings persistence
  - `http` — REST API calls to Gemini and UrbanFarm API
  - `flutter_tts` — Multilingual voice engine
  - `pdf` & `printing` — Printable PDF prescription generator
  - `url_launcher` — External link routing
