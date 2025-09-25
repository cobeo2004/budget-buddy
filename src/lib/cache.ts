import "server-only";
import NodeCache from "node-cache";

export const globalCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
  deleteOnExpire: true,
});

export const userCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
  deleteOnExpire: true,
});
