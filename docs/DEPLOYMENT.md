# BridgeSync Deployment Guide

This guide describes a practical deployment path for the MERN MVP. The recommended setup is:

- Frontend: Vercel, Netlify, or any static host.
- Backend: Render, Railway, Fly.io, or any Node.js host.
- Database: MongoDB Atlas.

## 1. Required Environment Variables

Create these variables in the backend hosting dashboard:

```env
PORT=3000
DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<different-long-random-secret>
JWT_EXPIRES_IN=30m
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
DEEPL_API_KEY=<optional-deepl-api-key>
FRONTEND_ORIGIN=https://<your-frontend-domain>
```

For local development, keep these in `server/.env`.

## 2. Backend Deployment

### Render or Railway

Use these settings:

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Install command | `npm ci` |
| Build command | empty |
| Start command | `npm start` |
| Node version | 20+ |

Before deploying:

```bash
cd server
npm ci
npm test
```

After deploying:

- Confirm the service starts and prints `Database connected`.
- Confirm `/api/auth/login` responds from the deployed backend.
- Add the deployed backend URL to the frontend API configuration.

## 3. Frontend Deployment

Use these settings:

| Setting | Value |
| --- | --- |
| Root directory | repository root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

The current frontend calls relative `/api` paths during local development through the Vite proxy. In production, use one of these approaches:

### Option A: Same-Origin Reverse Proxy

Host frontend and backend behind the same domain so `/api` routes proxy to the backend. This keeps the current frontend API client unchanged.

### Option B: Vite Production API Base

The frontend already reads `VITE_API_BASE_URL` through the shared API client. Add this frontend environment variable in the hosting dashboard:

```env
VITE_API_BASE_URL=https://<your-backend-domain>/api
```

If the variable is not set, the app falls back to relative `/api` paths for local Vite proxy development.

## 4. CORS Configuration

The backend currently allows the Vite local origin. For production, update `server/app.js` to allow the deployed frontend origin:

```js
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
```

This prevents browser CORS failures after deployment.

## 5. MongoDB Atlas Checklist

- [ ] Create a dedicated database user for BridgeSync.
- [ ] Use a strong password and avoid committing it.
- [ ] Allow backend host IPs in Network Access.
- [ ] For Render/Railway dynamic IPs, use `0.0.0.0/0` only for course demo or temporary pilot.
- [ ] Confirm collections are created after first signup/project creation.

## 6. Production Smoke Test

After deployment, run this demo flow:

1. Open frontend URL.
2. Sign up or log in as PM.
3. Create a project.
4. Add project members.
5. Log in as Developer.
6. Confirm Developer only sees assigned projects.
7. Create/update tasks.
8. Create an Hourenso report.
9. Export reports to Excel.
10. Log in as Japanese client and confirm view-only behavior.

## 7. Rollback Plan

For course demo, keep a known-good local build ready:

```bash
npm ci
cd server && npm ci && cd ..
npm run lint
npm test
npm run build
npm run dev
```

If cloud deployment fails during presentation, use local `npm run dev` and show the same UAT flow.

## 8. Pre-Submission Gate

Do not submit or deploy a new version unless these pass:

```bash
npm run lint
npm test
npm run build
```

Also run the manual checklist in `docs/UAT_CHECKLIST.md`.
