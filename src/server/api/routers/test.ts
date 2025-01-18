import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";

export const testRouter = {
  onSubscribe: protectedProcedure.subscription(async function* ({}) {
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
      console.log(">>> User has unsubscribed");
    }
  }),
} satisfies TRPCRouterRecord;
