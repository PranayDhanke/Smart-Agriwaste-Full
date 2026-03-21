import { configDotenv } from "dotenv";

configDotenv();

const requireEnv = (key: string) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const optionalCsv = (value?: string) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: requireEnv("MONGO_URI"),
  adminBootstrapEmails: optionalCsv(process.env.ADMIN_BOOTSTRAP_EMAILS).map(
    (email) => email.toLowerCase(),
  ),
  logLevel: process.env.LOG_LEVEL?.trim().toLowerCase() || "info",
  corsOrigins: optionalCsv(process.env.CORS_ORIGINS).length
    ? optionalCsv(process.env.CORS_ORIGINS)
    : [
        "http://localhost:3000",
        "https://smart-agriwaste.vercel.app",
        "https://smart-agriwaste-full.onrender.com",
      ],
} as const;

export const isProduction = env.nodeEnv === "production";
