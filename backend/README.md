# Backend

Express + TypeScript API for Smart Agriwaste.

## Responsibilities

The backend handles:

- Buyer and farmer account APIs
- Clerk webhook integration
- Waste listing CRUD
- Negotiation and order workflows
- Notification APIs
- ImageKit auth
- Realtime chat via Socket.IO

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- Clerk
- Socket.IO
- ImageKit
- OneSignal

## Prerequisites

- Node.js 20+ and npm
- MongoDB local or a reachable MongoDB Atlas cluster

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `backend/.env` from [`backend/.env.example`](/a:/FinalY/backend/.env.example).

3. Fill in the required values.

## Required Environment Variables

```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=info
MONGO_URI=mongodb://localhost:27017/smart-agriwaste
CORS_ORIGINS=http://localhost:3000,https://smart-agriwaste.vercel.app,https://smart-agriwaste-full.onrender.com
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
CLERK_WEBHOOK_SECRET=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Type-check:

```bash
npm run typecheck
```

Build for production:

```bash
npm run build
```

Run the production build:

```bash
npm start
```

Default local port:

```txt
http://localhost:5000
```

## Important Endpoints

- Root: `GET /`
- Health: `GET /health`
- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`
- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`

API base:

```txt
http://localhost:5000/api
```

Main route groups:

- `/api/buyer`
- `/api/farmer`
- `/api/waste`
- `/api/order`
- `/api/negotiation`
- `/api/notification`
- `/api/imagekit`
- `/api/webhooks`
- `/api/community`

## Local Startup Checklist

Before starting the server, make sure:

- MongoDB is running or reachable
- `MONGO_URI` is valid
- `PORT` is free
- `CORS_ORIGINS` includes the frontend URL, usually `http://localhost:3000`

## Project Structure

```txt
backend/
  docs/
    ARCHITECTURE.md
    DATABASE-MODELS.md
    PROJECT-STRUCTURE.md
  src/
    config/
    controllers/
    docs/
    lib/
    middlewares/
    models/
    repositories/
    routes/
    services/
    utils/
    app.ts
    server.ts
```

## Notes

- [`server.ts`](/a:/FinalY/backend/src/server.ts) starts the HTTP server, Mongo connection, and Socket.IO
- [`app.ts`](/a:/FinalY/backend/src/app.ts) wires middleware, health routes, docs, and API routes
- Core modules like waste and order use controller -> service -> repository layering

## Related Docs

- [Architecture](/a:/FinalY/backend/docs/ARCHITECTURE.md)
- [Database Models](/a:/FinalY/backend/docs/DATABASE-MODELS.md)
- [Project Structure](/a:/FinalY/backend/docs/PROJECT-STRUCTURE.md)
