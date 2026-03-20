# Dataset API

Go + Gin microservice for waste-process recommendations.

## Responsibilities

This service reads recommendation records from MongoDB and returns:

- process steps
- final output
- benefits
- notes
- required materials
- process duration
- required equipment
- recommended for
- environmental impact

It powers the recommendation flow used by the frontend.

## Tech Stack

- Go
- Gin
- MongoDB

## Prerequisites

- Go 1.25+
- MongoDB local or a reachable MongoDB Atlas cluster

## Setup

1. Install dependencies:

```bash
go mod download
```

2. Create `dataset-api/.env` from [`dataset-api/.env.example`](/a:/FinalY/dataset-api/.env.example).

3. Set a valid MongoDB connection string.

## Required Environment Variables

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/smart-agriwaste
```

## Run Locally

Start the server:

```bash
go run .
```

Run tests:

```bash
go test ./...
```

Default local URL:

```txt
http://localhost:8080
```

## Endpoint

Main endpoint:

```txt
GET /recommendation
```

Example request:

```txt
http://localhost:8080/recommendation?product=rice_straw&moisture=dry&intendedUse=compost&lang=en
```

Query parameters:

- `product` - product id
- `moisture` - moisture level
- `intendedUse` - use case
- `lang` - optional language, defaults to `en`

## Example Success Response

```json
{
  "process": ["..."],
  "finalOutput": "...",
  "benefits": "...",
  "notes": "...",
  "requiredMaterials": ["..."],
  "processDuration": "...",
  "requiredEquipment": ["..."],
  "recommendedFor": ["..."],
  "environmentalImpact": "..."
}
```

## Example Error Response

```json
{
  "error": "Recommendation not found"
}
```

## Data Expectations

The service expects:

- a working MongoDB connection
- database name `agri_db`
- collection name `recommendations`
- documents matching `productId`, `moisture`, `intendedUse`, and `isActive: true`

## Project Structure

```txt
dataset-api/
  config/
  handlers/
  middleware/
  models/
  routes/
  main.go
```

## Notes

- The service connects to MongoDB during startup and exits if the connection fails
- If a localized field is missing, the handler falls back to English
- CORS allows local frontend usage and deployed frontend access

## Related Docs

- [Root README](/a:/FinalY/README.md)
- [Frontend README](/a:/FinalY/frontend/README.md)
- [Backend README](/a:/FinalY/backend/README.md)
