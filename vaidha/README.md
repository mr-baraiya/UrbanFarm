# Vaidha — AI Plant Doctor Mobile App

> **Vaidha (વૈદ્ય / वैद्य)** is the cross-platform mobile application companion for **UrbanFarm**, offering instant offline-first leaf disease diagnosis, multilingual audio prescriptions, and treatment guidance connected directly to the **UrbanFarm Backend API**.

---

## Key Features

1. **Secure Backend-Powered AI Vision Pathogen Diagnosis**
   - Routes leaf images securely to the **UrbanFarm Backend API** (`/api/disease/diagnose` & `/api/analyze`).
   - Server-side multimodal AI pathology engine (Groq Vision & Google Gemini Vision) analyzes images and generates structured 9-section clinical diagnosis reports.
   - **No API keys stored in client application bundle** — protecting your Google Gemini and Groq API keys from reverse-engineering or leakage.

2. **Trilingual Localization & Voice Assistant**
   - Native support for **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.
   - Built-in Text-to-Speech (`flutter_tts`) reads prescriptions aloud in the farmer's preferred language.

3. **Prescription PDF Export & Sharing**
   - Generates formatted, printable medical-style botanical prescriptions (`pdf`, `printing`) with QR codes and organic dosage instructions.

---

## Architecture & Integration

```text
┌───────────────────────────────────────┐
│           Vaidha Mobile App           │
│  (Flutter: Android / iOS / Web / App) │
└──────────────────┬────────────────────┘
                   │ HTTP POST (Base64 Image + Language)
                   ▼
┌───────────────────────────────────────┐
│         UrbanFarm Backend API         │
│     (Node.js / Express / Vercel)      │
│  • Endpoint: /api/disease/diagnose    │
│  • Endpoint: /api/analyze             │
│  • Secure Server-Side AI API Keys     │
└──────────────────┬────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│   Groq Vision   │ │  Google Gemini  │
│ Pathology Engine│ │  Vision Backup  │
└─────────────────┘ └─────────────────┘
```

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
│   ├── api_service.dart          # Backend API & diagnosis HTTP client
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

Set your backend server URL in `.env`:

```env
# Backend API Base URL
# - Local Android Emulator: http://10.0.2.2:5000
# - Local Web/Desktop: http://localhost:5000
# - Production: https://urbanfarm-server.vercel.app
API_BASE_URL=http://10.0.2.2:5000
```

> **Note:** The Gemini API key is securely configured on the server side (`backend/.env`), eliminating client-side key storage.

---

## How to Build the App (Without Running)

### Install Dependencies
```bash
flutter pub get
```

### Build APK
```bash
flutter build apk --release --dart-define-from-file=.env
```

Or pass `API_BASE_URL` directly:
```bash
flutter build apk --release --dart-define=API_BASE_URL=https://urbanfarm-server.vercel.app
```

The output APK is generated at:
```text
build/app/outputs/flutter-apk/app-release.apk
```
