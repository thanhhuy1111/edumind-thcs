// Prisma configuration - loaded only by Prisma CLI, not Next.js build
// @ts-nocheck
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Load .env.local if it exists (Next.js local dev)
try {
  const { config } = await import("dotenv");
  config({ path: ".env.local", override: true });
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
