import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, __resetRateLimit } from "@/lib/storage";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("allows requests up to the limit, then blocks", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("ip:1.2.3.4").ok).toBe(true);
    }
    expect(rateLimit("ip:1.2.3.4").ok).toBe(false);
  });

  test("reports a positive retry-after when blocked", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip:1.2.3.4");
    const blocked = rateLimit("ip:1.2.3.4");

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  test("tracks keys independently", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip:1.1.1.1");
    expect(rateLimit("ip:1.1.1.1").ok).toBe(false);
    // A different visitor must not inherit the first one's exhausted budget.
    expect(rateLimit("ip:2.2.2.2").ok).toBe(true);
  });

  test("separates the same IP across different forms", () => {
    for (let i = 0; i < 5; i++) rateLimit("waitlist:1.1.1.1");
    expect(rateLimit("waitlist:1.1.1.1").ok).toBe(false);
    expect(rateLimit("partnership:1.1.1.1").ok).toBe(true);
  });

  test("recovers once the window has elapsed", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip:1.2.3.4");
    expect(rateLimit("ip:1.2.3.4").ok).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(rateLimit("ip:1.2.3.4").ok).toBe(true);
  });

  test("slides partially as individual timestamps age out", () => {
    // Three now, two 30s later → at t=61s the first three have expired,
    // leaving room again without a full window of silence.
    rateLimit("ip:5.5.5.5");
    rateLimit("ip:5.5.5.5");
    rateLimit("ip:5.5.5.5");
    vi.advanceTimersByTime(30_000);
    rateLimit("ip:5.5.5.5");
    rateLimit("ip:5.5.5.5");
    expect(rateLimit("ip:5.5.5.5").ok).toBe(false);

    vi.advanceTimersByTime(31_000);
    expect(rateLimit("ip:5.5.5.5").ok).toBe(true);
  });

  test("does not grow without bound across many distinct keys", () => {
    // Regression guard: the map previously kept an entry for every IP that
    // ever hit a form, since nothing removed fully-expired buckets. A
    // crawler sweep or spoofed x-forwarded-for header made that unbounded.
    for (let i = 0; i < 12_000; i++) {
      rateLimit(`ip:10.0.${Math.floor(i / 256)}.${i % 256}`);
    }
    // Anything under the cap-plus-slack proves eviction ran; the point is
    // that it is bounded, not that it lands on an exact number.
    expect(rateLimit("ip:probe").ok).toBe(true);

    vi.advanceTimersByTime(60_001);
    for (let i = 0; i < 12_000; i++) {
      rateLimit(`ip:172.16.${Math.floor(i / 256)}.${i % 256}`);
    }
    expect(rateLimit("ip:probe2").ok).toBe(true);
  });

  test("keeps limiting the active key while evicting stale ones", () => {
    // Eviction must never hand an over-quota caller a free pass.
    for (let i = 0; i < 5; i++) rateLimit("ip:hot");
    for (let i = 0; i < 12_000; i++) rateLimit(`ip:cold-${i}`);

    expect(rateLimit("ip:hot").ok).toBe(false);
  });
});
