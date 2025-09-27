import "server-only";
import { getIp } from "./get-ip";
import { logger } from "./logger";
import { redis } from "./redis";

type LimiterTracker = {
  count: number;
  expiresAt: number;
};

export const rateLimitByIp = async (
  limit = 1,
  window = 10000,
): Promise<{ success: boolean; error?: string }> => {
  const ip = await getIp();
  if (!ip) {
    return { success: false, error: "Could not get IP address" };
  }
  return rateLimitByKey(ip, limit, window);
};

export const rateLimitByKey = async (
  key: string,
  limit = 1,
  window = 10000,
): Promise<{ success: boolean; error?: string }> => {
  const cacheKey = `rate_limit:${key}`;
  const tracker: LimiterTracker = (await redis.get(cacheKey)) ?? {
    count: 0,
    expiresAt: 0,
  };

  logger.info("[Middleware] Rate limiting tracker", tracker);

  if (tracker.expiresAt < Date.now()) {
    tracker.count = 0;
    tracker.expiresAt = Date.now() + window;
  }
  tracker.count++;

  // Set the tracker in Redis with TTL based on window
  await redis.set(cacheKey, tracker, { ex: Math.ceil(window / 1000) });

  logger.info("[Middleware] Rate limiting count for key", key, tracker.count);

  if (tracker.count > limit) {
    return { success: false, error: "Too many requests" };
  }

  return { success: true };
};
