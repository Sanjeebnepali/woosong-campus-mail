/**
 * @file src/lib/security.ts
 * @description Shared API hardening helpers: admin-key check, per-IP rate limiting,
 * and string sanitising. The rate limiter is in-memory (per server instance) — it stops
 * casual abuse; put a WAF / edge rate limit in front for production traffic.
 */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Best-effort client IP (works behind Vercel / reverse proxies). */
export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : request.headers.get("x-real-ip")) || "unknown";
}

/** Returns a 429 response when the caller exceeded `limit` requests per `windowMs`, else null. */
export function rateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();
  const key = `${scope}:${getClientIp(request)}`;
  const bucket = buckets.get(key);

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) } }
    );
  }
  return null;
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Requires the `x-admin-key` header to match ADMIN_API_KEY.
 * Returns an error response (503 if no key is configured, 401 if wrong) or null when authorised.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected) {
    return NextResponse.json({ error: "Admin registration is disabled (ADMIN_API_KEY not set)." }, { status: 503 });
  }
  const provided = request.headers.get("x-admin-key") || "";
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Administrator authorisation required." }, { status: 401 });
  }
  return null;
}

/** Trims and length-limits a value to a string. */
export function cleanString(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Parses a positive integer id, or null. */
export function positiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
