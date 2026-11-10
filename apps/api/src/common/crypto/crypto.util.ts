import * as crypto from 'crypto';
import * as argon2 from 'argon2';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from the given secret or environment variable.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET || 'petals-default-32-byte-secret-key-12345';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive text (e.g. 2FA secret) using AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts sensitive text encrypted with AES-256-GCM.
 */
export function decryptSecret(cipherTextBase64: string): string {
  const key = getEncryptionKey();
  const buffer = Buffer.from(cipherTextBase64, 'base64');

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const cipherText = buffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Hashes a password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verifies a password against an Argon2 hash.
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

/**
 * Hashes a refresh token or OTP code with SHA-256.
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generates a cryptographically secure random token (hex string).
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a 6-digit numeric OTP.
 */
export function generateNumericOtp(): string {
  const val = crypto.randomInt(100000, 1000000);
  return val.toString();
}

