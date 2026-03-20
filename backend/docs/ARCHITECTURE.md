# Architecture Guide

## Goals

- Keep existing API contracts stable.
- Make modules easier to scale with clear layering.
- Centralize business logic away from route handlers.

## Layered Design

The backend now follows this flow for core modules (`order`, `waste`):

1. `routes`  
Route mapping only.
2. `controllers`  
HTTP concerns only: parse request, validate basic inputs, send response.
3. `services`  
Business rules, transactions, orchestration, validation logic.
4. `repositories`  
Data access logic (Mongoose queries).
5. `models`  
Schema definitions and indexes.

## Request Lifecycle

1. Client hits endpoint in `src/routes/*`.
2. Controller method in `src/controllers/*` executes via `asyncHandler`.
3. Controller calls service function in `src/services/*`.
4. Service reads/writes via `src/repositories/*`.
5. Repository uses Mongoose models in `src/models/*`.
6. Errors are normalized by `src/middlewares/error.middleware.ts`.

## Error Strategy

- Use `AppError` for known operational failures.
- Global error middleware maps common validation/cast errors.
- Non-production mode includes stack traces for easier debugging.

## Transaction Boundary

- `orderService.confirmOrder` uses a MongoDB session transaction.
- Stock validation and stock deduction happen in one transaction flow.

## Production Readiness Notes

- `app.ts` has structured middleware order, health endpoint, and 404 handling.
- Environment configuration is centralized in `src/config/env.ts`.
- Centralized JSON logging is implemented via `src/lib/logger.ts`.
- Every HTTP response now includes `x-request-id` and request logs include that ID.
- This refactor is incremental: not all modules are fully layered yet.
