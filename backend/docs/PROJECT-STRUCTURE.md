# Project Structure

```txt
backend/
  docs/
    ARCHITECTURE.md
    DATABASE-MODELS.md
    PROJECT-STRUCTURE.md
  src/
    config/         # runtime config and external SDK config
    controllers/    # HTTP layer (request/response)
    lib/            # infra helpers (db, socket, translation, notifications)
    middlewares/    # express middlewares (errors, not-found)
    models/         # mongoose schemas
    repositories/   # data access layer
    routes/         # API route definitions
    services/       # business logic layer
    utils/          # shared helpers (AppError, asyncHandler, pagination)
    app.ts          # express app composition
    server.ts       # HTTP server bootstrap and graceful shutdown
  dist/             # compiled output
  package.json
  tsconfig.json
```

## Module Conventions

- `routes/*`: no business logic.
- `controllers/*`: no direct query logic when service exists.
- `services/*`: domain rules and orchestration.
- `repositories/*`: direct model interaction only.

## Scaling Guidance

- Add new feature modules by following the same route -> controller -> service -> repository pattern.
- Keep shared concerns in `utils`, `middlewares`, or `lib` instead of duplicating per module.
