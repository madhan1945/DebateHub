# Render Single-Service Deployment

This repo is configured to run as one Render web service.

## Render Settings

- Service type: `Web Service`
- Root directory: leave blank
- Build command: `npm install && npm run build`
- Start command: `npm start`

## Environment Variables

```env
NODE_ENV=production
VITE_API_URL=/api
CLIENT_URL=https://your-service-name.onrender.com
CLIENT_URLS=https://your-service-name.onrender.com
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_api_key
```

After you attach a custom domain, update `CLIENT_URL` and `CLIENT_URLS` to that domain.

## Local Commands

```powershell
cd d:\Projects\DebateHub
npm install
npm run build
npm start
```

## How It Works

- Root `server.js` serves the React build and Express API together
- `backend/createServer.js` sets up the API, database, and Socket.IO server
- Render deploys the repo root as a single service and exposes one public URL
