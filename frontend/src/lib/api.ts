import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

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
        await signOut({ redirectTo: '/login' });
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api };
