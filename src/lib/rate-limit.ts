import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const parseLimit = (value: string | undefined, fallback: number) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
};

const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  restUrl && restToken ? new Redis({ url: restUrl, token: restToken }) : null;

if (!redis) {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — webhook rate limiting is disabled",
  );
}

const createLimiter = (prefix: string, perMinute: number) =>
  redis
    ? new Ratelimit({
        redis,
        prefix: `ratelimit:webhook:${prefix}`,
        limiter: Ratelimit.slidingWindow(perMinute, "1 m"),
      })
    : null;

export const webhookGoogleFormLimiter = createLimiter(
  "google-form",
  parseLimit(process.env.RATE_LIMIT_GOOGLE_FORM_PER_MIN, 30),
);

export const webhookStripeLimiter = createLimiter(
  "stripe",
  parseLimit(process.env.RATE_LIMIT_STRIPE_PER_MIN, 120),
);

export const webhookTelegramLimiter = createLimiter(
  "telegram",
  parseLimit(process.env.RATE_LIMIT_TELEGRAM_PER_MIN, 60),
);

/**
 * Enforce a rate limit for `identifier` (the workflow id for webhooks).
 * Returns a 429 response when the limit is exceeded, otherwise null.
 * When Upstash is not configured the check is skipped entirely.
 */
export const enforceRateLimit = async (
  limiter: Ratelimit | null,
  identifier: string,
): Promise<NextResponse | null> => {
  if (!limiter) {
    return null;
  }

  const { success, reset } = await limiter.limit(identifier);

  if (success) {
    return null;
  }

  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  return NextResponse.json(
    {
      success: false,
      error: "Rate limit exceeded. Please retry later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    },
  );
};
