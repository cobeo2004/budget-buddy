import { type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";
import { z } from "zod";
import { createCategorySchema } from "@/features/dashboard/utils/schema";

export const categoriesRouter = {
  getCategories: protectedProcedure
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
      return await ctx.db.category.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),
  deleteCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(20),
        type: z.enum(["income", "expense"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.category.delete({
        where: {
          userId_name_type: {
            userId: ctx.session.user.id,
            name: input.name,
            type: input.type,
          },
        },
      });
    }),
} satisfies TRPCRouterRecord;
