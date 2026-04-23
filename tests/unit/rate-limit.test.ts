import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildRateLimitKey, checkRateLimit, clearRateLimitBuckets } from "@/lib/security/rate-limit";

describe("rate limit helper", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("allows requests under configured limit", () => {
    const result1 = checkRateLimit("signup:127.0.0.1", 2, 60_000);
    const result2 = checkRateLimit("signup:127.0.0.1", 2, 60_000);

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result2.remaining).toBe(0);
  });

  it("blocks requests over the configured limit", () => {
    checkRateLimit("booking:user-1", 1, 60_000);
    const blocked = checkRateLimit("booking:user-1", 1, 60_000);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets usage after the window expires", () => {
    vi.useFakeTimers();

    checkRateLimit("booking:user-2", 1, 1_000);
    vi.advanceTimersByTime(1_001);

    const result = checkRateLimit("booking:user-2", 1, 1_000);

    expect(result.ok).toBe(true);
    vi.useRealTimers();
  });

  it("builds deterministic keys", () => {
    expect(buildRateLimitKey(["signup", "user", undefined, 0, "trace"])).toBe("signup:user:trace");
  });
});
