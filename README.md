# Urban Farming Assistant

Urban Farming Assistant is a full-stack web application designed to help urban gardeners plan, monitor, and maintain home growing spaces. The platform combines plant record management, weather-aware watering recommendations, crop suggestions, image-based plant disease diagnosis, community discussions, and administration controls.

## Features

### Smart Crop Recommendations
- Provides suitable crop suggestions and planting guidelines based on user location and climate conditions.
- Integrates weather analysis with plant needs.

### Plant Disease Diagnosis
- Enables image upload for automated plant disease identification.
- Delivers diagnosis results and actionable treatment advice.

### Weather-Aware Watering Schedule
- Generates adjusted watering recommendations based on real-time weather metrics.
- Provides care reminders to keep plants healthy.

### Garden and Plant Management
- Add, update, and track gardens and individual plant records.
- Monitor plant health status and watering history.

### Community Engagement
- Create community posts and share gardening updates.
- Interact via comments and likes on community posts.
- View community member contributions and leaderboards.

### Admin Controls
- Review flagged content and moderate user posts.
- Manage users and platform activity.

### Authentication and Roles
- Secure user registration and login with JWT authentication.
- Role-based authorization for administrative access.

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Custom CSS styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Cloudinary for image and media management
- Express rate limiting and security middleware

### External Services and APIs
- Google Gemini API
- Plant.id API
- OpenWeather API
- Nodemailer for email notifications

## Project Structure

```text
UrbanFarm/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── scripts/
│   └── seedData.js
├── .gitignore
└── README.md
```

## Environment Setup

The project requires environment configuration files for both backend and frontend services.

### Backend Environment (.env)

Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/urban_farming
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PLANT_ID_API_KEY=your_plant_id_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

### Frontend Environment (.env)

Create a `.env` file in the `frontend/` directory based on `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas cluster)

### Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mr-baraiya/UrbanFarm.git
   cd UrbanFarm
   ```

2. **Configure Environment Files:**
   - **Backend Environment**: Copy `backend/.env.example` to `backend/.env` and update your secret keys & database URI.
     ```bash
     cp backend/.env.example backend/.env
     ```
   - **Frontend Environment**: Copy `frontend/.env.example` to `frontend/.env`.
     ```bash
     cp frontend/.env.example frontend/.env
     ```

3. **Install Dependencies:**

   - **Backend:**
     ```bash
     cd backend
     npm install
     ```

   - **Frontend:**
     ```bash
     cd ../frontend
     npm install
     ```

### Running the Application

1. **Start MongoDB:** Ensure local MongoDB server service is running or MongoDB Atlas connection string is configured in `backend/.env`.

2. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   > The API server will start at: `http://localhost:5000`

3. **Start Frontend Client:**
   Open a **new terminal window/tab** and run:
   ```bash
   cd frontend
   npm run dev
   ```
   > The frontend dev server will start at: `http://localhost:5173`

### Database Seeding (Optional)

To seed initial plant database records, run:
```bash
cd backend
node ../scripts/seedData.js
```

### Creating an Admin Account

To generate an administrator account for managing platform content:
```bash
cd backend
node scripts/create-admin.js admin@example.com AdminPassword123 "Admin User" adminuser
```

## API Endpoint Reference

- Auth: `/api/auth` (register, login, user profile)
- Gardens: `/api/gardens` (CRUD operations for user gardens)
- Plants: `/api/plants` (CRUD operations for plant entries)
- Crop Recommendation: `/api/crops` (crop guidelines and AI recommendations)
- Disease Diagnosis: `/api/disease` (AI plant image health diagnosis)
- Weather & Watering: `/api/weather`, `/api/watering` (weather data and automated care plans)
- Community: `/api/community` (posts, comments, likes, leaderboard)
- Admin: `/api/admin` (moderation and content management)
- Uploads: `/api/upload` (media handling via Cloudinary)
