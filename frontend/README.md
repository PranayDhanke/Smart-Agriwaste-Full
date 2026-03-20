# Frontend

Next.js 16 frontend for Smart Agriwaste.

## Responsibilities

The frontend provides:

- Farmer and buyer dashboards
- Waste listing and editing flows
- Marketplace browsing
- Negotiation and order management
- Recommendation flow powered by the dataset API
- Authentication with Clerk
- Realtime notifications and chat
- Multilingual UI with `next-intl`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Redux Toolkit and RTK Query
- Tailwind CSS
- Clerk
- Socket.IO client
- Leaflet and React Leaflet
- OneSignal

## Prerequisites

- Node.js 20+ and npm
- Running backend API
- Running dataset API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `frontend/.env` from [`frontend/.env.example`](/a:/FinalY/frontend/.env.example).

3. Update the API URLs and public keys you need for local development.

## Required Environment Variables

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_AGRI_API_URL=http://localhost:8080
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_H1AjdWUA1HD2x8wIcSRh1/TDlZ4=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/glegrwdpvm
NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT=http://localhost:5000/api/imagekit/auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_ONESIGNAL_APP_ID=
CLERK_SECRET_KEY=
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the production build:

```bash
npm run start
```

Run lint:

```bash
npm run lint
```

Default local URL:

```txt
http://localhost:3000
```

## Runtime Service Dependencies

The frontend expects these services:

- Backend API at `http://localhost:5000/api`
- Backend Socket.IO server at `http://localhost:5000`
- Dataset API at `http://localhost:8080`

Those values are controlled through:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_AGRI_API_URL`
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT`

## Local Startup Checklist

Before opening the app, make sure:

- The backend is running
- The dataset API is running
- The Clerk keys are present if you need auth flows
- The ImageKit keys are present if you need uploads
- The OneSignal app id is present if you need push notifications

## Key App Areas

```txt
frontend/
  public/
  src/
    app/
    components/
    config/
    i18n/
    lib/
    messages/
    redux/
```

## Notes

- Runtime API and socket URLs are centralized in [`src/config/env.ts`](/a:/FinalY/frontend/src/config/env.ts)
- The app uses App Router and localized routes through `next-intl`
- Several features depend on backend credentials being configured correctly

## Related Docs

- [Root README](/a:/FinalY/README.md)
- [Backend README](/a:/FinalY/backend/README.md)
- [Dataset API README](/a:/FinalY/dataset-api/README.md)
