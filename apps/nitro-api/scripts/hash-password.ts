#!/usr/bin/env node

import { randomBytes, scryptSync } from 'node:crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64

function hashPassword(password: string): string {
    const salt = randomBytes(SALT_LENGTH)
    const hash = scryptSync(password, salt, KEY_LENGTH)
    return `${salt.toString('base64url')}:${hash.toString('base64url')}`
}

const password = process.argv[2] || '123456789'
const hashed = hashPassword(password)

console.log(hashed)