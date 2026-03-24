/**
 * Notification Context
 * Provides global notification state management
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { NotificationPayload, NotificationType } from '@/api/types';
import { useSSE } from '@/hooks/useSSE';
import { API_ROUTES, getFullUrl } from '@/api/apiRoutes';

interface NotificationContextValue {
  notifications: NotificationPayload[];
  unreadCount: number;
  addNotification: (notification: NotificationPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  sseConnected: boolean;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'dashboard_notifications';
const MAX_STORED_NOTIFICATIONS = 100;

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.SUCCESS:
      return '✓';
    case NotificationType.WARNING:
      return '⚠';
    case NotificationType.ERROR:
      return '✕';
    case NotificationType.SESSION:
      return '🔐';
    case NotificationType.SECURITY:
      return '🛡';
    case NotificationType.INFO:
    default:
      return 'ℹ';
  }
};

const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (!initialLoadRef.current && notifications.length > 0) {
      initialLoadRef.current = true;
    } else if (initialLoadRef.current || notifications.length > 0) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED_NOTIFICATIONS)));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: NotificationPayload) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev].slice(0, MAX_STORED_NOTIFICATIONS);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotification = useCallback((payload: NotificationPayload) => {
    const notification: NotificationPayload = {
      ...payload,
      read: false,
      timestamp: payload.timestamp || new Date().toISOString(),
    };
    addNotification(notification);

    if (import.meta.env.DEV) {
      console.log(`[Notification] ${notification.type}: ${notification.title}`, notification);
    }
  }, [addNotification]);

  const handleSessionRevoked = useCallback((payload: { sessionId?: string; reason?: string }) => {
    const notification: NotificationPayload = {
      id: `session-revoked-${Date.now()}`,
      type: NotificationType.SESSION,
      title: 'Session Ended',
      message: payload.reason || 'A session has been ended on another device.',
      timestamp: new Date().toISOString(),
    };
    addNotification(notification);
  }, [addNotification]);

  const handleSessionCreated = useCallback((payload: { sessionId?: string; device?: string }) => {
    const notification: NotificationPayload = {
      id: `session-created-${Date.now()}`,
      type: NotificationType.INFO,
      title: 'New Session Detected',
      message: payload.device ? `New login from ${payload.device}` : 'A new session was created on another device.',
      timestamp: new Date().toISOString(),
    };
    addNotification(notification);
  }, [addNotification]);

  const handleRoleChanged = useCallback((payload: { userId?: string; oldRole?: string; newRole?: string }) => {
    const notification: NotificationPayload = {
      id: `role-changed-${Date.now()}`,
      type: NotificationType.WARNING,
      title: 'Role Changed',
      message: `Your role has been changed from ${payload.oldRole} to ${payload.newRole}.`,
      timestamp: new Date().toISOString(),
    };
    addNotification(notification);
  }, [addNotification]);

  const handleMfaEnabled = useCallback(() => {
    const notification: NotificationPayload = {
      id: `mfa-enabled-${Date.now()}`,
      type: NotificationType.SUCCESS,
      title: 'MFA Enabled',
      message: 'Two-factor authentication has been enabled on your account.',
      timestamp: new Date().toISOString(),
    };
    addNotification(notification);
  }, [addNotification]);

  const handleMfaDisabled = useCallback(() => {
    const notification: NotificationPayload = {
      id: `mfa-disabled-${Date.now()}`,
      type: NotificationType.WARNING,
      title: 'MFA Disabled',
      message: 'Two-factor authentication has been disabled on your account.',
      timestamp: new Date().toISOString(),
    };
    addNotification(notification);
  }, [addNotification]);

  const { connected: sseConnected } = useSSE({
    url: getFullUrl(API_ROUTES.SSE.NOTIFICATIONS),
    onNotification: handleNotification,
    onSessionRevoked: handleSessionRevoked,
    onSessionCreated: handleSessionCreated,
    onRoleChanged: handleRoleChanged,
    onMfaEnabled: handleMfaEnabled,
    onMfaDisabled: handleMfaDisabled,
  });

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    sseConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export { NotificationProvider, getNotificationIcon };
export default NotificationProvider;
