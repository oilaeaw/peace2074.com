#!/usr/bin/env node
/**
 * Manually migrate plain text passwords to hashed format
 * Usage: node scripts/migrate-passwords.mjs
 */

import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

function isPasswordHashed(password) {
  return password.includes(":") && password.split(":").length === 2;
}

// For KV storage (Netlify blob storage path)
const KV_NITRO_PATH = resolve(process.cwd(), "../../.data/kv/nitro");
const KV_USERS_KEY = "db:users";

async function migrateKVPasswords() {
  try {
    const kvPath = resolve(KV_NITRO_PATH, `${KV_USERS_KEY}.json`);
    console.log(`Checking KV storage: ${kvPath}`);

    const data = readFileSync(kvPath, "utf8");
    const users = JSON.parse(data);

    if (!Array.isArray(users)) {
      console.log("No users found in KV storage");
      return;
    }

    let migrated = 0;

    for (const user of users) {
      if (!user.password) continue;

      if (!isPasswordHashed(user.password)) {
        console.log(`Migrating password for user: ${user.username}`);
        user.password = await hashPassword(user.password);
        migrated++;
      } else {
        console.log(`Password already hashed for user: ${user.username}`);
      }
    }

    if (migrated > 0) {
      writeFileSync(kvPath, JSON.stringify(users, null, 2), "utf8");
      console.log(`✅ Migrated ${migrated} passwords in KV storage`);
    } else {
      console.log("✅ All passwords already hashed");
    }
  } catch (error) {
    console.log(`KV storage not found or error: ${error.message}`);
  }
}

await migrateKVPasswords();
