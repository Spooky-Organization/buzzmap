import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const user = process.env["POSTGRES_USER"];
const password = process.env["POSTGRES_PASSWORD"];
const host = process.env["POSTGRES_HOST"] || "localhost";
const port = process.env["POSTGRES_PORT"];
const dbName = process.env["POSTGRES_DB"];

if (!user || !password || !port || !dbName) {
  throw new Error("Missing PostgreSQL environment variables");
}

const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;

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
