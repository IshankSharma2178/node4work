import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { acquireIdempotencyKey } from "@/lib/idempotency";

export const OTP_COOLDOWN_SECONDS = 60;

const parseLimit = (value: string | undefined, fallback: number) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
};

const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let limiter: Ratelimit | null = null;
let limiterResolved = false;

const getLimiter = () => {
  if (limiterResolved) {
    return limiter;
  }

  limiterResolved = true;

  if (!restUrl || !restToken) {
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url: restUrl, token: restToken }),
    prefix: "ratelimit:otp",
    limiter: Ratelimit.slidingWindow(
      parseLimit(process.env.RATE_LIMIT_OTP_PER_HOUR, 5),
      "1 h",
    ),
  });

  return limiter;
};

/**
 * Guards OTP generation for `email`. Blocks when a code was generated in the
 * last 60 seconds or when the per-email hourly budget is exhausted.
 * Returns true when a new code may be generated and emailed.
 */
export const otpSendAllowed = async (email: string): Promise<boolean> => {
  const acquired = await acquireIdempotencyKey(
    `otp:cooldown:${email.toLowerCase()}`,
    OTP_COOLDOWN_SECONDS,
  );

  if (!acquired) {
    return false;
  }

  const emailLimiter = getLimiter();

  if (!emailLimiter) {
    return true;
  }

  return (await emailLimiter.limit(email.toLowerCase())).success;
};
