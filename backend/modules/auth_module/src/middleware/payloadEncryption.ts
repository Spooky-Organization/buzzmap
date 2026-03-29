/**
 * Payload Encryption Middleware
 *
 * Attaches to every route except the handshake, health check, and SSE streams.
 * When a request carries an X-Session-ID header the middleware:
 *   1. Fetches the AES-256 session key from Redis
 *   2. Decrypts the request body (non-GET requests with { payload, iv })
 *   3. Patches res.json so the outgoing response is AES-256-GCM encrypted
 *
 * Requests without X-Session-ID pass through unmodified (backwards-compatible).
 */

import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { decryptPayload, encryptPayload } from '../utils/cryptoUtils';
import { ApiError, asyncHandler } from './errorHandler';

// ─── Bypass list ─────────────────────────────────────────────────────────────

const BYPASS_EXACT = new Set(['/api/handshake', '/api/health']);
const BYPASS_PREFIX = ['/api/v1/sse'];

function shouldBypass(path: string): boolean {
  if (BYPASS_EXACT.has(path)) return true;
  return BYPASS_PREFIX.some((p) => path.startsWith(p));
}

// ─── Redis helpers ────────────────────────────────────────────────────────────

async function fetchSessionKey(sessionId: string): Promise<Buffer | null> {
  const hex = await redisClient.get(`crypto:session:${sessionId}`);
  return hex ? Buffer.from(hex, 'hex') : null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Single middleware that handles both directions:
 *   - decrypt incoming request body
 *   - monkey-patch res.json to encrypt outgoing response body
 */
export const payloadEncryption = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (shouldBypass(req.path)) {
      next();
      return;
    }

    const sessionId = req.headers['x-session-id'] as string | undefined;

    // No session header → client not using encryption, pass through
    if (!sessionId) {
      next();
      return;
    }

    const keyBuffer = await fetchSessionKey(sessionId);
    if (!keyBuffer) {
      throw new ApiError('Invalid or expired crypto session — re-handshake required', 401);
    }

    // ── Decrypt request body ──────────────────────────────────────────────────
    if (
      req.method !== 'GET' &&
      req.body !== null &&
      typeof req.body === 'object' &&
      typeof req.body.payload === 'string' &&
      typeof req.body.iv === 'string'
    ) {
      try {
        const plaintext = decryptPayload(req.body.payload as string, req.body.iv as string, keyBuffer);
        req.body = JSON.parse(plaintext) as unknown;
      } catch {
        throw new ApiError('Failed to decrypt request payload', 400);
      }
    }

    // ── Patch res.json to encrypt outgoing responses ──────────────────────────
    const originalJson = res.json.bind(res) as (body?: unknown) => Response;

    res.json = function encryptedJson(body?: unknown): Response {
      if (body === undefined) return originalJson();
      try {
        const plaintext = JSON.stringify(body);
        const encrypted = encryptPayload(plaintext, keyBuffer);
        return originalJson(encrypted);
      } catch {
        // Encryption failed — fall back to plaintext to avoid swallowing the error
        return originalJson(body);
      }
    };

    next();
  }
);
