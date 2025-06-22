import dotenv from "dotenv";
import { connectRedis } from "./config/redis";

// Load environment variables
dotenv.config();

const PORT = process.env["PORT"] || 5000;

const startServer = async () => {
  // 1. Establish critical connections first.
  await connectRedis();

  // 2. Dynamically import the app *after* connections are ready.
  const { default: app } = await import("./app");

  // 3. Start the server.
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
