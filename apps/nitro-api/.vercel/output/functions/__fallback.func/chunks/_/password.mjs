import { randomBytes, timingSafeEqual, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("base64url")}:${hash.toString("base64url")}`;
}
async function verifyPassword(password, storedHash) {
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [saltStr, hashStr] = storedHash.split(":");
  if (!saltStr || !hashStr) return false;
  try {
    const salt = Buffer.from(saltStr, "base64url");
    const storedHashBuffer = Buffer.from(hashStr, "base64url");
    const hash = await scryptAsync(password, salt, KEY_LENGTH);
    return timingSafeEqual(storedHashBuffer, hash);
  } catch {
    return false;
  }
}
function isPasswordHashed(password) {
  return password.includes(":") && password.split(":").length === 2;
}

export { hashPassword as h, isPasswordHashed as i, verifyPassword as v };
//# sourceMappingURL=password.mjs.map
