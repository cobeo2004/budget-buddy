import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaAdapter } from "@auth/prisma-adapter";

const createPrismaClient = () => {
  neonConfig.webSocketConstructor = ws;
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// export const adapter = NodeCacheAdapter(PrismaAdapter(db));
export const adapter = PrismaAdapter(db);
