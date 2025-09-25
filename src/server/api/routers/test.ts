import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  devTestProcedure,
  protectedProcedure,
  userCacheMiddleware,
} from "../trpc";
import { logger } from "@/lib/logger";

export const testRouter = createTRPCRouter({
  onSubscribe: protectedProcedure.subscription(async function* () {
    try {
      while (true) {
        yield {
          message: "Hello from the server",
        };
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to subscribe with error: " + (error as Error).message,
      });
    } finally {
      logger.info(">>> User has unsubscribed");
    }
  }),
  withoutCache: devTestProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany();
  }),

  withCache: devTestProcedure
    .use(userCacheMiddleware)
    .query(async ({ ctx }) => {
      return await ctx.db.user.findMany();
    }),
});
