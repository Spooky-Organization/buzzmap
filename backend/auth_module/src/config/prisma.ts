import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Use DATABASE_URL directly (preferred) or construct from individual variables as fallback
const databaseUrl = process.env["DATABASE_URL"] || (() => {
  const user = process.env["POSTGRES_USER"];
  const password = process.env["POSTGRES_PASSWORD"];
  const host = process.env["POSTGRES_HOST"] || "localhost";
  const port = process.env["POSTGRES_PORT"] || "5432";
  const dbName = process.env["POSTGRES_DB"];

  if (!user || !password || !dbName) {
    throw new Error("Missing PostgreSQL environment variables. Either DATABASE_URL or POSTGRES_* variables must be set.");
  }

  return `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
})();

/**
 * Single, shared Prisma client instance.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
