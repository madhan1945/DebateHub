# Single-Domain Deployment

This project can be deployed behind one public URL such as `https://yourdomain.com`.

## Architecture

- Next.js frontend runs on port `3000`
- Express + Socket.IO backend runs on port `5000`
- A reverse proxy routes:
- `/` to the frontend
- `/api` to the backend
- `/socket.io` to the backend

Users only open one link: `https://yourdomain.com`

## Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=/api
INTERNAL_API_URL=http://127.0.0.1:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Backend Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/debatehub
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=https://yourdomain.com
CLIENT_URLS=https://yourdomain.com
NODE_ENV=production
```

## Run Commands

Frontend:

```powershell
cd frontend
npm install
npm run build
npm run start
```

Backend:

```powershell
cd backend
npm install
npm start
```

## Example Nginx Config

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Hosting Options

- VPS + Nginx + PM2
- Railway with a frontend service, backend service, and custom domain routed through one proxy
- Render with a reverse proxy in front
- Any platform that lets you route `/api` and `/socket.io` to the backend

## Important Notes

- The frontend now defaults to same-origin `/api` calls.
- Socket.IO now defaults to the same domain instead of `localhost`.
- The support chat page no longer hardcodes `http://localhost:5000`.
<!--  -->