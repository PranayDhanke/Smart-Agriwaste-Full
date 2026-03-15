# Dataset API

Go + Gin microservice for waste-process recommendations.

## What It Does

This service looks up recommendation records from MongoDB and returns:

- process steps
- final output
- benefits
- notes

It is used by the frontend recommendation flow.

## Tech Stack

- Go
- Gin
- MongoDB

## Run Locally

1. Install dependencies:

```bash
go mod download
```

2. Create a `.env` file in `dataset-api/`.

3. Start the server:

```bash
go run .
```

Default port is `8080` unless `PORT` is set.

## Required Environment Variables

```env
MONGO_URI=
PORT=8080
```

## Main Endpoint

```txt
GET /recommendation
```

### Query Parameters

- `product` - product id
- `moisture` - moisture level
- `intendedUse` - desired use case
- `lang` - optional language, defaults to `en`

### Example

```txt
http://localhost:8080/recommendation?product=rice_straw&moisture=dry&intendedUse=compost&lang=en
```

### Success Response

```json
{
  "process": ["..."],
  "finalOutput": ["..."],
  "benefits": ["..."],
  "notes": ["..."]
}
```

### Not Found Response

```json
{
  "error": "Recommendation not found"
}
```

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

- The service connects to MongoDB during startup.
- If the requested language key is missing, it falls back to English.
- CORS is enabled for local frontend and deployed frontend usage.
