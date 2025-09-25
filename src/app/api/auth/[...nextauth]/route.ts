import { handlers } from "@/server/auth";
import { rateLimitByIp } from "@/lib/limiter";
import { type NextRequest } from "next/server";
export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const { success, error } = await rateLimitByIp(50, 10000);
  if (!success) {
    return new Response(error, { status: 429 });
  }
  return handlers.GET(request);
};

export const POST = async (request: NextRequest) => {
  const { success, error } = await rateLimitByIp(10, 10000);
  if (!success) {
    return new Response(error, { status: 429 });
  }
  return handlers.POST(request);
};
