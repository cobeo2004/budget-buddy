import "server-only";
import { getIp } from "./get-ip";

type LimterTracker = Record<
  string,
  {
    count: number;
    expiresAt: number;
  }
>;

const trackers: LimterTracker = {};

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
  const tracker = trackers[key] ?? { count: 0, expiresAt: 0 };

  console.log("[Middleware] Rate limiting tracker", tracker);
  if (!trackers[key]) {
    trackers[key] = tracker;
  }

  if (tracker.expiresAt < Date.now()) {
    tracker.count = 0;
    tracker.expiresAt = Date.now() + window;
  }
  tracker.count++;

  console.log("[Middleware] Rate limiting count for key", key, tracker.count);

  if (tracker.count > limit) {
    return { success: false, error: "Too many requests" };
  }

  return { success: true };
};
