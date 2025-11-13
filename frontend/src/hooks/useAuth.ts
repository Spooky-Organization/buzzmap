/**
 * useAuth Hook
 * React hook for authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SessionManager } from '@/auth/sessionManager';
import type { User } from '@/api/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    // Initialize user from session
    const currentUser = sessionManager.getUser();
    setUser(currentUser);
    setIsLoading(false);

    // Optionally fetch fresh user data
    if (currentUser) {
      sessionManager.getCurrentUser().then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await sessionManager.login(email, password);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [sessionManager]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await sessionManager.register(data);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [sessionManager]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await sessionManager.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionManager]);

  const refreshUser = useCallback(async () => {
    const freshUser = await sessionManager.getCurrentUser();
    if (freshUser) {
      setUser(freshUser);
    }
    return freshUser;
  }, [sessionManager]);

  return {
    user,
    isAuthenticated: sessionManager.isAuthenticated(),
    isLoading,
    login,
    logout,
    register,
    refreshUser,
    hasRole: (role: 'USER' | 'ACCOUNTANT' | 'ADMIN') => sessionManager.hasRole(role),
    isAdmin: () => sessionManager.isAdmin(),
    isAccountant: () => sessionManager.isAccountant(),
  };
};
