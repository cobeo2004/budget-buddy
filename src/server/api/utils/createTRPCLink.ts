import {
  loggerLink,
  retryLink,
  splitLink,
  unstable_httpBatchStreamLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import SuperJSON from "superjson";
import { getBaseUrl } from "./getBaseUrl";
import { EventSourcePolyfill } from "event-source-polyfill";

export const createTRPCLink = (authToken: string | null) => {
  return [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    splitLink({
      condition: (op) => op.type !== "subscription",
      true: unstable_httpBatchStreamLink({
        transformer: SuperJSON,
        url: getBaseUrl() + "/api/trpc",
        headers: () => {
          const headers = new Headers();
          headers.set("x-trpc-source", "nextjs-react");
          if (authToken) {
            headers.set("Authorization", `Bearer ${authToken}`);
          }
          return headers;
        },
      }),
      false: [
        retryLink({
          retry(opts) {
            const error = opts.error;
            if (error && error.data instanceof Error) {
              const code = error.data.name;
              if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
                console.error(
                  ">>> UNAUTHORIZED or FORBIDDEN for ",
                  opts.op.path,
                );
                return false;
              }
            }
            return true;
          },
        }),
        unstable_httpSubscriptionLink({
          url: getBaseUrl() + "/api/trpc",
          EventSource: EventSourcePolyfill,
          transformer: SuperJSON,
          eventSourceOptions: async () => {
            return {
              headers: {
                "x-trpc-source": "nextjs-react",
              },
            };
          },
        }),
      ],
    }),
  ];
};
