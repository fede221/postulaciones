import type { NextRequest } from "next/server";

/**
 * Fixed-window in-memory rate limiter. Good enough for a single-instance
 * deployment; swap the store for Redis if the app ever runs multi-instance.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  // Without a resolvable address every visitor shares one bucket: keep a brake, but a
  // loose one, so a busy hour of real applicants is never locked out.
  if (key.endsWith(":unknown")) limit *= 20;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * Best available client address. `x-real-ip` is set by the reverse proxy; from
 * `x-forwarded-for` we take the LAST hop (appended by our proxy) because the first
 * entries are client-supplied and trivially spoofed to dodge the limiter.
 */
export function clientIp(req: NextRequest | { headers: Headers }): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "unknown";
}
