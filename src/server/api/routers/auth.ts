import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../trpc";
import { signUpSchema } from "@/features/auth/utils/schema";
import * as jose from "jose";
import { adapter } from "@/server/db";
export const authRouter = {
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
      const createdAccount = await adapter?.linkAccount?.({
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
} satisfies TRPCRouterRecord;
