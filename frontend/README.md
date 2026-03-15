# Frontend

Next.js 16 frontend for Smart Agriwaste.

## What It Includes

- Farmer and buyer dashboards
- Waste listing and editing flows
- Marketplace browsing
- Negotiation and order management
- Recommendation flow powered by the dataset API
- Authentication with Clerk
- Notifications and realtime chat
- Multilingual UI with `next-intl`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Redux Toolkit + RTK Query
- Tailwind CSS
- Clerk
- Socket.IO client
- Leaflet / React Leaflet
- OneSignal

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in `frontend/`.

3. Start the dev server:

```bash
npm run dev
```

4. Open:

```txt
http://localhost:3000
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - run ESLint

## Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_AGRI_API_URL=http://localhost:8080

NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT=http://localhost:5000/api/imagekit/auth

NEXT_PUBLIC_ONESIGNAL_APP_ID=
```

## Service Dependencies

The frontend talks to:

- Backend API for auth, profile, waste, order, negotiation, and notification flows
- Dataset API for recommendation data
- Backend Socket.IO server for realtime features

## Key App Areas

- `src/app/` - App Router pages and providers
- `src/components/` - shared UI and page-level components
- `src/redux/` - store, slices, selectors, RTK Query APIs
- `src/i18n/` - localized routing and message loading
- `public/` - static assets

## Runtime API Configuration

The app supports runtime endpoint configuration through:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_AGRI_API_URL`

Setting these explicitly is recommended for local development.

## Notes

- The app uses localized routes through `next-intl`.
- Clerk is required for sign-in, sign-up, and profile-aware navigation.
- Image uploads and push notifications depend on matching backend/service credentials.
