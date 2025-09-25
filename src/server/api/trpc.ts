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
import { globalCache, userCache } from "../../lib/cache";
import {
  type middlewareMarker,
  type MiddlewareResult,
} from "@trpc/server/unstable-core-do-not-import";
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
  console.log(">>> TRPC Request from", headers.get("x-trpc-source"));
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
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  userSpecific?: boolean;
  globalCache?: boolean;
  keyPrefix?: string;
}

// Create cache key based on path, input, and user context
const createCacheKey = (
  path: string,
  input: unknown,
  userId?: string,
  config?: CacheConfig,
): string => {
  const inputString = input ? JSON.stringify(input) : "";
  const prefix = config?.keyPrefix ?? "trpc";

  if (config?.globalCache) {
    return `${prefix}:global:${path}:${inputString}`;
  }

  if (config?.userSpecific && userId) {
    return `${prefix}:user:${userId}:${path}:${inputString}`;
  }

  return `${prefix}:${path}:${inputString}`;
};

// Create a cache middleware with the given configuration
export const createCacheMiddleware = (config: CacheConfig = {}) => {
  return t.middleware(async (opts): Promise<MiddlewareResult<unknown>> => {
    const { path, input, ctx, next } = opts;

    // Determine which cache to use
    const cache = config.globalCache ? globalCache : userCache;
    const userId = ctx.session?.user.id;

    // Create cache key
    const cacheKey = createCacheKey(path, input, userId, config);

    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult !== undefined) {
      if (process.env.NODE_ENV === "development") {
        console.log("Cache hit", { cacheKey, path });
      }
      return {
        ok: true,
        data: cachedResult,
        marker: "middleware" as unknown as typeof middlewareMarker,
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Cache miss", { cacheKey, path });
    }

    // If not in cache, execute the procedure
    const result = await next();

    // Cache the result if successful
    if (result.ok) {
      const ttl = config.ttl ?? (config.globalCache ? 600 : 180); // Default: 10min global, 3min user
      cache.set(cacheKey, result.data, ttl);

      if (process.env.NODE_ENV === "development") {
        console.log("Cache set", { cacheKey, path, ttl, result: result.data });
      }
    }

    return result;
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
export const invalidateCacheByPattern = (pattern: string, isGlobal = false) => {
  const cache = isGlobal ? globalCache : userCache;
  const keys = cache.keys();

  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

export const invalidateCacheByKey = (key: string, isGlobal = false) => {
  const cache = isGlobal ? globalCache : userCache;
  cache.del(key);
};

export const invalidateUserCache = (userId: string, patterns: string[]) => {
  patterns.forEach((pattern) => {
    invalidateCacheByPattern(`user:${userId}:${pattern}`, false);
  });
};

export const invalidateGlobalCache = (patterns: string[]) => {
  patterns.forEach((pattern) => {
    invalidateCacheByPattern(`global:${pattern}`, true);
  });
};

// Clear all caches
export const clearAllCaches = () => {
  globalCache.flushAll();
  userCache.flushAll();
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
