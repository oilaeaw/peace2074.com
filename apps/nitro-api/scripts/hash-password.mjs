#!/usr/bin/env node
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

const password = process.argv[2] || "123456789";
const hashed = await hashPassword(password);
console.log(hashed);
