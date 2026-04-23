import { env } from "@/lib/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

type SafeMetadata = Record<string, unknown>;

function shouldLog(level: LogLevel) {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[env.APP_LOG_LEVEL];
}

function redactSensitive(meta?: SafeMetadata) {
  if (!meta) return undefined;

  const unsafeKeys = ["password", "token", "secret", "authorization", "cookie", "email"];

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => {
      if (unsafeKeys.some((unsafeKey) => key.toLowerCase().includes(unsafeKey))) {
        return [key, "[redacted]"];
      }

      return [key, value];
    }),
  );
}

function write(level: LogLevel, message: string, meta?: SafeMetadata) {
  if (!shouldLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: redactSensitive(meta) } : {}),
  };

  const line = env.isProduction ? JSON.stringify(payload) : payload;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: SafeMetadata) => write("debug", message, meta),
  info: (message: string, meta?: SafeMetadata) => write("info", message, meta),
  warn: (message: string, meta?: SafeMetadata) => write("warn", message, meta),
  error: (message: string, meta?: SafeMetadata) => write("error", message, meta),
};
