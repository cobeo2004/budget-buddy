import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";
import { createTransactionSchema } from "@/features/dashboard/utils/schema";
import { z } from "zod";
import { GetFormatterForCurrency } from "@/features/dashboard/utils/helpers";

export const transactionsRouter = {
  createTransaction: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { amount, description, date, category, type } = input;
      const categoryRow = await ctx.db.category.findFirst({
        where: {
          userId: ctx.session.user.id,
          name: category,
        },
      });
      if (!categoryRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return await ctx.db.$transaction([
        // Create user transaction
        ctx.db.transaction.create({
          data: {
            userId: ctx.session.user.id,
            amount,
            date,
            type,
            category: categoryRow.name,
            categoryIcon: categoryRow.icon,
            description: description ?? "",
          },
        }),
        // Update aggreates table
        ctx.db.monthHistory.upsert({
          where: {
            userId_day_month_year: {
              userId: ctx.session.user.id,
              day: date.getUTCDate(),
              month: date.getUTCMonth(),
              year: date.getUTCFullYear(),
            },
          },
          create: {
            userId: ctx.session.user.id,
            day: date.getUTCDate(),
            month: date.getUTCMonth(),
            year: date.getUTCFullYear(),
            expense: type === "expense" ? amount : 0,
            income: type === "income" ? amount : 0,
          },
          update: {
            expense: {
              increment: type === "expense" ? amount : 0,
            },
            income: {
              increment: type === "income" ? amount : 0,
            },
          },
        }),
        ctx.db.yearHistory.upsert({
          where: {
            userId_month_year: {
              userId: ctx.session.user.id,
              month: date.getUTCMonth(),
              year: date.getUTCFullYear(),
            },
          },
          create: {
            userId: ctx.session.user.id,
            month: date.getUTCMonth(),
            year: date.getUTCFullYear(),
            expense: type === "expense" ? amount : 0,
            income: type === "income" ? amount : 0,
          },
          update: {
            expense: {
              increment: type === "expense" ? amount : 0,
            },
            income: {
              increment: type === "income" ? amount : 0,
            },
          },
        }),
      ]);
    }),
  getTransactionsHistory: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      const fromUTC = new Date(
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()),
      );
      const toUTC = new Date(
        Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59),
      );
      console.log(">>>>>>", fromUTC, toUTC);
      const userSettings = await ctx.db.userSettings.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!userSettings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User settings not found",
        });
      }
      const formatter = GetFormatterForCurrency(userSettings.currency);

      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: fromUTC,
            lte: toUTC,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      return transactions.map((transaction) => ({
        ...transaction,
        amount: formatter.format(transaction.amount),
      }));
    }),

  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.findUnique({
        where: {
          userId: ctx.session.user.id,
          id: input.id,
        },
      });
      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return await ctx.db.$transaction([
        // Delete transaction
        ctx.db.transaction.delete({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        }),
        // Update month history
        ctx.db.monthHistory.update({
          where: {
            userId_day_month_year: {
              userId: ctx.session.user.id,
              day: transaction.date.getUTCDate(),
              month: transaction.date.getUTCMonth(),
              year: transaction.date.getUTCFullYear(),
            },
          },
          data: {
            ...(transaction.type === "expense" && {
              expense: { decrement: transaction.amount },
            }),
            ...(transaction.type === "income" && {
              income: { decrement: transaction.amount },
            }),
          },
        }),
        // Update year history
        ctx.db.yearHistory.update({
          where: {
            userId_month_year: {
              userId: ctx.session.user.id,
              month: transaction.date.getUTCMonth(),
              year: transaction.date.getUTCFullYear(),
            },
          },
          data: {
            ...(transaction.type === "expense" && {
              expense: { decrement: transaction.amount },
            }),
            ...(transaction.type === "income" && {
              income: { decrement: transaction.amount },
            }),
          },
        }),
      ]);
    }),
} satisfies TRPCRouterRecord;
