# Backend

Express + TypeScript API for Smart Agriwaste.

## What It Handles

- Buyer and farmer account APIs
- Clerk webhook integration
- Waste listing CRUD
- Negotiation workflows
- Order workflows
- Notification APIs
- ImageKit auth endpoint
- Socket.IO server support through the backend server

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- Clerk
- Socket.IO
- ImageKit
- OneSignal

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in `backend/`.

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm start
```

Default server port is `5000`.

## Scripts

- `npm run dev` - start with `ts-node-dev`
- `npm run build` - compile TypeScript
- `npm start` - run compiled server from `dist`

## Required Environment Variables

```env
MONGO_URI=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
CLERK_WEBHOOK_SECRET=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
AZURE_TRANSLATOR_ENDPOINT=
AZURE_TRANSLATOR_KEY=
AZURE_TRANSLATOR_REGION=
```

## Main API Base

Local base URL:

```txt
http://localhost:5000/api
```

## Main Route Groups

- `/api/buyer`
- `/api/farmer`
- `/api/waste`
- `/api/order`
- `/api/negotiation`
- `/api/notification`
- `/api/imagekit`
- `/api/webhooks`

## CORS

Configured to allow:

- `http://localhost:3000`
- `https://smart-agriwaste.vercel.app`

## Project Structure

```txt
backend/
  src/
    config/
    controllers/
    lib/
    middlewares/
    models/
    routes/
    app.ts
    server.ts
```

## Notes

- `src/server.ts` starts the HTTP and Socket.IO server.
- `src/app.ts` registers middleware and REST routes.
- MongoDB must be running before the API starts.
