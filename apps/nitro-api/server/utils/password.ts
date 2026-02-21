import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const SALT_LENGTH = 16
const KEY_LENGTH = 64

/**
 * Hash a password using scrypt
 * Format: salt:hash (both base64url encoded)
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH)
    const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
    return `${salt.toString('base64url')}:${hash.toString('base64url')}`
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Handle legacy plain text passwords (temporary migration path)
    if (!storedHash.includes(':')) {
        // This is a plain text password - compare directly but this should be migrated
        return password === storedHash
    }

    const [saltStr, hashStr] = storedHash.split(':')
    if (!saltStr || !hashStr) return false

    try {
        const salt = Buffer.from(saltStr, 'base64url')
        const storedHashBuffer = Buffer.from(hashStr, 'base64url')
        const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

        return timingSafeEqual(storedHashBuffer, hash)
    } catch {
        return false
    }
}

/**
 * Check if a stored password is hashed or plain text
 */
export function isPasswordHashed(password: string): boolean {
    return password.includes(':') && password.split(':').length === 2
}
