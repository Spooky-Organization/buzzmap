import { type Express } from 'express';
import authRoutes from '../modules/auth/routes.js';
import userRoutes from '../modules/users/routes.js';
import povRoutes from '../modules/pov/routes.js';
import feedRoutes from '../modules/feed/routes.js';
import postRoutes from '../modules/posts/routes.js';
import productRoutes from '../modules/products/routes.js';
import orderRoutes from '../modules/orders/routes.js';
import cartRoutes from '../modules/orders/cartRoutes.js';
import notificationRoutes from '../modules/notifications/routes.js';
import searchRoutes from '../modules/search/routes.js';
import recommendationRoutes from '../modules/recommendations/routes.js';
import messagingRoutes from '../modules/messaging/routes.js';
import businessRoutes from '../modules/business/routes.js';

export function registerRoutes(app: Express): void {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/pov', povRoutes);
  app.use('/api/v1/feed', feedRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/recommendations', recommendationRoutes);
  app.use('/api/v1/messaging', messagingRoutes);
  app.use('/api/v1/business', businessRoutes);
}
