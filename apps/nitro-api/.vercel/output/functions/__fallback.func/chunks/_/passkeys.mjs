import { c as createError, n as useStorage, m as getHeader, o as isFallbackAuthStorageAllowed, p as createDatabaseRequiredError } from '../nitro/nitro.mjs';
import crypto from 'node:crypto';
import { generateAuthenticationOptions, verifyAuthenticationResponse, generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { g as getProfile, u as updateProfile, c as createProfile } from './profile.mjs';
import { e as findUserByUsername, b as findUserById, g as getAllUsers } from './users.mjs';

const PASSKEY_RP_NAME = "Peace2074";
const PASSKEYS_KEY_PREFIX = "db:passkeys:";
const PASSKEY_CHALLENGE_KEY_PREFIX = "db:passkey-challenge:";
const PASSKEY_CHALLENGE_TTL_MS = 5 * 60 * 1e3;
function getStorage() {
  return useStorage("data");
}
function getPasskeysKey(userId) {
  return `${PASSKEYS_KEY_PREFIX}${userId}`;
}
function getChallengeKey(requestId) {
  return `${PASSKEY_CHALLENGE_KEY_PREFIX}${requestId}`;
}
function normalizePasskeys(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => {
    const value = item;
    if (!(value == null ? void 0 : value.id) || !(value == null ? void 0 : value.publicKey)) return null;
    return {
      id: String(value.id),
      publicKey: String(value.publicKey),
      counter: Number.isFinite(value.counter) ? Number(value.counter) : 0,
      transports: Array.isArray(value.transports) ? value.transports.filter(Boolean) : void 0,
      deviceType: value.deviceType === "singleDevice" || value.deviceType === "multiDevice" ? value.deviceType : void 0,
      backedUp: Boolean(value.backedUp),
      createdAt: typeof value.createdAt === "string" ? value.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      lastUsedAt: typeof value.lastUsedAt === "string" ? value.lastUsedAt : void 0
    };
  }).filter((item) => Boolean(item));
}
async function readLegacyPasskeysFromStorage(userId) {
  try {
    const storage = getStorage();
    const stored = await storage.getItem(getPasskeysKey(userId));
    return normalizePasskeys(stored);
  } catch {
    return [];
  }
}
async function syncPasskeysToProfile(userId, passkeys, existingProfile) {
  const settings = {
    ...(existingProfile == null ? void 0 : existingProfile.settings) || {},
    passkeys
  };
  if (!existingProfile) {
    const created = await createProfile({
      userId,
      settings,
      tasbeeh_summary: { total: 0, sessions: 0 }
    });
    if (!created) {
      throw createDatabaseRequiredError(
        "Profile not found for passkey persistence"
      );
    }
    return created;
  }
  const updated = await updateProfile(userId, { settings });
  if (!updated) {
    throw createDatabaseRequiredError(
      "Failed to persist passkeys to the database"
    );
  }
  return updated;
}
async function saveFallbackPasskeys(userId, passkeys) {
  if (!isFallbackAuthStorageAllowed()) {
    throw createDatabaseRequiredError();
  }
  const storage = getStorage();
  await storage.setItem(getPasskeysKey(userId), normalizePasskeys(passkeys));
}
async function deleteUserPasskeyStorage(userId) {
  try {
    const storage = getStorage();
    await storage.removeItem(getPasskeysKey(userId));
  } catch {
  }
}
async function getUserPasskeys(userId) {
  var _a;
  const profile = await getProfile(userId);
  const profilePasskeys = normalizePasskeys((_a = profile == null ? void 0 : profile.settings) == null ? void 0 : _a.passkeys);
  if (profilePasskeys.length > 0) {
    if (isFallbackAuthStorageAllowed()) {
      await saveFallbackPasskeys(userId, profilePasskeys);
    }
    return profilePasskeys;
  }
  const legacyPasskeys = await readLegacyPasskeysFromStorage(userId);
  if (legacyPasskeys.length > 0) {
    await syncPasskeysToProfile(userId, legacyPasskeys, profile);
    if (isFallbackAuthStorageAllowed()) {
      await saveFallbackPasskeys(userId, legacyPasskeys);
    }
    return legacyPasskeys;
  }
  if (!isFallbackAuthStorageAllowed()) {
    return [];
  }
  return [];
}
async function saveUserPasskeys(userId, passkeys) {
  const normalized = normalizePasskeys(passkeys);
  if (!isFallbackAuthStorageAllowed()) {
    await syncPasskeysToProfile(userId, normalized, await getProfile(userId));
    return;
  }
  await saveFallbackPasskeys(userId, normalized);
  const profile = await getProfile(userId);
  if (!profile) return;
  const settings = {
    ...profile.settings || {},
    passkeys: normalized
  };
  await updateProfile(userId, { settings });
}
async function findPasskeyOwnerByCredentialId(credentialId) {
  const users = await getAllUsers();
  for (const user of users) {
    const passkeys = await getUserPasskeys(user.id);
    const passkey = passkeys.find((candidate) => candidate.id === credentialId);
    if (passkey) {
      return { user, passkey };
    }
  }
  return null;
}
function parseWebAuthnOrigin(event) {
  const originHeader = (getHeader(event, "origin") || "").trim();
  if (!originHeader) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkeys require a browser origin header"
    });
  }
  let origin;
  try {
    origin = new URL(originHeader);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid passkey origin"
    });
  }
  if (!["https:", "http:"].includes(origin.protocol)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkeys require an HTTPS or localhost browser context"
    });
  }
  if (origin.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(origin.hostname)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkeys require HTTPS outside localhost"
    });
  }
  return {
    expectedOrigin: origin.origin,
    rpID: origin.hostname
  };
}
async function storeChallenge(challenge) {
  const storage = getStorage();
  await storage.setItem(getChallengeKey(challenge.requestId), challenge);
}
async function takeChallenge(requestId, type) {
  const storage = getStorage();
  const key = getChallengeKey(requestId);
  const stored = await storage.getItem(key);
  await storage.removeItem(key);
  if (!stored || stored.type !== type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey request expired or invalid"
    });
  }
  if (Date.now() - new Date(stored.createdAt).getTime() > PASSKEY_CHALLENGE_TTL_MS) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey request expired or invalid"
    });
  }
  return stored;
}
function toPasskeyCredential(passkey) {
  return {
    id: passkey.id,
    publicKey: Buffer.from(passkey.publicKey, "base64url"),
    counter: passkey.counter,
    transports: passkey.transports
  };
}
async function getDisplayName(user) {
  const profile = await getProfile(user.id);
  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "";
  return {
    profile,
    displayName: name || user.username
  };
}
async function buildAuthenticatedUser(user) {
  const { profile, displayName } = await getDisplayName(user);
  return {
    sessionUser: {
      id: user.id,
      role: user.role,
      name: displayName
    },
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: (profile == null ? void 0 : profile.first_name) || user.username,
      last_name: (profile == null ? void 0 : profile.last_name) || "",
      avatar_url: (profile == null ? void 0 : profile.avatar_url) || null,
      permissions: user.permissions || []
    }
  };
}
async function beginPasskeyRegistration(event, userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found"
    });
  }
  const { expectedOrigin, rpID } = parseWebAuthnOrigin(event);
  const existingPasskeys = await getUserPasskeys(user.id);
  const { displayName } = await getDisplayName(user);
  const options = await generateRegistrationOptions({
    rpName: PASSKEY_RP_NAME,
    rpID,
    userName: user.username,
    userID: Buffer.from(user.id, "utf8"),
    userDisplayName: displayName,
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports
    })),
    timeout: 6e4,
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred"
    },
    preferredAuthenticatorType: "localDevice"
  });
  const requestId = crypto.randomUUID();
  await storeChallenge({
    requestId,
    type: "registration",
    challenge: options.challenge,
    expectedOrigin,
    rpID,
    userId: user.id,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    requestId,
    options,
    hasExistingPasskeys: existingPasskeys.length > 0
  };
}
async function finishPasskeyRegistration(userId, requestId, registrationResponse) {
  const challenge = await takeChallenge(requestId, "registration");
  if (challenge.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Passkey registration does not match the current session"
    });
  }
  const verification = await verifyRegistrationResponse({
    response: registrationResponse,
    expectedChallenge: challenge.challenge,
    expectedOrigin: challenge.expectedOrigin,
    expectedRPID: challenge.rpID,
    requireUserVerification: true
  });
  if (!verification.verified || !verification.registrationInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey registration could not be verified"
    });
  }
  const registrationInfo = verification.registrationInfo;
  const newPasskey = {
    id: registrationInfo.credential.id,
    publicKey: Buffer.from(registrationInfo.credential.publicKey).toString(
      "base64url"
    ),
    counter: registrationInfo.credential.counter,
    transports: registrationResponse.response.transports,
    deviceType: registrationInfo.credentialDeviceType,
    backedUp: registrationInfo.credentialBackedUp,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const passkeys = await getUserPasskeys(userId);
  const deduped = passkeys.filter((passkey) => passkey.id !== newPasskey.id);
  deduped.push(newPasskey);
  await saveUserPasskeys(userId, deduped);
  return newPasskey;
}
async function hasAnyRegisteredPasskeys() {
  const users = await getAllUsers();
  for (const user of users) {
    const passkeys = await getUserPasskeys(user.id);
    if (passkeys.length > 0) return true;
  }
  return false;
}
async function beginPasskeyAuthentication(event, username) {
  const { expectedOrigin, rpID } = parseWebAuthnOrigin(event);
  const normalizedUsername = (username || "").trim();
  let userId;
  let allowCredentials;
  if (normalizedUsername) {
    const user = await findUserByUsername(normalizedUsername);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "No passkeys registered for this account yet"
      });
    }
    const passkeys = await getUserPasskeys(user.id);
    if (!passkeys.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "No passkeys registered for this account yet"
      });
    }
    userId = user.id;
    allowCredentials = passkeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports
    }));
  } else if (!await hasAnyRegisteredPasskeys()) {
    throw createError({
      statusCode: 404,
      statusMessage: "No passkeys are registered yet"
    });
  }
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    timeout: 6e4,
    userVerification: "preferred"
  });
  const requestId = crypto.randomUUID();
  await storeChallenge({
    requestId,
    type: "authentication",
    challenge: options.challenge,
    expectedOrigin,
    rpID,
    userId,
    username: normalizedUsername || void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    requestId,
    options
  };
}
async function finishPasskeyAuthentication(requestId, authenticationResponse) {
  const challenge = await takeChallenge(requestId, "authentication");
  const credentialOwner = await findPasskeyOwnerByCredentialId(
    authenticationResponse.id
  );
  if (!credentialOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: "Passkey not recognized"
    });
  }
  if (challenge.userId && challenge.userId !== credentialOwner.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Passkey does not belong to the requested account"
    });
  }
  const verification = await verifyAuthenticationResponse({
    response: authenticationResponse,
    expectedChallenge: challenge.challenge,
    expectedOrigin: challenge.expectedOrigin,
    expectedRPID: challenge.rpID,
    credential: toPasskeyCredential(credentialOwner.passkey),
    requireUserVerification: true
  });
  if (!verification.verified) {
    throw createError({
      statusCode: 401,
      statusMessage: "Passkey authentication failed"
    });
  }
  const passkeys = await getUserPasskeys(credentialOwner.user.id);
  const updated = passkeys.map((passkey) => {
    if (passkey.id !== credentialOwner.passkey.id) return passkey;
    return {
      ...passkey,
      counter: verification.authenticationInfo.newCounter,
      deviceType: verification.authenticationInfo.credentialDeviceType,
      backedUp: verification.authenticationInfo.credentialBackedUp,
      lastUsedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  await saveUserPasskeys(credentialOwner.user.id, updated);
  return credentialOwner.user;
}

export { buildAuthenticatedUser as a, beginPasskeyAuthentication as b, beginPasskeyRegistration as c, deleteUserPasskeyStorage as d, finishPasskeyRegistration as e, finishPasskeyAuthentication as f };
//# sourceMappingURL=passkeys.mjs.map
