import {
  createTRPCRouter,
  protectedProcedure,
  userCacheMiddleware,
  invalidateUserCache,
  invalidateAllUserCaches,
} from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUserSettings: protectedProcedure
    .use(userCacheMiddleware)
    .query(async ({ ctx }) => {
      const user = await ctx.db.userSettings.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!user) {
        const newUserSettings = await ctx.db.userSettings.create({
          data: {
            userId: ctx.session.user.id,
            currency: "USD",
          },
        });
        return newUserSettings;
      }
      return user;
    }),
  updateUserSettings: protectedProcedure
    .input(z.object({ id: z.string(), currency: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.userSettings.update({
        where: {
          id: input.id,
        },
        data: {
          currency: input.currency,
        },
      });

      // Invalidate user settings cache and currency-dependent caches
      await Promise.all([
        invalidateUserCache(ctx.session.user.id, [
          "user.getUserSettings",
          "transactions.getTransactionsHistory", // Currency affects formatted amounts
        ]),
        // Also invalidate auth caches since user data changed
        invalidateAllUserCaches(
          ctx.session.user.id,
          ctx.authToken ?? undefined,
        ),
      ]);

      return result;
    }),
  setUserSettingsDone: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        isNewUser: false,
      },
    });

    // Invalidate user session cache since isNewUser changed
    await Promise.all([
      invalidateUserCache(ctx.session.user.id, ["auth.getSession"]),
      // Also invalidate auth caches since user data changed
      invalidateAllUserCaches(ctx.session.user.id, ctx.authToken ?? undefined),
    ]);

    return result;
  }),
});
