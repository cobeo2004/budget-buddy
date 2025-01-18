import { type TRPCRouterRecord } from "@trpc/server";
import { type createTRPCContext, protectedProcedure } from "../trpc";
import { z } from "zod";
import { getDaysInMonth } from "date-fns";

interface HistoryData {
  expense: number;
  income: number;
  year: number;
  month: number;
  day?: number;
}

const getYearHistoryData = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  year: number,
) => {
  const res = await ctx.db.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId: ctx.session?.user.id,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: [
      {
        month: "asc",
      },
    ],
  });
  if (!res || res.length === 0) return [];
  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;
    const monthData = res.find((row) => row.month === i);
    if (monthData) {
      expense = monthData._sum.expense ?? 0;
      income = monthData._sum.income ?? 0;
    }

    history.push({
      year,
      month: i,
      expense,
      income,
    });
  }
  return history;
};

const getMonthHistoryData = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  year: number,
  month: number,
) => {
  const result = await ctx.db.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId: ctx.session?.user.id,
      year,
      month,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: [
      {
        day: "asc",
      },
    ],
  });
  if (!result || result.length === 0) return [];
  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));
  for (let i = 1; i <= daysInMonth; i++) {
    let expense = 0;
    let income = 0;
    const day = result.find((row) => row.day == i);
    if (day) {
      expense = day._sum.expense ?? 0;
      income = day._sum.income ?? 0;
    }
    history.push({
      expense,
      income,
      year,
      month,
      day: i,
    });
  }

  return history;
};

export const statsRouter = {
  getOverview: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      const totals = await ctx.db.transaction.groupBy({
        by: ["type"],
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: from,
            lte: to,
          },
        },
        _sum: {
          amount: true,
        },
      });
      return {
        expenses: totals.find((t) => t.type === "expense")?._sum.amount ?? 0,
        income: totals.find((t) => t.type === "income")?._sum.amount ?? 0,
      };
    }),

  getCategoriesStats: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      return await ctx.db.transaction.groupBy({
        by: ["type", "category", "categoryIcon"],
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: from,
            lte: to,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      });
    }),

  getHistoryPeriods: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.monthHistory.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        year: true,
      },
      distinct: ["year"],
      orderBy: [
        {
          year: "asc",
        },
      ],
    });

    const years = result.map((r) => r.year);
    if (years.length === 0) return [new Date().getFullYear()];
    return years;
  }),

  getHistoryData: protectedProcedure
    .input(
      z.object({
        timeFrame: z.enum(["month", "year"]),
        month: z.coerce.number().min(0).max(11).default(0),
        year: z.coerce.number().min(1900).max(3050),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeFrame, month, year } = input;
      switch (timeFrame) {
        case "year":
          return await getYearHistoryData(ctx, year);
        case "month":
          return await getMonthHistoryData(ctx, year, month);
        default:
          return;
      }
    }),
} satisfies TRPCRouterRecord;
