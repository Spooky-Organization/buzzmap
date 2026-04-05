import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env["DATABASE_URL"] as string,
  },
  migrate: {
    async url() {
      return process.env["DATABASE_URL"] as string;
    },
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
