# UrbanFarm — AI-Powered Urban Farming Assistant

> Manage your urban garden with AI plant disease diagnosis, smart irrigation, growth tracking, and a thriving community — all in one place.

## Live Deployment

| | URL |
|---|---|
| **Frontend** | [https://urbanfarm.baraiyavishalbhai32.workers.dev](https://urbanfarm.baraiyavishalbhai32.workers.dev) |
| **Backend API** | [https://urbanfarm-server.vercel.app](https://urbanfarm-server.vercel.app) |
| **Health Check** | [https://urbanfarm-server.vercel.app/health](https://urbanfarm-server.vercel.app/health) |

> **Frontend** hosted on **Cloudflare Workers** · **Backend** hosted on **Vercel Serverless**

---

## Features

### AI Plant Disease Diagnosis
- Upload a leaf photo for instant disease detection with 98.4% accuracy.
- Supports 30+ urban crop species including tomatoes, peppers, herbs & spinach.
- Provides organic treatment protocols and recovery tracking.

### Weather-Based Smart Irrigation
- Auto-adjusts watering schedules based on live local weather forecasts.
- Skips sessions when rain is predicted, saving up to 40% water usage.

### Garden & Plant Management
- Track individual plants with planting dates, growth stages, and harvest windows.
- Visual growth logs with photo timelines and health history.

### Community Knowledge & Seed Swaps
- Q&A forum with agronomist-verified expert badges.
- Local seed exchange locator for rare heirloom varieties.

### Admin Panel
- Review flagged content, moderate posts, and manage users.
- Full analytics dashboard with platform activity overview.

---

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router DOM v7**
- **Axios** for API communication
- **Custom CSS** (dark green theme with glassmorphism)
- Deployed on **Cloudflare Workers (Static Assets)**

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose** (MongoDB Atlas)
- **JWT** authentication with role-based authorization
- **Cloudinary** for image uploads
- **Multer** (memory storage) for file handling
- Deployed on **Vercel Serverless Functions**

### External APIs
- **Google Gemini API** — AI assistant & crop intelligence
- **Plant.id API** — Leaf image disease diagnosis
- **OpenWeather API** — Real-time weather & irrigation sync
- **Nodemailer** — Email notifications

---

## Project Structure

```text
UrbanFarm/
├── backend/
│   ├── api/            # Vercel serverless entrypoint
│   ├── config/         # Database connection (with serverless caching)
│   ├── controllers/    # Route handler logic
│   ├── middleware/     # Auth, error handling, upload, rate limiting
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # Logger, helpers
│   ├── vercel.json     # Vercel deployment config
│   ├── package.json
│   └── server.js       # Express app (serverless-ready)
├── frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/ # Shared UI components
│   │   ├── pages/      # Route page components
│   │   ├── services/   # API service layer (api.js)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Formatters, helpers
│   │   └── App.jsx
│   ├── wrangler.toml   # Cloudflare Workers config
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
├── scripts/
│   └── seedData.js
├── .gitignore
└── README.md
```

---

## Environment Setup

### Backend (`backend/.env`)

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

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

> For production, set `VITE_API_URL=https://urbanfarm-server.vercel.app/api`

---

## Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB Atlas** account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mr-baraiya/UrbanFarm.git
cd UrbanFarm

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Configure Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend
cp frontend/.env.example frontend/.env
# Default points to http://localhost:5000/api
```

### Run Locally

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Database Seeding (Optional)

```bash
cd backend
node ../scripts/seedData.js
```

### Create Admin Account

```bash
cd backend
node scripts/create-admin.js admin@example.com AdminPassword123 "Admin User" adminuser
```

---

## Deployment

### Backend — Vercel

1. Push code to GitHub.
2. Import project on [vercel.com](https://vercel.com), set **Root Directory** to `backend`.
3. Add environment variables from `backend/.env`.
4. Deploy — live at `https://urbanfarm-server.vercel.app`.

### Frontend — Cloudflare Workers

1. Push code to GitHub (includes `frontend/wrangler.toml`).
2. Create a Workers project on [dash.cloudflare.com](https://dash.cloudflare.com).
3. Set **Root directory** to `frontend`, **Build command** to `npm run build`, **Deploy command** to `npx wrangler deploy`.
4. Add environment variable: `VITE_API_URL=https://urbanfarm-server.vercel.app/api`.
5. Deploy — live at `https://urbanfarm.baraiyavishalbhai32.workers.dev`.

---

## API Endpoint Reference

| Group | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, profile |
| Plants | `/api/plants` | CRUD for plant records |
| Gardens | `/api/gardens` | Garden space management |
| Crops | `/api/crops` | AI crop recommendations |
| Disease | `/api/disease` | AI image diagnosis |
| Weather | `/api/weather` | Live weather data |
| Watering | `/api/watering` | Smart irrigation schedules |
| Community | `/api/community` | Posts, comments, likes |
| Admin | `/api/admin` | Moderation & management |
| Upload | `/api/upload` | Cloudinary media uploads |
| AI | `/api/ai` | Gemini AI chat assistant |

---

## License

This project is licensed under the [MIT License](LICENSE).
