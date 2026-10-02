/**
 * SOCIAL PULSE — Token Encryption at Rest
 * AES-256-GCM, key from env ENCRYPTION_KEY (base64 32 bytes)
 * Never send tokens to client
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY
  if (!b64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is required in production')
    }
    // dev fallback - NOT for production
    console.warn('⚠️ ENCRYPTION_KEY not set, using dev key (DO NOT USE IN PROD)')
    return crypto.createHash('sha256').update('dev-key-do-not-use-in-prod-12345').digest()
  }
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes (got ${key.length}), generate with: openssl rand -base64 32`)
  }
  return key
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  
  let encrypted = cipher.update(plaintext, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptToken(encryptedPayload: string): string {
  const key = getKey()
  const parts = encryptedPayload.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format')
  }
  const [ivB64, authTagB64, ciphertextB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  
  return decrypted.toString('utf8')
}

// Helper to check if token is expired
export function isTokenExpired(expiresAt: Date, bufferMinutes = 10): boolean {
  const now = new Date()
  const bufferMs = bufferMinutes * 60 * 1000
  return expiresAt.getTime() - bufferMs < now.getTime()
}

// Generate a secure key for .env.example
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64')
}
