/**
 * useSSE Hook
 * Custom hook for SSE (Server-Sent Events) connection management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionManager } from '@/auth/sessionManager';
import { SSEEventType, NotificationPayload, SessionPayload, UserUpdatePayload, TokenExpiredPayload } from '@/api/types';

interface SSEOptions {
  url: string;
  onNotification?: (payload: NotificationPayload) => void;
  onSessionCreated?: (payload: SessionPayload) => void;
  onSessionRevoked?: (payload: SessionPayload) => void;
  onSessionUpdated?: (payload: SessionPayload) => void;
  onUserUpdated?: (payload: UserUpdatePayload) => void;
  onRoleChanged?: (payload: UserUpdatePayload & { oldRole: string; newRole: string }) => void;
  onMfaEnabled?: (userId: string) => void;
  onMfaDisabled?: (userId: string) => void;
  onTokenExpired?: (payload: TokenExpiredPayload) => void;
  onHeartbeat?: () => void;
  onError?: (error: Event) => void;
}

interface SSEState {
  connected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: string | null;
}

export const useSSE = (options: SSEOptions) => {
  const {
    url,
    onNotification,
    onSessionCreated,
    onSessionRevoked,
    onSessionUpdated,
    onUserUpdated,
    onRoleChanged,
    onMfaEnabled,
    onMfaDisabled,
    onTokenExpired,
    onHeartbeat,
    onError,
  } = options;

  const [state, setState] = useState<SSEState>({
    connected: false,
    reconnectAttempts: 0,
    lastHeartbeat: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);
  const sessionManager = SessionManager.getInstance();

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      connected: false,
      reconnectAttempts: 0,
      lastHeartbeat: null,
    });
  }, []);

  const connect = useCallback(() => {
    if (!sessionManager.isAuthenticated()) {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = sessionManager.getAccessToken();
    if (!token) {
      return;
    }

    const separator = url.includes('?') ? '&' : '?';
    const sseUrl = `${url}${separator}token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setState(prev => ({
        ...prev,
        connected: true,
        reconnectAttempts: 0,
      }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.type as SSEEventType;

        switch (eventType) {
          case SSEEventType.NOTIFICATION:
            onNotification?.(data.payload as NotificationPayload);
            break;
          case SSEEventType.SESSION_CREATED:
            onSessionCreated?.(data.payload as SessionPayload);
            break;
          case SSEEventType.SESSION_REVOKED:
            onSessionRevoked?.(data.payload as SessionPayload);
            break;
          case SSEEventType.SESSION_UPDATED:
            onSessionUpdated?.(data.payload as SessionPayload);
            break;
          case SSEEventType.USER_UPDATED:
            onUserUpdated?.(data.payload as UserUpdatePayload);
            break;
          case SSEEventType.ROLE_CHANGED:
            onRoleChanged?.(data.payload);
            break;
          case SSEEventType.MFA_ENABLED:
            onMfaEnabled?.(data.payload?.userId);
            break;
          case SSEEventType.MFA_DISABLED:
            onMfaDisabled?.(data.payload?.userId);
            break;
          case SSEEventType.TOKEN_EXPIRED:
            onTokenExpired?.(data.payload as TokenExpiredPayload);
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setState(prev => ({ ...prev, connected: false }));
      onError?.({} as Event);

      eventSource.close();
      eventSourceRef.current = null;

      // Only schedule a reconnect if the hook is still mounted. Without this
      // guard, React StrictMode's unmount/remount cycle can leave an orphaned
      // setTimeout that fires later and opens a ghost connection.
      if (!isMountedRef.current) return;

      setState(prev => {
        if (prev.reconnectAttempts < 5) {
          const delay = 3000 * Math.pow(1.5, prev.reconnectAttempts);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) connect();
          }, delay);
          return { ...prev, reconnectAttempts: prev.reconnectAttempts + 1 };
        }
        return prev;
      });
    };

    eventSource.addEventListener('connected', () => {
      // Server-sent "connected" acknowledgement — no action needed
    });

    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onNotification?.(data as NotificationPayload);
      } catch { /* empty */ }
    });

    eventSource.addEventListener('session_created', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onSessionCreated?.(data as SessionPayload);
      } catch { /* empty */ }
    });

    eventSource.addEventListener('session_revoked', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onSessionRevoked?.(data as SessionPayload);
      } catch { /* empty */ }
    });

    eventSource.addEventListener('heartbeat', () => {
      setState(prev => ({ ...prev, lastHeartbeat: new Date().toISOString() }));
      onHeartbeat?.();
    });
  }, [
    url,
    onNotification,
    onSessionCreated,
    onSessionRevoked,
    onSessionUpdated,
    onUserUpdated,
    onRoleChanged,
    onMfaEnabled,
    onMfaDisabled,
    onTokenExpired,
    onHeartbeat,
    onError,
    sessionManager,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    // Wrap the initial connect in setTimeout(0) so that React StrictMode's
    // synchronous mount → unmount → remount cycle cancels the timer before it
    // fires. Without this, StrictMode opens a connection on mount 1, immediately
    // aborts it on unmount, then opens the real connection on mount 2.
    let connectTimer: NodeJS.Timeout | null = null;
    if (sessionManager.isAuthenticated()) {
      connectTimer = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, 0);
    }

    return () => {
      isMountedRef.current = false;
      if (connectTimer) clearTimeout(connectTimer);
      disconnect();
    };
  }, [connect, disconnect, sessionManager]);

  return {
    ...state,
    connect,
    disconnect,
  };
};

export default useSSE;
