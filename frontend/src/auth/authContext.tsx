/**
 * PLACEHOLDER - Auth Context Provider
 * This will be implemented when backend integration is added
 */

import { createContext, ReactNode } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<unknown>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};

