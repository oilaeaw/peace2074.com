import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IUser } from '../models/user.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this'
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-auth-secret-change-this'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: IUser): string {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function sanitizeUser(user: IUser) {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}