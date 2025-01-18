import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/trpc";

async function createContext(req: Request) {
  return createTRPCContext({
    headers: req.headers,
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      router: appRouter,
      req: request,
      createContext: () => createContext(request),
    });
  },
};
