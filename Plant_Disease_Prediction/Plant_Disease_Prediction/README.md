# 🌿 Plant Doctor

A web application built with **React (Vite)** and an **Express backend** powered by **Google Gemini Flash** (`gemini-2.5-flash` / `gemini-2.0-flash` / `gemini-1.5-flash`). It provides instant plant disease detection, step-by-step treatment plans, chemical solutions (active ingredients), and traditional Indian desi remedies in **English**, **Hindi (हिन्दी)**, and **Gujarati (ગુજરાતી)**.

---

## ✨ Features

1. **Client-Side Image Validation**:
   - Supports JPG, PNG, WEBP up to 5 MB.
   - Verifies file format, size, and tests image renderability.
   - Mobile-friendly camera capture (`<input type="file" accept="image/*" capture="environment">`).
   - Clean preview with replace/remove options.

2. **Multilingual Diagnostic Reports**:
   - Supports **English**, **Hindi (हिन्दी)**, and **Gujarati (ગુજરાતી)**.
   - Headings, badges, and all analysis text are translated.
   - **Auto Re-analysis**: Changing the language after getting a diagnosis automatically translates/re-analyzes the result with in-memory caching.

3. **Strict Non-Plant Filter**:
   - Gemini filters out humans, faces, animals, screenshots, objects, and non-plants.
   - Rejection message: *"This doesn't look like a plant image. Please upload a photo of a plant, leaf, flower or fruit."*

4. **Structured JSON AI Output**:
   - Uses Gemini's `responseMimeType: "application/json"` with schema enforcement at `temperature: 0.2`.
   - Returns structured diagnosis: plant name, scientific name, health status, condition name, confidence badge (High / Medium / Low), symptoms, causes, step-by-step treatments, chemical active ingredients, and traditional Indian remedies (neem spray, buttermilk, garlic-chilli, baking soda, etc.).

5. **Secure Backend**:
   - API key stored securely in `server/.env`.
   - Never exposed to the browser.
   - Robust error handling: Rate limit (429), network error recovery, and automatic retry on invalid JSON.

---

## 📁 Project Structure

```
Plant_Disease_Prediction/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadBox.jsx   # Drag & drop, camera capture, validations, preview
│   │   │   └── Result.jsx      # Diagnostic report cards, badges, remedy boxes
│   │   ├── App.jsx             # State management, caching, language switching
│   │   ├── i18n.js             # Translations dictionary (EN, HI, GU)
│   │   ├── index.css           # Minimal, clean CSS (no UI libraries)
│   │   └── main.jsx
│   ├── vite.config.js          # Proxies /api to Express backend (port 5000)
│   └── package.json
│
├── server/                     # Backend API (Express)
│   ├── index.js                # POST /api/analyze endpoint with Gemini SDK & schema
│   ├── .env                    # Environment file with GEMINI_API_KEY (gitignored)
│   ├── .env.example            # Environment template
│   └── package.json
│
├── run-dev.js                  # Concurrently runs server and client without external deps
├── package.json                # Root package with convenient scripts
└── .gitignore                  # Protects node_modules and .env files
```

---

## 🚀 Getting Started

### 1. Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install:all
```

Or install separately:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

---

### 2. Configure Environment Variable (`server/.env`)

1. Open `server/.env` (or copy from `server/.env.example`):
   ```env
   PORT=5000
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your free Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/).

---

### 3. Run Locally

From the root directory:
```bash
npm run dev
```

This starts both services concurrently:
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend App**: [http://localhost:5173](http://localhost:5173)

Alternatively, run in separate terminals:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

Open your browser at `http://localhost:5173`.

---

## 🌐 Deployment Guide

### Option A: Render (Backend) + Vercel (Frontend)

1. **Deploy Server to Render**:
   - Create a new **Web Service** on [Render](https://render.com/).
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node index.js`
   - In Render **Environment Variables**, add:
     - `GEMINI_API_KEY`: your Gemini API key
     - `PORT`: `5000`

2. **Deploy Client to Vercel**:
   - Import your GitHub repo on [Vercel](https://vercel.com/).
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - In `client/vite.config.js`, or in your production fetch URL, point `/api/analyze` to your deployed Render URL (e.g. `https://your-service.onrender.com/api/analyze`).

### Option B: Fullstack on Vercel (Vercel Serverless Function)
You can convert `server/index.js` into a serverless handler inside an `api/analyze.js` file at the root or within Vercel, and add `GEMINI_API_KEY` to Vercel's Environment Variables dashboard.

---

## ⚠️ Disclaimer
AI suggestions are for guidance. Always confirm with a local agricultural extension officer or expert before spraying chemicals on crops.
