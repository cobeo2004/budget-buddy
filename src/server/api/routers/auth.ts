import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { signUpSchema, updateUserSchema } from "@/features/auth/utils/schema";
import * as jose from "jose";
export const authRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return {
      message: "pong",
    };
  }),
  getToken: protectedProcedure.query(({ ctx }) => {
    return ctx.authToken;
  }),
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  updateUser: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email } = input;
      return await ctx.db.user.update({
        where: { id: ctx.session?.user?.id },
        data: { name, email },
      });
    }),
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email, password } = input;
      const isExistes = await ctx.db.user.findUnique({
        where: {
          email,
        },
      });

      if (isExistes) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const encoder = new TextEncoder();
      const hashedPassword = await new jose.CompactEncrypt(
        encoder.encode(password),
      )
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(encoder.encode(process.env.AUTH_SECRET));

      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      const createdAccount = await ctx.adapter?.linkAccount?.({
        userId: user.id,
        type: "email",
        provider: "credentials",
        providerAccountId: user.id,
      });
      if (!createdAccount) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account",
        });
      }
      return {
        createdUser: user,
      };
    }),
});
