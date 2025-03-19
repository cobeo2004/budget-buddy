import { NextResponse } from "next/server";
import { appRouter } from "@/server/api/root";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { renderTrpcPanel } = await import("trpc-ui");

  return new NextResponse(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    renderTrpcPanel(appRouter, {
      url: "/api/trpc",
      transformer: "superjson",
    }),
    {
      status: 200,
      headers: [["Content-Type", "text/html"] as [string, string]],
    },
  );
}
