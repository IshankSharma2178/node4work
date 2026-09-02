import { Redis } from "ioredis";

const createQueueConnection = () => {
  const url = process.env.UPSTASH_REDIS_URL;

  if (!url) {
    return null;
  }

  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
};

let shared: Redis | null | undefined;

export const getQueueConnection = () => {
  if (shared === undefined) {
    shared = createQueueConnection();
  }
  return shared;
};
