/**
 * Crypto Utilities — ECDH key exchange + AES-256-GCM payload encryption
 *
 * Flow:
 *   1. Client POSTs its ephemeral ECDH P-256 public key (raw, base64) to /api/handshake
 *   2. Server generates its own ephemeral key pair, computes shared secret via ECDH
 *   3. Shared secret is stretched to a 256-bit AES key with HKDF-SHA256
 *   4. Derived key is stored in Redis under a random sessionId (TTL 24 h)
 *   5. Server returns its public key + sessionId to the client
 *   6. Both sides independently derive the same AES key; all subsequent
 *      request bodies and response bodies are encrypted with AES-256-GCM
 */

import crypto from 'crypto';

const CURVE = 'prime256v1'; // P-256 / secp256r1 — matches Web Crypto 'P-256'
const AES_ALGO = 'aes-256-gcm';
const IV_BYTES = 12;          // 96-bit IV recommended for GCM
const KEY_BYTES = 32;         // 256-bit AES key
const AUTH_TAG_BYTES = 16;    // GCM auth tag length
const HKDF_INFO = Buffer.from('dashlabs-session-key');
const HKDF_SALT = Buffer.alloc(32); // all-zero salt (matches frontend)

export interface ECDHServer {
  ecdh: crypto.ECDH;
  publicKeyB64url: string;
}

/**
 * Generate a fresh ephemeral ECDH P-256 key pair.
 * Returns the instance (holds private key) and the raw public key as base64url.
 *
 * base64url is used throughout (replaces + → - and / → _, no padding) so the
 * strings survive validator.escape() in the sanitization middleware unchanged.
 */
export function createServerECDH(): ECDHServer {
  const ecdh = crypto.createECDH(CURVE);
  ecdh.generateKeys();
  return { ecdh, publicKeyB64url: ecdh.getPublicKey('base64url') };
}

/**
 * Compute ECDH shared secret then stretch it to a 256-bit AES key via HKDF-SHA256.
 * @param ecdh         Server ECDH instance (holds private key)
 * @param clientB64url Client's raw uncompressed P-256 public key (base64url)
 */
export function deriveSessionKey(ecdh: crypto.ECDH, clientB64url: string): Buffer {
  const clientPub = Buffer.from(clientB64url, 'base64url');
  const sharedSecret = ecdh.computeSecret(clientPub);
  return Buffer.from(
    crypto.hkdfSync('sha256', sharedSecret, HKDF_SALT, HKDF_INFO, KEY_BYTES)
  );
}

/**
 * AES-256-GCM encrypt.
 * Output layout: [ciphertext | 16-byte auth tag], IV separate.
 * Both are returned as base64url strings (safe through XSS sanitization).
 */
export function encryptPayload(
  plaintext: string,
  keyBuffer: Buffer
): { payload: string; iv: string } {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(AES_ALGO, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    payload: Buffer.concat([encrypted, authTag]).toString('base64url'),
    iv: iv.toString('base64url'),
  };
}

/**
 * AES-256-GCM decrypt.
 * Expects payload = base64url([ciphertext | 16-byte auth tag]).
 */
export function decryptPayload(
  payload: string,
  iv: string,
  keyBuffer: Buffer
): string {
  const combined = Buffer.from(payload, 'base64url');
  const ciphertext = combined.subarray(0, combined.length - AUTH_TAG_BYTES);
  const authTag = combined.subarray(combined.length - AUTH_TAG_BYTES);
  const decipher = crypto.createDecipheriv(AES_ALGO, keyBuffer, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
