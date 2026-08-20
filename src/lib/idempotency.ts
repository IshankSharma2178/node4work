import { Redis } from "@upstash/redis";

const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  restUrl && restToken ? new Redis({ url: restUrl, token: restToken }) : null;

const DEFAULT_TTL = 86400;

export const acquireIdempotencyKey = async (
  key: string,
  ttlSeconds: number = DEFAULT_TTL,
): Promise<boolean> => {
  if (!redis) {
    return true;
  }

  const result = await redis.set(key, "1", {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
};
