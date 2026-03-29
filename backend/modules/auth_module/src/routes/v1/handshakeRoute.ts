/**
 * POST /api/handshake
 *
 * ECDH key-exchange endpoint. Not versioned (/api/v1/...) so it sits
 * outside the encrypted route tree — the handshake itself is plaintext.
 *
 * Request body:  { publicKey: string }   — client's raw P-256 public key, base64
 * Response body: { sessionId: string, publicKey: string }
 *                  sessionId — opaque token the client echoes as X-Session-ID
 *                  publicKey — server's raw P-256 public key, base64
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { redisClient } from '../../config/redis';
import { createServerECDH, deriveSessionKey } from '../../utils/cryptoUtils';
import { ApiError, asyncHandler } from '../../middleware';

const router = Router();

const CRYPTO_SESSION_TTL = 86400; // 24 hours

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { publicKey } = req.body as { publicKey?: unknown };

    if (typeof publicKey !== 'string' || publicKey.length === 0) {
      throw new ApiError('publicKey is required', 400);
    }

    // Generate ephemeral server key pair
    const { ecdh, publicKeyB64url } = createServerECDH();

    // Derive shared AES-256 session key
    let sessionKey: Buffer;
    try {
      sessionKey = deriveSessionKey(ecdh, publicKey);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error('[handshake] ECDH key derivation failed:', detail, '| publicKey length:', publicKey.length);
      throw new ApiError(`Invalid publicKey format: ${detail}`, 400);
    }

    // Store derived key in Redis — store hex, TTL 24 h
    const sessionId = crypto.randomUUID();
    await redisClient.set(
      `crypto:session:${sessionId}`,
      sessionKey.toString('hex'),
      { EX: CRYPTO_SESSION_TTL }
    );

    res.status(200).json({ sessionId, publicKey: publicKeyB64url });
  })
);

export default router;
