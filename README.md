# Smart Agriwaste

Smart Agriwaste is a full-stack platform for managing agricultural waste, getting reuse recommendations, and connecting farmers with buyers through a marketplace.

## Overview

This repository contains three apps:

- `frontend/` - Next.js 16 app for the user interface
- `backend/` - Express + TypeScript API with Socket.IO
- `dataset-api/` - Go + Gin microservice for recommendation data

## Features

- Waste processing recommendations
- Waste listing and marketplace discovery
- Negotiation and order workflows
- Notifications and realtime chat
- Multilingual frontend experience

## Tech Stack

- Frontend: Next.js, React, TypeScript, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Mongoose, Socket.IO
- Dataset API: Go, Gin, MongoDB
- Database: MongoDB

## Prerequisites

Install these before running the project:

- Node.js 20+ and npm
- Go 1.25+
- MongoDB local or a reachable MongoDB Atlas cluster
- Docker Desktop and Docker Compose if you want to use containers
- Task if you want to use the root task runner

## Project Structure

```txt
FinalY/
  frontend/
  backend/
  dataset-api/
  docker-compose.yml
  Taskfile.yml
  .env.example
```

## Environment Files

Example environment files are already included:

- [`.env.example`](/a:/FinalY/.env.example)
- [`frontend/.env.example`](/a:/FinalY/frontend/.env.example)
- [`backend/.env.example`](/a:/FinalY/backend/.env.example)
- [`dataset-api/.env.example`](/a:/FinalY/dataset-api/.env.example)

For local development, create:

- `frontend/.env`
- `backend/.env`
- `dataset-api/.env`

You usually do not need a root `.env` unless you want to centralize values for Docker Compose.

## Quick Start

### Option 1: Run Locally

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Install backend dependencies:

```bash
cd ../backend
npm install
```

3. Install Go dependencies:

```bash
cd ../dataset-api
go mod download
```

4. Create the service `.env` files from the examples.

5. Start MongoDB if you are using a local database.

6. Start the backend:

```bash
cd backend
npm run dev
```

7. Start the dataset API in another terminal:

```bash
cd dataset-api
go run .
```

8. Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

9. Open the app:

```txt
http://localhost:3000
```

### Option 2: Run With Task

This repo uses [`Taskfile.yml`](/a:/FinalY/Taskfile.yml), not a `Makefile`.

Useful commands:

```bash
task up
task down
task logs
task restart
task typecheck
task dev-backend
task dev-dataset
task dev-frontend
task dev-all
```

### Option 3: Run With Docker

Start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

Default ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Dataset API: `http://localhost:8080`
- MongoDB: `mongodb://localhost:27017`

## Local Run Order

For the smoothest local setup, start services in this order:

1. MongoDB
2. Backend
3. Dataset API
4. Frontend

The frontend depends on both APIs, and both APIs depend on MongoDB.

## Minimum Local Environment Values

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-agriwaste
CORS_ORIGINS=http://localhost:3000
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
CLERK_WEBHOOK_SECRET=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
AZURE_TRANSLATOR_ENDPOINT=
AZURE_TRANSLATOR_KEY=
AZURE_TRANSLATOR_REGION=
```

### `dataset-api/.env`

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/smart-agriwaste
```

### `frontend/.env`

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_AGRI_API_URL=http://localhost:8080
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT=http://localhost:5000/api/imagekit/auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_ONESIGNAL_APP_ID=
CLERK_SECRET_KEY=
```

## Useful URLs

After startup, these are the main local URLs:

- Frontend app: `http://localhost:3000`
- Backend root: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`
- Backend docs: `http://localhost:5000/docs`
- Backend OpenAPI JSON: `http://localhost:5000/openapi.json`
- Dataset API endpoint: `http://localhost:8080/recommendation`

## Validation Commands

You can validate the codebase without starting everything:

```bash
cd backend
npm run typecheck
```

```bash
cd frontend
npx tsc --noEmit
```

```bash
cd dataset-api
go test ./...
```

## Common Issues

### MongoDB connection errors

- Make sure MongoDB is running or your Atlas URI is reachable
- Confirm `MONGO_URI` is set in both `backend/.env` and `dataset-api/.env`
- If using Atlas, verify IP/network access rules

### Frontend cannot reach backend

- Confirm backend is running on port `5000`
- Check `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SOCKET_URL`

### Recommendation page returns no data

- Confirm dataset API is running on port `8080`
- Check that the `recommendations` collection contains matching records
- Verify `NEXT_PUBLIC_AGRI_API_URL` points to the right host

### `task` command not found

- Install Task globally, or run services manually with the local commands above

## Additional Docs

- [Backend Architecture](/a:/FinalY/backend/docs/ARCHITECTURE.md)
- [Backend Database Models](/a:/FinalY/backend/docs/DATABASE-MODELS.md)
- [Backend Project Structure](/a:/FinalY/backend/docs/PROJECT-STRUCTURE.md)
- [Backend README](/a:/FinalY/backend/README.md)
- [Frontend README](/a:/FinalY/frontend/README.md)
- [Dataset API README](/a:/FinalY/dataset-api/README.md) 

