import { describe, test, expect } from "vitest";
import {
  waitlistSchema,
  partnershipSchema,
  notifySchema,
} from "@/lib/validation";

// These schemas are the only thing standing between a public form and
// Firestore, so both directions matter: they must accept the shapes the
// real forms submit, and reject the shapes a bot does.

describe("waitlistSchema", () => {
  test("accepts a minimal real submission", () => {
    const r = waitlistSchema.safeParse({ email: "visitor@example.com" });
    expect(r.success).toBe(true);
  });

  test("accepts the full form payload", () => {
    const r = waitlistSchema.safeParse({
      email: "visitor@example.com",
      referral: "a friend in Rome",
      source: "landing",
      website: "",
    });
    expect(r.success).toBe(true);
  });

  test("rejects a malformed email", () => {
    for (const email of ["", "not-an-email", "a@", "@b.com", "a b@c.com"]) {
      expect(waitlistSchema.safeParse({ email }).success).toBe(false);
    }
  });

  test("rejects an email over the RFC length ceiling", () => {
    const email = `${"a".repeat(250)}@example.com`;
    expect(waitlistSchema.safeParse({ email }).success).toBe(false);
  });

  test("rejects an over-length referral", () => {
    const r = waitlistSchema.safeParse({
      email: "a@example.com",
      referral: "x".repeat(121),
    });
    expect(r.success).toBe(false);
  });

  test("rejects a filled honeypot", () => {
    // Only a bot fills a hidden field; the route also short-circuits on it.
    const r = waitlistSchema.safeParse({
      email: "bot@example.com",
      website: "http://spam.example",
    });
    expect(r.success).toBe(false);
  });
});

describe("partnershipSchema", () => {
  const valid = {
    name: "Kimia",
    email: "k@example.com",
    role: "partner" as const,
  };

  test("accepts each recognised role", () => {
    for (const role of ["investor", "partner", "creator", "other"]) {
      expect(partnershipSchema.safeParse({ ...valid, role }).success).toBe(true);
    }
  });

  test("rejects an unrecognised role", () => {
    expect(
      partnershipSchema.safeParse({ ...valid, role: "admin" }).success,
    ).toBe(false);
  });

  test("rejects a name that is too short", () => {
    expect(partnershipSchema.safeParse({ ...valid, name: "K" }).success).toBe(
      false,
    );
  });

  test("rejects a message beyond the size cap", () => {
    const r = partnershipSchema.safeParse({
      ...valid,
      message: "x".repeat(1001),
    });
    expect(r.success).toBe(false);
  });

  test("accepts a message at exactly the cap", () => {
    const r = partnershipSchema.safeParse({
      ...valid,
      message: "x".repeat(1000),
    });
    expect(r.success).toBe(true);
  });
});

describe("notifySchema", () => {
  test("accepts a city notification signup", () => {
    const r = notifySchema.safeParse({
      email: "a@example.com",
      citySlug: "rome",
    });
    expect(r.success).toBe(true);
  });

  test("requires a non-empty city slug", () => {
    expect(
      notifySchema.safeParse({ email: "a@example.com", citySlug: "" }).success,
    ).toBe(false);
    expect(
      notifySchema.safeParse({ email: "a@example.com" }).success,
    ).toBe(false);
  });

  test("rejects an over-length city slug", () => {
    const r = notifySchema.safeParse({
      email: "a@example.com",
      citySlug: "x".repeat(41),
    });
    expect(r.success).toBe(false);
  });
});
