type Bucket = {
  count: number;
  resetAt: number;
  lastSeenAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

function evictExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function evictOldestBucket() {
  let oldestKey: string | null = null;
  let oldestSeenAt = Number.POSITIVE_INFINITY;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.lastSeenAt < oldestSeenAt) {
      oldestSeenAt = bucket.lastSeenAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    buckets.delete(oldestKey);
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    evictExpiredBuckets(now);

    if (buckets.size >= MAX_BUCKETS) {
      evictOldestBucket();
    }
  }

  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs, lastSeenAt: now });
    return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    current.lastSeenAt = now;
    buckets.set(key, current);

    return { ok: false as const, remaining: 0, retryAfterMs: current.resetAt - now, resetAt: current.resetAt };
  }

  current.count += 1;
  current.lastSeenAt = now;
  buckets.set(key, current);

  return { ok: true as const, remaining: limit - current.count, resetAt: current.resetAt };
}

export function buildRateLimitKey(parts: Array<string | number | undefined | null>) {
  return parts.filter(Boolean).join(":");
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
