// Global type shims for the project to help TypeScript resolution

declare module '#auth-utils' {
  export interface UserSession {
    user?: Record<string, any> | null
    loggedInAt?: number
  }
  export function setUserSession(event: any, data: Partial<UserSession>, opts?: Record<string, any>): Promise<void>
  export function replaceUserSession(event: any, data: Partial<UserSession>, opts?: Record<string, any>): Promise<void>
  export function getUserSession(event: any): Promise<UserSession | null>
  export function clearUserSession(event: any): Promise<void>
}

declare module '~/server/utils/auth' {
  export function getTokenFromEvent(event: any): string | undefined
  export function issueAuthToken(event: any, payload: Record<string, any>, opts?: { expiresIn?: string | number }): Promise<{ type: string, token?: string }>
  export function clearAuthToken(event: any): Promise<void>
  export function verifyAuthToken(token: string | undefined | null): Record<string, any> | null
  export function getUserFromEvent(event: any): Promise<Record<string, any> | null>
}

// Shims for packages that may not have types installed
declare module 'nodemailer'
declare module '@prisma/client'

export {}
