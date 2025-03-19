import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
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
      return await ctx.db.userSettings.update({
        where: {
          id: input.id,
        },
        data: {
          currency: input.currency,
        },
      });
    }),
  setUserSettingsDone: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        isNewUser: false,
      },
    });
  }),
});
