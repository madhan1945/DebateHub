# DebateHub 🗣️

**The platform where the best argument wins.**

DebateHub is a full-stack web application for structured online debates with real-time chat, voting, AI features, and a reputation system.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB Atlas + Mongoose                |
| Real-Time   | Socket.IO                               |
| Auth        | JWT + Google OAuth                      |
| Deployment  | React static build + Render/Express backend    |

---

## Project Structure

```
DebateHub/
├── backend/
│   ├── config/         # db.js, jwt.js
│   ├── controllers/    # authController.js
│   ├── middleware/     # auth.js, errorHandler.js
│   ├── models/         # User.js
│   ├── routes/         # auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── auth/
    │   │   ├── login/page.js
    │   │   ├── register/page.js
    │   │   └── layout.js
    │   ├── globals.css
    │   ├── layout.js
    │   └── page.js         # Landing page
    ├── components/
    │   ├── layout/Navbar.js
    │   └── ui/Button.js, Input.js, ThemeToggle.js
    ├── lib/
    │   ├── api.js          # Axios client
    │   └── auth.js         # AuthContext + useAuth
    └── package.json
```

---

## Day 1 Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud Console project (for OAuth)

### Backend

```powershell
cd DebateHub\backend
npm install
Copy-Item .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend

```powershell
cd DebateHub\frontend
npm install
Copy-Item .env.local.example .env.local
# Edit .env.local with your values
npm run dev
```

### Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/debatehub
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env.local**
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## API Endpoints (Day 1)

| Method | Route                       | Auth     | Description            |
|--------|-----------------------------|----------|------------------------|
| GET    | /health                     | Public   | Health check           |
| POST   | /api/auth/register          | Public   | Register new user      |
| POST   | /api/auth/login             | Public   | Login with email/pass  |
| POST   | /api/auth/google            | Public   | Google OAuth login     |
| GET    | /api/auth/me                | Private  | Get current user       |
| PUT    | /api/auth/update-profile    | Private  | Update profile         |
| PUT    | /api/auth/change-password   | Private  | Change password        |
| GET    | /api/auth/profile/:username | Public   | Get public profile     |

---

## Build Plan

| Day | Focus                                      |
|-----|--------------------------------------------|
| 1   | ✅ Setup, Auth, Database, Landing Page      |
| 2   | Debates, Arguments, Voting, Ranking        |
| 3   | Real-Time (Socket.IO), Profiles, Search    |
| 4   | AI Features, Leaderboard, Admin Panel      |
| 5   | Testing, Deployment (React build + Render)      |

---

## Deployment

**Backend → Render**
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Build command: `npm install`
5. Start command: `node server.js`

**Frontend static build**
1. Build the frontend with `npm run build`
2. Serve `frontend/dist` from your static host or the unified Express server
3. Add environment variables (`VITE_API_URL` pointing to Render URL)
4. Deploy the generated static assets

---

## License

MIT
