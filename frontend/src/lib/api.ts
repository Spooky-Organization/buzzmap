import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { appRoutes } from './routes';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor — attach access token from NextAuth session
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Guard against multiple 401 responses triggering concurrent signouts
let isSigningOut = false;

// Response interceptor — unwrap { status, data } envelope and handle 401
api.interceptors.response.use(
  (response) => {
    // Unwrap the backend's { status, data } envelope
    if (response.data && typeof response.data === 'object' && 'status' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && !isSigningOut) {
      isSigningOut = true;
      try {
        await signOut({ redirectTo: appRoutes.auth.login });
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = appRoutes.auth.login;
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a user-safe message from a failed API call. Server-provided messages
 * are surfaced only for client errors (4xx) — these are operational and
 * human-readable (validation, file type/size, not-found). Server errors (5xx),
 * network failures, and anything unexpected fall back to the caller's generic
 * message so internal details are never shown to the user.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message?: string }> }
      | undefined;
    if (status && status >= 400 && status < 500) {
      // Prefer the first field-level validation message when present.
      const fieldMessage = data?.errors?.find((e) => e?.message)?.message;
      if (fieldMessage) return fieldMessage;
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }
  }
  return fallback;
}

export { api };
