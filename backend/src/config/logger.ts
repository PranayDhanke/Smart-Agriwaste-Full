import { env, isProduction } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel: LogLevel =
  env.logLevel in levelPriority ? (env.logLevel as LogLevel) : "info";

const shouldLog = (level: LogLevel) =>
  levelPriority[level] >= levelPriority[configuredLevel];

const safeError = (value: unknown) => {
  if (!(value instanceof Error)) return value;

  return {
    name: value.name,
    message: value.message,
    ...(value.stack && !isProduction ? { stack: value.stack } : {}),
  };
};

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  if (!shouldLog(level)) return;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    env: env.nodeEnv,
    ...(meta ?? {}),
  };

  const serialized = JSON.stringify(payload, (_key, value) => safeError(value));

  if (level === "error") {
    process.stderr.write(`${serialized}\n`);
    return;
  }

  process.stdout.write(`${serialized}\n`);
};

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    writeLog("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    writeLog("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    writeLog("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    writeLog("error", message, meta),
};
