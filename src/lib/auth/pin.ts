import { createHash } from 'crypto'

/**
 * Hash a PIN using SHA-256
 * @param pin - The PIN to hash
 * @returns The hashed PIN
 */
export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

/**
 * Verify a PIN against a hash
 * @param pin - The PIN to verify
 * @param hash - The hash to verify against
 * @returns True if the PIN matches the hash
 */
export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash
}
