/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[INFO]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ERROR]", ...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[WARN]", ...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[DEBUG]", ...args);
    }
  },
  trace: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.trace("[TRACE]", ...args);
    }
  },
  fatal: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[FATAL]", ...args);
    }
  },
};
