import {
  protectedProcedure,
  createTRPCRouter,
  userCacheMiddleware,
  userCacheMiddlewareWithType,
  invalidateUserCache,
  invalidateCacheByPattern,
} from "../trpc";
import { z } from "zod";
import { createCategorySchema } from "@/features/dashboard/utils/schema";

export const categoriesRouter = createTRPCRouter({
  getCategoriesByType: protectedProcedure
    .input(z.object({ type: z.enum(["expense", "income"]) }))
    .use(userCacheMiddlewareWithType)
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

  getCategories: protectedProcedure
    .use(userCacheMiddleware)
    .query(async ({ ctx }) => {
      const categories = await ctx.db.category.findMany({
        where: { userId: ctx.session.user.id },
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

      // Invalidate both expense and income categories cache entries
      await Promise.all([
        // Invalidate category caches
        invalidateUserCache(ctx.session.user.id, [
          "categories.getCategoriesByType:expense", // Specific cache for expense
          "categories.getCategoriesByType:income", // Specific cache for income
          "categories.getCategories", // All categories cache
        ]),
        // Invalidate all period-based stats caches since category changes affect all periods
        invalidateCacheByPattern(
          `cache:user:${ctx.session.user.id}:stats.getOverview`,
        ),
        invalidateCacheByPattern(
          `cache:user:${ctx.session.user.id}:stats.getCategoriesStats`,
        ),
      ]);

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

      // Invalidate both expense and income categories cache entries
      await Promise.all([
        // Invalidate category caches
        invalidateUserCache(ctx.session.user.id, [
          "categories.getCategoriesByType:expense", // Specific cache for expense
          "categories.getCategoriesByType:income", // Specific cache for income
          "categories.getCategories", // All categories cache
        ]),
        // Invalidate all period-based stats caches since category changes affect all periods
        invalidateCacheByPattern(
          `cache:user:${ctx.session.user.id}:stats.getOverview`,
        ),
        invalidateCacheByPattern(
          `cache:user:${ctx.session.user.id}:stats.getCategoriesStats`,
        ),
      ]);

      return result;
    }),
});
