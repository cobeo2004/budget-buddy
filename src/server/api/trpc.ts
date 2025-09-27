/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { adapter, db } from "@/server/db";
import { isomorphicGetSession } from "./utils/isomorphicGetSession";
import { type TRPCPanelMeta } from "trpc-ui";
import {
  type middlewareMarker,
  type MiddlewareResult,
} from "@trpc/server/unstable-core-do-not-import";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const headers = opts.headers;
  const token = headers.get("Authorization") ?? null;
  logger.info(">>> TRPC Request from", headers.get("x-trpc-source"));
  const session = await isomorphicGetSession(headers);
  return {
    db,
    session,
    authToken: token,
    adapter,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .meta<TRPCPanelMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
    sse: {
      maxDurationMs: 5 * 60 * 1_000, // 5 minutes
      ping: {
        enabled: true,
        intervalMs: 3_000,
      },
      client: {
        reconnectAfterInactivityMs: 10_000,
      },
    },
  });

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  logger.info(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  userSpecific?: boolean;
  globalCache?: boolean;
  keyPrefix?: string;
  keySuffix?: string;
}

// Create cache key based on path, input, and user context
const createCacheKey = (
  path: string,
  input: unknown,
  userId?: string,
  config?: CacheConfig,
): string => {
  const inputString = input ? JSON.stringify(input) : "";
  const prefix = config?.keyPrefix ?? "cache"; // Use unified "cache" prefix
  const suffix = config?.keySuffix ? `:${config.keySuffix}` : "";

  if (config?.globalCache) {
    return `${prefix}:global:${path}:${inputString}${suffix}`;
  }

  if (config?.userSpecific && userId) {
    return `${prefix}:user:${userId}:${path}:${inputString}${suffix}`;
  }

  return `${prefix}:${path}:${inputString}${suffix}`;
};

// Create a cache middleware with the given configuration
export const createCacheMiddleware = (config: CacheConfig = {}) => {
  return t.middleware(async (opts): Promise<MiddlewareResult<unknown>> => {
    const { path, input, ctx, next } = opts;

    const userId = ctx.session?.user.id;

    // Create cache key
    const cacheKey = createCacheKey(path, input, userId, config);

    try {
      // Try to get from Redis cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult !== null) {
        if (process.env.NODE_ENV === "development") {
          logger.info("Cache hit", { cacheKey, path });
        }
        return {
          ok: true,
          data: cachedResult,
          marker: "middleware" as unknown as typeof middlewareMarker,
        };
      }

      if (process.env.NODE_ENV === "development") {
        logger.info("Cache miss", { cacheKey, path });
      }

      // If not in cache, execute the procedure
      const result = await next();

      // Cache the result if successful
      if (result.ok) {
        const ttl = config.ttl ?? (config.globalCache ? 600 : 180); // Default: 10min global, 3min user
        await redis.setex(cacheKey, ttl, JSON.stringify(result.data));

        if (process.env.NODE_ENV === "development") {
          logger.info("Cache set", { cacheKey, path, ttl });
        }
      }

      return result;
    } catch (error) {
      // If Redis fails, continue without caching
      logger.error("Redis cache error", { error, cacheKey, path });
      return await next();
    }
  });
};

// Pre-configured middleware instances
export const globalCacheMiddleware = createCacheMiddleware({
  ttl: 600, // 10 minutes
  globalCache: true,
  userSpecific: false,
});

export const userCacheMiddleware = createCacheMiddleware({
  ttl: 180, // 3 minutes
  userSpecific: true,
  globalCache: false,
});

// Dynamic cache middleware that includes input-based suffix
export const createDynamicCacheMiddleware = (config: CacheConfig = {}) => {
  return t.middleware(async (opts): Promise<MiddlewareResult<unknown>> => {
    const { path, input, ctx, next } = opts;
    const userId = ctx.session?.user.id;

    // Create dynamic cache key with input-based suffix
    const dynamicConfig = {
      ...config,
      keySuffix:
        input && typeof input === "object" && "type" in input
          ? (input as { type: string }).type
          : undefined,
    };

    const cacheKey = createCacheKey(path, input, userId, dynamicConfig);

    try {
      // Try to get from Redis cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult !== null) {
        if (process.env.NODE_ENV === "development") {
          logger.info("Cache hit", { cacheKey, path });
        }
        return {
          ok: true,
          data: cachedResult,
          marker: "middleware" as unknown as typeof middlewareMarker,
        };
      }

      if (process.env.NODE_ENV === "development") {
        logger.info("Cache miss", { cacheKey, path });
      }

      // If not in cache, execute the procedure
      const result = await next();

      // Cache the result if successful
      if (result.ok) {
        const ttl = config.ttl ?? (config.globalCache ? 600 : 180);
        await redis.setex(cacheKey, ttl, JSON.stringify(result.data));

        if (process.env.NODE_ENV === "development") {
          logger.info("Cache set", { cacheKey, path, ttl });
        }
      }

      return result;
    } catch (error) {
      // If Redis fails, continue without caching
      logger.error("Redis cache error", { error, cacheKey, path });
      return await next();
    }
  });
};

// Pre-configured dynamic cache middleware for user-specific data with type differentiation
export const userCacheMiddlewareWithType = createDynamicCacheMiddleware({
  ttl: 180, // 3 minutes
  userSpecific: true,
  globalCache: false,
});

// Period-based cache middleware for stats endpoints
export const createPeriodCacheMiddleware = (config: CacheConfig = {}) => {
  return t.middleware(async (opts): Promise<MiddlewareResult<unknown>> => {
    const { path, input, ctx, next } = opts;
    const userId = ctx.session?.user.id;

    // Create period-specific cache key suffix
    let periodSuffix = "";
    if (input && typeof input === "object") {
      // Handle date range inputs (from/to)
      if ("from" in input && "to" in input) {
        const from = input.from as Date;
        const to = input.to as Date;
        periodSuffix = `${from.toISOString().split("T")[0]}_to_${to.toISOString().split("T")[0]}`;
      }
      // Handle history period inputs (timeFrame, year, month)
      else if ("timeFrame" in input && "year" in input) {
        const timeFrame = input.timeFrame as string;
        const year = input.year as number;
        const month = "month" in input ? (input.month as number) : null;
        periodSuffix =
          month !== null
            ? `${timeFrame}_${year}_${month}`
            : `${timeFrame}_${year}`;
      }
    }

    const dynamicConfig = {
      ...config,
      keySuffix: periodSuffix || config.keySuffix,
    };

    const cacheKey = createCacheKey(path, input, userId, dynamicConfig);

    try {
      // Try to get from Redis cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult !== null) {
        if (process.env.NODE_ENV === "development") {
          logger.info("Period cache hit", { cacheKey, path, periodSuffix });
        }
        return {
          ok: true,
          data: cachedResult,
          marker: "middleware" as unknown as typeof middlewareMarker,
        };
      }

      if (process.env.NODE_ENV === "development") {
        logger.info("Period cache miss", { cacheKey, path, periodSuffix });
      }

      // If not in cache, execute the procedure
      const result = await next();

      // Cache the result if successful
      if (result.ok) {
        const ttl = config.ttl ?? 300; // Default: 5 minutes for period-based data
        await redis.setex(cacheKey, ttl, JSON.stringify(result.data));

        if (process.env.NODE_ENV === "development") {
          logger.info("Period cache set", {
            cacheKey,
            path,
            ttl,
            periodSuffix,
          });
        }
      }

      return result;
    } catch (error) {
      // If Redis fails, continue without caching
      logger.error("Redis period cache error", { error, cacheKey, path });
      return await next();
    }
  });
};

// Pre-configured period cache middleware instances
export const statsDateRangeCacheMiddleware = createPeriodCacheMiddleware({
  ttl: 300, // 5 minutes - good balance for date range stats
  userSpecific: true,
  globalCache: false,
});

export const statsHistoryCacheMiddleware = createPeriodCacheMiddleware({
  ttl: 600, // 10 minutes - history data changes less frequently
  userSpecific: true,
  globalCache: false,
});

export const shortCacheMiddleware = createCacheMiddleware({
  ttl: 120, // 2 minutes
  userSpecific: true,
  globalCache: false,
});

export const longCacheMiddleware = createCacheMiddleware({
  ttl: 1800, // 30 minutes
  globalCache: true,
  userSpecific: false,
});

// Cache invalidation utilities
export const invalidateCacheByPattern = async (pattern: string) => {
  try {
    // Get all keys matching the pattern
    const searchPattern = `*${pattern}*`;
    const keys = await redis.keys(searchPattern);

    if (process.env.NODE_ENV === "development") {
      logger.info("Cache invalidation search", {
        pattern,
        searchPattern,
        keysFound: keys.length,
        keys: keys.slice(0, 5), // Log first 5 keys for debugging
      });
    }

    if (keys.length > 0) {
      await redis.del(...keys);
      if (process.env.NODE_ENV === "development") {
        logger.info("Cache invalidated by pattern", {
          pattern,
          keysCount: keys.length,
        });
      }
    }
  } catch (error) {
    logger.error("Redis cache invalidation error", { error, pattern });
  }
};

export const invalidateCacheByKey = async (key: string) => {
  try {
    await redis.del(key);
    if (process.env.NODE_ENV === "development") {
      logger.info("Cache invalidated by key", { key });
    }
  } catch (error) {
    logger.error("Redis cache invalidation error", { error, key });
  }
};

export const invalidateUserCache = async (
  userId: string,
  patterns: string[],
) => {
  try {
    const promises = patterns.map((pattern) =>
      invalidateCacheByPattern(`user:${userId}:${pattern}`),
    );
    await Promise.all(promises);
  } catch (error) {
    logger.error("User cache invalidation error", { error, userId, patterns });
  }
};

// Invalidate both tRPC and auth adapter caches for a user
export const invalidateAllUserCaches = async (
  userId: string,
  sessionToken?: string,
) => {
  try {
    const promises: Promise<void>[] = [
      // Invalidate all tRPC user caches
      invalidateCacheByPattern(`cache:user:${userId}`),
    ];

    // If sessionToken is provided, also invalidate auth adapter cache
    if (sessionToken) {
      promises.push(
        invalidateCacheByKey(`cache:auth:getSessionAndUser:${sessionToken}`),
      );
    }

    await Promise.all(promises);

    if (process.env.NODE_ENV === "development") {
      logger.info("All user caches invalidated", {
        userId,
        sessionToken: !!sessionToken,
      });
    }
  } catch (error) {
    logger.error("All user cache invalidation error", {
      error,
      userId,
      sessionToken,
    });
  }
};

export const invalidateGlobalCache = async (patterns: string[]) => {
  try {
    const promises = patterns.map((pattern) =>
      invalidateCacheByPattern(`global:${pattern}`),
    );
    await Promise.all(promises);
  } catch (error) {
    logger.error("Global cache invalidation error", { error, patterns });
  }
};

// Clear all caches
export const clearAllCaches = async () => {
  try {
    await redis.flushall();
    if (process.env.NODE_ENV === "development") {
      logger.info("All caches cleared");
    }
  } catch (error) {
    logger.error("Clear all caches error", { error });
  }
};
/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

export const devTestProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ next }) => {
    if (process.env.NODE_ENV !== "development") {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ">>> Dev test procedure is only available in development <<<",
      });
    }
    return next();
  });

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ">>> Unauthorized <<<",
      });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
