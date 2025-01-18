import { auth } from "@/server/auth";
import { validateToken } from "@/server/auth/config";

export const isomorphicGetSession = async (headers: Headers) => {
  const token = headers.get("Authorization") ?? null;
  const notNextJs = headers.get("x-trpc-source") !== "nextjs";
  if (token && notNextJs) return validateToken(token);
  return auth();
};
