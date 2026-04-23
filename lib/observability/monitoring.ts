import { env } from "@/lib/env";
import { logger } from "@/lib/observability/logger";

type MonitoringContext = Record<string, unknown>;

export function captureException(error: unknown, context?: MonitoringContext) {
  logger.error("Unhandled exception captured", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  if (!env.MONITORING_DSN) {
    return;
  }

  // Placeholder for Sentry/DataDog/etc.
}

export function captureMessage(message: string, context?: MonitoringContext) {
  logger.info(message, context);
}

export async function withServerSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();

  try {
    return await fn();
  } finally {
    logger.debug("Server span completed", {
      span: name,
      durationMs: Date.now() - startedAt,
    });
  }
}
