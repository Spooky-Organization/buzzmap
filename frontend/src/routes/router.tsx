/**
 * PLACEHOLDER - Router Manager
 * This will be implemented when backend integration is added
 */

import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

class RouterManager {
  private static instance: RouterManager;
  private router = createBrowserRouter(routes);

  private constructor() {}

  public static getInstance(): RouterManager {
    if (!RouterManager.instance) {
      RouterManager.instance = new RouterManager();
    }
    return RouterManager.instance;
  }

  public getRouter() {
    return this.router;
  }
}

export const routerManager = RouterManager.getInstance();

