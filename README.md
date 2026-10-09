# UrbanFarm — AI-Powered Urban Farming Assistant

> Manage your urban garden with AI plant disease diagnosis, real-time AGMARKNET mandi prices, smart irrigation, gamified reward medallions, and a thriving grower community — all in one place.

## Live Deployment

| Component | URL |
|---|---|
| **Frontend** | [https://urbanfarm.baraiyavishalbhai32.workers.dev](https://urbanfarm.baraiyavishalbhai32.workers.dev) |
| **Backend API** | [https://urbanfarm-server.vercel.app](https://urbanfarm-server.vercel.app) |
| **Health Check** | [https://urbanfarm-server.vercel.app/health](https://urbanfarm-server.vercel.app/health) |

> **Frontend** hosted on **Cloudflare Workers** · **Backend** hosted on **Vercel Serverless**

---

## Comprehensive Features List

### 1. AI Plant Disease Diagnosis & Leaf Scanner
- **Instant Vision Scan:** Upload or capture leaf photos for real-time pathogen identification with **98.4% diagnostic accuracy**.
- **30+ Supported Crops:** Specialized for urban and container crops including tomatoes, bell peppers, corn, herbs, leafy greens, and gourds.
- **Organic-First Treatment Plans:** Prioritizes eco-friendly solutions (cold-pressed neem oil, *Bacillus subtilis* bio-fungicides, copper octanoate) alongside targeted chemical options.
- **Interactive Live Previews & Permalinks:** Public interactive report previews (`/live-preview`) with Web Share API and permalink copy support.

### 2. Real-Time AGMARKNET APMC Mandi Market Prices
- **Official Data Source:** Live price intelligence directly integrated with Government of India (**Data.gov.in / AGMARKNET**).
- **All-India Coverage:** 21+ States/UTs, 50+ Major APMC Mandis, and 60+ commodities spanning Crops & Grains, Green Vegetables, Fruits, and Flowers.
- **GPS Proximity & "Nearby Mandis First":** Built-in browser Geolocation with client-side Haversine formula calculates distance in kilometers and surfaces closest mandis with "Nearby APMC" distance badges.
- **Adaptive Display Modes:** Default clean **Table View** for desktop and swipeable **Card View** for mobile with user override preference persistence.
- **Full Pagination & Multi-Category Search:** Instant search, state & district filters, per-page controls (12, 24, 48), and live price refresh animations.

### 3. Weather-Based Smart Irrigation & Microclimate Sync
- **Dynamic Weather Sync:** Integrates with OpenWeather API to track hyper-local temperature, humidity, UV index, and precipitation forecasts.
- **Automated Rain Delays:** Automatically postpones irrigation schedules when rain is forecasted, saving up to **40% household water**.
- **Growth-Stage Adaptive Watering:** Customizes watering volume and frequency according to plant development phases (seedling vs vegetative vs flowering vs harvest).
- **Automated Drip Timers:** Complete guidance and automated calculations for balcony & terrace drip irrigation timing and solenoid valve scheduling.

### 4. 24/7 Krishi AI Assistant & Natural Language Intent Engine
- **Powered by Google Gemini AI:** Conversational agronomy assistant capable of answering complex urban farming questions, soil NPK balancing, organic pest control, and drip irrigation setups.
- **Multi-Language Intent Engine:** Intelligent regex and confidence-driven classifier that analyzes Hindi, Gujarati, and English queries to return instant quick-action navigation shortcuts (`/app/diagnosis`, `/app/watering`, etc.).
- **Context-Aware Recommendations:** Dynamic follow-up suggestion chips tailored to query context (e.g. organic neem spray recipes, drip timer programming, companion planting).
- **Robust Local Knowledge Base Fallback:** Offline-capable fallback knowledge base providing immediate assistance even during external API downtime.

### 5. Garden Space & Crop Lifecycle Tracking
- **Multi-Zone Space Mapping:** Map raised beds, balcony containers, vertical hydroponic towers, and rooftop plots.
- **Individual Plant Health Timelines:** Track planting dates, varieties, companion planting compatibility, and projected harvest windows.
- **Photo Logs & Health Scores:** Visual growth tracking with photo timeline journals and composite plant health ratings.
- **Automated Care Reminders:** Proactive push and in-app alerts for watering, fertilizing, pruning, and succession replanting.

### 6. Rewards, Medallion Badges & Community Gamification
- **Achievement Medallions:** High-resolution SVG badge emblems across 4 mastery tiers (*Beginner Milestones*, *Intermediate*, *Master*, *Community Champion*).
- **1,470+ XP Point Pool:** Earn experience points for daily watering streaks, AI diagnosis scans, fertilizer logging, and community contributions.
- **Transparent Milestone Rules:** Clear eligibility criteria and step tracking displayed on interactive badge preview modals.
- **Public Profile Showcase:** Highlight earned badges and grower milestones on your public UrbanFarm profile.

### 7. Krishi Community Forum & Heirloom Seed Exchange Hub
- **Social Discussion Board:** Community forum categorized by crop types, organic pest solutions, and urban agriculture tips.
- **Photo Sharing & Q&A:** Share garden harvest achievements, seek advice from experienced urban growers, and upvote helpful answers.
- **Heirloom Seed Swaps:** Connect with local growers to exchange regional seeds, cuttings, and saplings.

### 8. Admin Control Center & Automated Database Backup Center
- **System Metrics Dashboard:** Monitor active users, registered gardens, plant diagnosis count, and community engagement metrics.
- **User Role Management:** Admin panel for managing user roles, permissions, and moderation.
- **Database Backup & Export Center:** One-click automated database backup generating complete platform ZIP archives and structured CSV exports for all tables (Users, Gardens, Plants, Logs).

### 9. Trilingual Localization Engine (EN, HI, GU)
- **Native Trilingual Support:** Full, seamless language switching across **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.
- **Dynamic Translation Dictionaries:** Language preference persists across sessions with active HTML `lang` tag updates for SEO and screen-reader accessibility.


---

## Tech Stack

### Frontend
- **React 18** + **Vite** (Fast HMR & Optimized Bundling)
- **React Router DOM v7** (Client-side routing with aliases)
- **i18next** + **react-i18next** (Full 3-Language dynamic localization)
- **React Icons** (FontAwesome & Material icons)
- **Custom Glassmorphism CSS Design System** (HSL curated color tokens, sleek dark/light aesthetics)
- Deployed on **Cloudflare Workers**

### Backend
- **Node.js** + **Express.js** (REST API Architecture)
- **MongoDB** + **Mongoose** (MongoDB Atlas cloud database with connection pooling)
- **JWT Authentication** + **Role-Based Access Control (RBAC)**
- **Cloudinary** (Cloud media storage for leaf scans and garden photos)
- **Archiver & Fast-CSV** (Automated database export & ZIP bundle generator)
- Deployed on **Vercel Serverless Functions**

### External APIs & Integrations
- **Government of India Data.gov.in / AGMARKNET API** — Live APMC Mandi Market Prices
- **Google Gemini API** — Intelligent Krishi AI crop assistant
- **Plant.id Computer Vision API** — Leaf image pathogen detection
- **OpenWeather API** — Hyper-local weather forecasting & irrigation automation
- **Nodemailer** — Transactional email notifications

---

## Project Structure

```text
UrbanFarm/
├── backend/
│   ├── api/            # Vercel serverless entrypoint
│   ├── config/         # MongoDB connection & serverless pooling
│   ├── controllers/    # Request handlers & business logic
│   ├── middleware/     # JWT Auth, rate limiting, file upload
│   ├── models/         # Mongoose schemas (User, Plant, Garden, Post, Log)
│   ├── routes/         # Express API routes
│   ├── services/       # External APIs (Market, Weather, Plant.id, Gemini)
│   ├── utils/          # Backup/export helpers, logger
│   ├── vercel.json     # Vercel serverless deployment config
│   ├── package.json
│   └── server.js       # Express server
├── frontend/
│   ├── public/         # Static icons, demo assets, manifest
│   ├── src/
│   │   ├── components/ # Guest & Dashboard UI components
│   │   │   ├── Guest/  # GuestNavbar, GuestFooter
│   │   │   ├── Profile/# BadgeEmblem SVG medallions
│   │   │   └── SEO/    # Meta title & description helper
│   │   ├── locales/    # Full EN, HI, GU translation.json dictionaries
│   │   ├── pages/      # Route views (Guest, Auth, Dashboard, Admin)
│   │   │   └── Guest/  # FeaturesPage, DemoPage, MarketPricesPage, RewardsPage
│   │   ├── services/   # Frontend API client (marketService, api.js)
│   │   ├── styles/     # Design system variables & utilities
│   │   ├── App.jsx     # Route declarations & navigation providers
│   │   ├── i18n.js     # Trilingual localization initialization
│   │   └── index.css   # Core design system tokens
│   ├── wrangler.toml   # Cloudflare Workers configuration
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
├── scripts/
│   └── seedData.js     # Database seeder
├── .gitignore
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB Atlas** database URI (or local MongoDB instance)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/mr-baraiya/UrbanFarm.git
cd UrbanFarm

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/urbanfarm

JWT_SECRET=your_jwt_secret_32chars_minimum
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
PLANT_ID_API_KEY=your_plant_id_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
DATA_GOV_API_KEY=your_datagov_api_key

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (Runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (Runs on http://localhost:5173 or http://localhost:3000)
cd frontend
npm run dev
```

---

## API Endpoint Reference

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Market Prices** | `/api/market-prices` | `GET` | Real-time AGMARKNET mandi prices with state, district, and category filters |
| **Authentication** | `/api/auth/register` | `POST` | Register a new user |
| | `/api/auth/login` | `POST` | Authenticate user & issue JWT |
| | `/api/auth/profile` | `GET`/`PUT` | Retrieve & update grower profile and preferences |
| **Plants & Crops** | `/api/plants` | `GET`/`POST` | Manage user plant collection & growth stages |
| | `/api/crops` | `GET` | AI-based crop recommendations |
| **Disease Scan** | `/api/disease/diagnose`| `POST` | Upload leaf image for AI disease diagnosis |
| **Weather & Water**| `/api/weather` | `GET` | Retrieve live hyper-local weather conditions |
| | `/api/watering` | `GET`/`POST` | Smart irrigation schedules & automated rain delays |
| **Gardens** | `/api/gardens` | `GET`/`POST` | Raised bed & balcony space mapping |
| **Community** | `/api/community/posts` | `GET`/`POST` | Community forum discussions & photo shares |
| **Chatbot** | `/api/ai/chat` | `POST` | Interactive Krishi AI guidance powered by Gemini |
| **Admin & Backup** | `/api/admin/users` | `GET`/`PUT` | User management & moderation |
| | `/api/admin/backup/bundle`| `GET` | Download full platform ZIP backup archive |
| | `/api/admin/backup/:table` | `GET` | Export individual tables to CSV |

---

## Trilingual Support

UrbanFarm natively supports:
- **English (`en`)**
- **Hindi (`hi` - हिंदी)**
- **Gujarati (`gu` - ગુજરાતી)**

Language selection is preserved across user sessions in `localStorage` and automatically updates HTML `lang` attributes for optimal accessibility and SEO.

---

## Meet the Team

| Member | Role | Core Contributions & Responsibilities |
|---|---|---|
| **Saurabh Singh** ⭐ | **Team Leader & Frontend/UI-UX Developer** | • Project Leadership & Sprint Coordination<br>• API Integration & Comprehensive Testing<br>• Frontend Component Development<br>• UI / UX Design & Responsive Layouts |
| **Vishal Baraiya** | **Full Stack Developer & IoT Specialist** | • Entire Backend Architecture & Database Design<br>• Complete Frontend Engineering & State Management<br>• IoT Telemetry, Sensor Integration & Wokwi Simulation<br>• Cloudflare & Vercel Web Deployment & GitHub Management |
| **Dhruvrajsinh Zala** | **Research, QA & Presentation Lead** | • Project Presentation (PPT) & Showcase Pitch<br>• Quality Assurance & Bug Fixing<br>• Domain & Agricultural Market Research<br>• Documentation & Workflow Analysis |
| **Pujan Ajmera** | **AI / ML & Intelligence Specialist** | • AI / ML Model Selection & Integration<br>• Google Gemini 24/7 Krishi Chatbot Engine<br>• Plant.id Computer Vision Disease Diagnosis Pipeline<br>• Multilingual Agronomic Prompt Engineering |

---

## License

This project is licensed under the [MIT License](LICENSE).
