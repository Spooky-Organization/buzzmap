import { connectRedis } from "./config/redis";
import { validateEnvironment, getEnv, EnvValidationError } from "./utils/envValidation";

const startServer = async () => {
  try {
    // 1. Validate environment variables first
    validateEnvironment();
    
    // 2. Establish critical connections
    await connectRedis();

    // 3. Dynamically import the app *after* connections are ready
    const { default: app } = await import("./app");

    // 4. Start the server
    const PORT = getEnv('PORT');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${getEnv('NODE_ENV')}`);
      console.log(`📧 Email service: ${getEnv('RESEND_FROM_EMAIL')}`);
      console.log(`🔗 CORS origin: ${getEnv('CORS_ORIGIN')}`);
    });
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('❌ Environment validation failed!');
      console.error('Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    } else {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
