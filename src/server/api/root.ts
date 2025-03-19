import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { experimental_lazy } from "@trpc/server";
const authRouter = experimental_lazy(
  async () => (await import("./routers/auth")).authRouter,
);
const userRouter = experimental_lazy(
  async () => (await import("./routers/user")).userRouter,
);
const categoriesRouter = experimental_lazy(
  async () => (await import("./routers/categories")).categoriesRouter,
);
const transactionsRouter = experimental_lazy(
  async () => (await import("./routers/transactions")).transactionsRouter,
);
const statsRouter = experimental_lazy(
  async () => (await import("./routers/stats")).statsRouter,
);
const testRouter = experimental_lazy(
  async () => (await import("./routers/test")).testRouter,
);
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
  stats: statsRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
