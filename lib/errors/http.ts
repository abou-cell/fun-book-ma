import { NextResponse } from "next/server";

import { captureException } from "@/lib/observability/monitoring";
import { logger } from "@/lib/observability/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code = "APP_ERROR",
    public expose = true,
  ) {
    super(message);
  }
}

export function toErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof AppError && error.expose) {
    return error.message;
  }

  return fallback;
}

export function handleRouteError(error: unknown, context: { route: string; fallbackMessage?: string }) {
  captureException(error, { route: context.route });

  const status = error instanceof AppError ? error.statusCode : 500;
  const message = toErrorMessage(error, context.fallbackMessage ?? "Unexpected server error.");

  logger.error("API request failed", {
    route: context.route,
    status,
    reason: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json({ error: message }, { status });
}
