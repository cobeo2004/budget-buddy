import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
});

export const createCategorySchema = z.object({
  name: z.string().min(3).max(20),
  icon: z.string().max(20),
  type: z.union([z.literal("income"), z.literal("expense")]),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
