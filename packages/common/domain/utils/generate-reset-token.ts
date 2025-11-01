import { randomBytes } from 'crypto'

/**
 * Generates a secure random token for password reset
 * @returns A URL-safe random token string
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Creates an expiration date for the reset token (1 hour from now)
 * @returns Date object representing when the token expires
 */
export function getResetTokenExpiry(): Date {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 1)
  return expiryDate
}
