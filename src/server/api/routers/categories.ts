import {
  protectedProcedure,
  createTRPCRouter,
  userCacheMiddleware,
  invalidateUserCache,
} from "../trpc";
import { z } from "zod";
import { createCategorySchema } from "@/features/dashboard/utils/schema";

export const categoriesRouter = createTRPCRouter({
  getCategories: protectedProcedure
    .use(userCacheMiddleware)
    .input(z.object({ type: z.enum(["expense", "income"]) }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.type && { type: input.type }),
        },
        orderBy: {
          name: "asc",
        },
      });

      return categories;
    }),
  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.category.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });

      // Invalidate categories cache
      invalidateUserCache(ctx.session.user.id, ["categories.getCategories"]);

      return result;
    }),
  deleteCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(20),
        type: z.enum(["income", "expense"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.category.delete({
        where: {
          userId_name_type: {
            userId: ctx.session.user.id,
            name: input.name,
            type: input.type,
          },
        },
      });

      // Invalidate categories cache
      invalidateUserCache(ctx.session.user.id, ["categories.getCategories"]);

      return result;
    }),
});
