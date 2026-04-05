import dotenv from 'dotenv';
dotenv.config();

import { config } from './config/index.js';
import { app } from './core/app.js';
import { httpServer, io } from './core/server.js';
import { registerRoutes } from './core/routes.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { logger } from './shared/utils/logger.js';
import { initPrisma } from './shared/prisma/index.js';
import { initRedis } from './shared/redis/index.js';
import { setIO } from './shared/socket/index.js';
import { initStorage } from './shared/storage/index.js';
import { setupNotificationNamespace } from './modules/notifications/socket.js';
import { setupMessagingNamespace } from './modules/messaging/socket.js';

async function bootstrap() {
  // Initialize singletons
  initPrisma();
  initRedis();
  setIO(io);
  initStorage();

  // Register Socket.IO namespaces
  setupNotificationNamespace(io.of('/notifications'));
  setupMessagingNamespace(io.of('/messaging'));

  logger.info('All services initialized');

  // Register routes
  registerRoutes(app);

  // Error handler (must be last)
  app.use(errorHandler);

  // Start server
  httpServer.listen(config.backendPort, () => {
    logger.info(`Server running on port ${config.backendPort}`);
  });
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
