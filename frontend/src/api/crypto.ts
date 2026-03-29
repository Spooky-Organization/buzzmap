/**
 * Client-side Crypto Utilities — Web Crypto API (SubtleCrypto)
 *
 * Mirrors the server-side cryptoUtils.ts algorithm choices so both sides
 * independently derive the same AES-256 session key from the ECDH exchange.
 *
 * Algorithm chain:
 *   ECDH P-256 → 256 raw bits → HKDF-SHA256 → AES-256-GCM CryptoKey
 *
 * All operations are async and non-extractable where possible — the private
 * key and final AES key are never exposed as raw bytes in JS memory.
 */

const CURVE: EcKeyGenParams = { name: 'ECDH', namedCurve: 'P-256' };
const HKDF_INFO = new TextEncoder().encode('dashlabs-session-key');
const HKDF_SALT = new Uint8Array(32); // all-zero, matches server

// ─── Helpers — base64url (RFC 4648 §5) ───────────────────────────────────────
//
// Standard base64 uses '+' and '/' which validator.escape() converts to HTML
// entities, corrupting binary data that passes through the sanitization
// middleware.  base64url replaces '+' → '-' and '/' → '_' and drops '='
// padding — all characters that survive validator.escape() unchanged.

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlToBuf(b64url: string): ArrayBuffer {
  // Re-add standard base64 chars and padding before atob
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// ─── Key generation ───────────────────────────────────────────────────────────

export interface ClientKeyPair {
  /** Raw uncompressed P-256 point (65 bytes), base64 — send to server */
  publicKeyB64: string;
  /** Non-extractable private key — used locally to derive session key */
  privateKey: CryptoKey;
}

/**
 * Generate an ephemeral ECDH P-256 key pair.
 * Public key is exported as raw bytes (base64) for transmission.
 * Private key is non-extractable and stays in the SubtleCrypto key store.
 */
export async function generateClientKeyPair(): Promise<ClientKeyPair> {
  const keyPair = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  const rawPublic = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  return { publicKeyB64: bufToB64url(rawPublic), privateKey: keyPair.privateKey };
}

// ─── Key derivation ───────────────────────────────────────────────────────────

/**
 * Derive the shared AES-256-GCM session key from the server's public key.
 * Steps:
 *   1. Import server's raw public key
 *   2. ECDH → 256 shared bits
 *   3. Import bits as HKDF base key
 *   4. HKDF-SHA256 → AES-256-GCM CryptoKey (encrypt + decrypt)
 */
export async function deriveSessionKey(
  serverPublicKeyB64: string,
  clientPrivateKey: CryptoKey
): Promise<CryptoKey> {
  const serverPubRaw = b64urlToBuf(serverPublicKeyB64);

  const serverPublicKey = await crypto.subtle.importKey(
    'raw',
    serverPubRaw,
    CURVE,
    false,
    []
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: serverPublicKey },
    clientPrivateKey,
    256
  );

  const hkdfBase = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);

  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: HKDF_INFO },
    hkdfBase,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

export interface EncryptedPayload {
  payload: string; // base64 AES-GCM ciphertext (includes 16-byte auth tag appended by SubtleCrypto)
  iv: string;      // base64 96-bit IV
}

/**
 * AES-256-GCM encrypt any JSON-serialisable value.
 * SubtleCrypto automatically appends the 16-byte auth tag to the ciphertext.
 */
export async function encryptPayload(data: unknown, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { payload: bufToB64url(ciphertext), iv: bufToB64url(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)) };
}

/**
 * AES-256-GCM decrypt and JSON-parse.
 * SubtleCrypto expects the full ciphertext blob including the auth tag.
 */
export async function decryptPayload<T>(
  payload: string,
  iv: string,
  key: CryptoKey
): Promise<T> {
  const ciphertext = b64urlToBuf(payload);
  const ivBuf = b64urlToBuf(iv);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
