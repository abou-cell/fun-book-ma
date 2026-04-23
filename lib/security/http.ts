import { headers } from "next/headers";

import { AppError } from "@/lib/errors/http";
import { buildRateLimitKey, checkRateLimit } from "@/lib/security/rate-limit";

type RateLimitConfig = {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
  message: string;
};

const PRIVATE_IP_PREFIXES = ["127.", "10.", "192.168.", "::1"];

function parseForwardedHeader(forwarded: string | null) {
  if (!forwarded) return null;

  const firstEntry = forwarded.split(",")[0]?.trim();
  if (!firstEntry) return null;

  const forPart = firstEntry
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith("for="));

  if (!forPart) return null;

  return forPart.replace(/^for=/i, "").replaceAll('"', "").replace(/\]:(\d+)$/, "]").replace(/:(\d+)$/, "");
}

function extractFirstAddress(value: string | null) {
  if (!value) return null;
  const candidate = value.split(",")[0]?.trim();
  return candidate || null;
}

function sanitizeAddress(address: string | null) {
  if (!address) return null;

  const normalized = address.replaceAll('"', "").replace(/^\[/, "").replace(/\]$/, "");

  if (PRIVATE_IP_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return null;
  }

  return normalized;
}

export async function getClientIp() {
  const headerStore = await headers();

  const forwarded = parseForwardedHeader(headerStore.get("forwarded"));
  const xForwardedFor = extractFirstAddress(headerStore.get("x-forwarded-for"));
  const realIp = extractFirstAddress(headerStore.get("x-real-ip"));

  return sanitizeAddress(forwarded) ?? sanitizeAddress(xForwardedFor) ?? sanitizeAddress(realIp) ?? "anonymous";
}

export function enforceRateLimit(config: RateLimitConfig) {
  const outcome = checkRateLimit(
    buildRateLimitKey([config.namespace, config.identifier]),
    config.limit,
    config.windowMs,
  );

  if (!outcome.ok) {
    throw new AppError(config.message, 429, "RATE_LIMITED");
  }

  return {
    "x-ratelimit-limit": String(config.limit),
    "x-ratelimit-remaining": String(outcome.remaining),
    "x-ratelimit-reset": String(Math.ceil(outcome.resetAt / 1000)),
  };
}
