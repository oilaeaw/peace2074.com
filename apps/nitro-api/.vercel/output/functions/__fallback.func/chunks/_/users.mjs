import { u as useRuntimeConfig, o as isFallbackAuthStorageAllowed, g as getMongoose, p as createDatabaseRequiredError, n as useStorage } from '../nitro/nitro.mjs';
import { U as UserModel } from './User.mjs';
import { R as ReaderStatsModel } from './ReaderStats.mjs';
import { D as DeployLikeModel } from './DeployLike.mjs';
import { B as BlogLikeModel } from './BlogLike.mjs';
import { Q as QuranProgressModel } from './QuranProgress.mjs';
import { T as TasbeehModel } from './Tasbeeh.mjs';
import { P as ProfileModel, g as getProfile, c as createProfile, u as updateProfile } from './profile.mjs';
import crypto from 'node:crypto';

const OAUTH_AVATAR_HOST_PATTERNS = [
  /(^|\.)googleusercontent\.com$/i,
  /(^|\.)gstatic\.com$/i,
  /(^|\.)githubusercontent\.com$/i,
  /(^|\.)github\.com$/i
];
function normalizeConfigValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
function parseCloudinaryUrl(value) {
  const parsed = parseUrl(value);
  if (!parsed || parsed.protocol !== "cloudinary:") {
    return {};
  }
  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username || ""),
    apiSecret: decodeURIComponent(parsed.password || "")
  };
}
function getCloudinaryConfig() {
  const config = useRuntimeConfig();
  const cloudinaryUrl = normalizeConfigValue(
    process.env.CLOUDINARY_URL || config.cloudinaryUrl
  );
  const fromUrl = cloudinaryUrl ? parseCloudinaryUrl(cloudinaryUrl) : {};
  const cloudName = normalizeConfigValue(
    process.env.CLOUDINARY_CLOUD_NAME || config.cloudinaryCloudName || fromUrl.cloudName
  );
  const apiKey = normalizeConfigValue(
    process.env.CLOUDINARY_API_KEY || config.cloudinaryApiKey || fromUrl.apiKey
  );
  const apiSecret = normalizeConfigValue(
    process.env.CLOUDINARY_API_SECRET || config.cloudinaryApiSecret || fromUrl.apiSecret
  );
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  return {
    cloudName,
    apiKey,
    apiSecret
  };
}
function getHostname(value) {
  var _a;
  if (!value) return "";
  return ((_a = parseUrl(value)) == null ? void 0 : _a.hostname.toLowerCase()) || "";
}
function sanitizePublicIdSegment(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "avatar";
}
function createCloudinarySignature(params, apiSecret) {
  const toSign = Object.entries(params).filter(([, value]) => value !== "").sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("&");
  return crypto.createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}
function isCloudinaryAssetUrl(value) {
  const host = getHostname(value);
  return host === "res.cloudinary.com" || host.endsWith(".res.cloudinary.com");
}
function isLikelyOAuthAvatarUrl(value) {
  const host = getHostname(value);
  return OAUTH_AVATAR_HOST_PATTERNS.some((pattern) => pattern.test(host));
}
async function resolveOAuthAvatarUrl(options) {
  const imageUrl = normalizeConfigValue(options.imageUrl);
  if (!imageUrl) return void 0;
  const parsedImageUrl = parseUrl(imageUrl);
  if (!parsedImageUrl || parsedImageUrl.protocol !== "https:") {
    return imageUrl;
  }
  if (isCloudinaryAssetUrl(imageUrl)) {
    return imageUrl;
  }
  if (!isLikelyOAuthAvatarUrl(imageUrl)) {
    return imageUrl;
  }
  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return imageUrl;
  }
  const timestamp = Math.floor(Date.now() / 1e3);
  const params = {
    folder: "peace2074/oauth-avatars",
    invalidate: "true",
    overwrite: "true",
    public_id: `${sanitizePublicIdSegment(options.provider)}_${sanitizePublicIdSegment(options.providerId)}`,
    timestamp: String(timestamp)
  };
  const signature = createCloudinarySignature(params, cloudinary.apiSecret);
  const body = new URLSearchParams({
    ...params,
    api_key: cloudinary.apiKey,
    file: imageUrl,
    signature
  });
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );
    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.warn("[cloudinary] OAuth avatar upload failed", {
        provider: options.provider,
        providerId: options.providerId,
        status: response.status,
        details: details.slice(0, 300)
      });
      return imageUrl;
    }
    const payload = await response.json();
    return normalizeConfigValue(payload.secure_url) || imageUrl;
  } catch (error) {
    console.warn("[cloudinary] OAuth avatar upload error", {
      provider: options.provider,
      providerId: options.providerId,
      error
    });
    return imageUrl;
  }
}

const DEFAULT_USER_PERMISSIONS = [
  { action: "read", subject: "category" },
  { action: "read", subject: "post" },
  { action: "create", subject: "user" },
  { action: "read", subject: "user" },
  { action: "update", subject: "user" },
  { action: "read", subject: "chat" }
];
const ADMIN_EXTRA_PERMISSIONS = [
  { action: "manage", subject: "admin" },
  { action: "manage", subject: "chat" }
];
const EDITOR_EXTRA_PERMISSIONS = [
  { action: "update", subject: "post" }
];
function clonePermissions(permissions) {
  return permissions.map((permission) => ({ ...permission }));
}
function isPermissionEntry(permission) {
  if (!permission || typeof permission !== "object") return false;
  const candidate = permission;
  return typeof candidate.action === "string" && typeof candidate.subject === "string";
}
function dedupePermissions(permissions) {
  const seen = /* @__PURE__ */ new Set();
  return permissions.filter((permission) => {
    const key = `${permission.action}:${permission.subject}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function getRolePermissions(role = "user") {
  const permissions = clonePermissions(DEFAULT_USER_PERMISSIONS);
  if (role === "admin") {
    permissions.push(...clonePermissions(ADMIN_EXTRA_PERMISSIONS));
  } else if (role === "editor") {
    permissions.push(...clonePermissions(EDITOR_EXTRA_PERMISSIONS));
  }
  return dedupePermissions(permissions);
}
function resolveUserPermissions(user) {
  const storedPermissions = Array.isArray(user == null ? void 0 : user.permissions) ? user.permissions.filter(isPermissionEntry).map((permission) => ({ ...permission })) : [];
  return dedupePermissions([
    ...getRolePermissions((user == null ? void 0 : user.role) || "user"),
    ...storedPermissions
  ]);
}
const DEFAULT_USERS = [
  {
    id: "waelio",
    username: "waelio",
    password: "gLHVHtMcSY8Sum+H",
    email: "wael@peace2074.com",
    role: "admin",
    permissions: getRolePermissions("admin")
  }
];
const USERS_KEY = "db:users";
let initPromise = null;
let memoryUsers = null;
let dbMode = "unknown";
let dbFailureLogged = false;
function markDbUnavailable(error) {
  dbMode = "off";
  initPromise = null;
  if (!dbFailureLogged) {
    dbFailureLogged = true;
    console.warn("[users] MongoDB unavailable, falling back to Nitro storage:", error);
  }
}
function repairUsers(users) {
  if (!Array.isArray(users) || !users.length) return { users, changed: false };
  const defaultsById = new Map(DEFAULT_USERS.map((u) => [u.id, u]));
  let changed = false;
  const repaired = users.map((user) => {
    const fallback = defaultsById.get(user.id);
    if (!user.password && (fallback == null ? void 0 : fallback.password)) {
      changed = true;
      return { ...user, password: fallback.password };
    }
    return user;
  });
  return { users: repaired, changed };
}
async function loadFallbackUsers() {
  if (!isFallbackAuthStorageAllowed()) {
    throw createDatabaseRequiredError();
  }
  if (memoryUsers && memoryUsers.length > 0) {
    const repaired = repairUsers(memoryUsers);
    if (repaired.changed) {
      memoryUsers = repaired.users;
    }
    return memoryUsers;
  }
  try {
    const storage = useStorage("data");
    const existing = await storage.getItem(USERS_KEY);
    if (Array.isArray(existing) && existing.length > 0) {
      const repaired = repairUsers(existing.map(normalizeUser));
      memoryUsers = repaired.users;
      if (repaired.changed) {
        try {
          await storage.setItem(USERS_KEY, memoryUsers);
        } catch {
        }
      }
      return memoryUsers;
    }
    memoryUsers = [...DEFAULT_USERS];
    try {
      await storage.setItem(USERS_KEY, memoryUsers);
    } catch {
    }
    return memoryUsers;
  } catch {
    memoryUsers = [...DEFAULT_USERS];
    return memoryUsers;
  }
}
async function saveFallbackUsers(users) {
  if (!isFallbackAuthStorageAllowed()) {
    throw createDatabaseRequiredError();
  }
  memoryUsers = users;
  try {
    const storage = useStorage("data");
    await storage.setItem(USERS_KEY, users);
  } catch {
  }
}
function toAppUser(user) {
  return {
    id: user._id || user.id,
    username: user.username,
    password: user.password,
    email: user.email,
    role: user.role,
    first_name: user.first_name || void 0,
    last_name: user.last_name || void 0,
    tasbeeh: Array.isArray(user.tasbeeh) ? user.tasbeeh : [],
    bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks : [],
    avatar_url: user.avatar_url || void 0,
    github_id: user.github_id || void 0,
    google_id: user.google_id || void 0,
    apple_id: user.apple_id || void 0,
    permissions: resolveUserPermissions({
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : []
    })
  };
}
function normalizeUser(input) {
  return {
    id: String(input.id || ""),
    username: String(input.username || ""),
    password: String(input.password || ""),
    email: String(input.email || ""),
    role: String(input.role || "user"),
    first_name: input.first_name || "",
    last_name: input.last_name || "",
    tasbeeh: Array.isArray(input.tasbeeh) ? input.tasbeeh : [],
    bookmarks: Array.isArray(input.bookmarks) ? input.bookmarks : [],
    avatar_url: input.avatar_url,
    github_id: input.github_id,
    google_id: input.google_id,
    apple_id: input.apple_id,
    permissions: resolveUserPermissions({
      role: String(input.role || "user"),
      permissions: Array.isArray(input.permissions) ? input.permissions : []
    })
  };
}
function normalizeOptionalText(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return normalized || void 0;
}
function splitDisplayName(name) {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return {
      firstName: void 0,
      lastName: void 0
    };
  }
  const [firstName, ...rest] = normalized.split(" ");
  return {
    firstName: firstName || void 0,
    lastName: rest.join(" ").trim() || void 0
  };
}
function getOAuthNameParts(oauthInfo) {
  const explicitFirstName = normalizeOptionalText(oauthInfo.firstName);
  const explicitLastName = normalizeOptionalText(oauthInfo.lastName);
  const splitName = splitDisplayName(oauthInfo.name || "");
  const emailUsername = normalizeOptionalText(oauthInfo.email.split("@")[0]) || "user";
  return {
    firstName: explicitFirstName || splitName.firstName || emailUsername,
    lastName: explicitLastName || splitName.lastName
  };
}
function shouldAttemptAvatarRefresh(currentAvatar, nextAvatar) {
  const current = normalizeOptionalText(currentAvatar);
  const next = normalizeOptionalText(nextAvatar);
  if (!next) return false;
  if (!current) return true;
  if (current === next) return true;
  return isLikelyOAuthAvatarUrl(current);
}
function shouldPersistAvatar(currentAvatar, nextAvatar) {
  const current = normalizeOptionalText(currentAvatar);
  const next = normalizeOptionalText(nextAvatar);
  if (!next) return false;
  if (!current) return true;
  if (current === next) return false;
  if (!isCloudinaryAssetUrl(current) && isCloudinaryAssetUrl(next)) return true;
  return isLikelyOAuthAvatarUrl(current);
}
function createOAuthUsername(email) {
  return `${email.split("@")[0]}_${Math.random().toString(36).substring(7)}`;
}
function getOAuthProviderField(provider) {
  if (provider === "google") return "google_id";
  if (provider === "apple") return "apple_id";
  return "github_id";
}
function createOAuthUserId(provider, providerId) {
  return provider === "github" ? `github_${providerId}` : providerId;
}
async function resolvePersistedOAuthAvatar(oauthInfo, currentAvatar) {
  if (!shouldAttemptAvatarRefresh(currentAvatar, oauthInfo.picture)) {
    return void 0;
  }
  return await resolveOAuthAvatarUrl({
    provider: oauthInfo.provider,
    providerId: oauthInfo.providerId,
    imageUrl: oauthInfo.picture
  });
}
async function syncOAuthProfile(userId, oauthInfo, avatarUrl) {
  const { firstName, lastName } = getOAuthNameParts(oauthInfo);
  try {
    const profile = await getProfile(userId);
    if (!profile) {
      await createProfile({
        userId,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        github_id: oauthInfo.provider === "github" ? oauthInfo.providerId : void 0
      });
      return;
    }
    const updates = {};
    if (!profile.first_name && firstName) {
      updates.first_name = firstName;
    }
    if (!profile.last_name && lastName) {
      updates.last_name = lastName;
    }
    if (shouldPersistAvatar(profile.avatar_url || void 0, avatarUrl)) {
      updates.avatar_url = avatarUrl;
    }
    if (oauthInfo.provider === "github" && !profile.github_id) {
      updates.github_id = oauthInfo.providerId;
    }
    if (Object.keys(updates).length > 0) {
      await updateProfile(userId, updates);
    }
  } catch (error) {
    console.warn("[findOrCreateOAuthUser] Profile sync failed", {
      userId,
      provider: oauthInfo.provider,
      error
    });
  }
}
async function readLegacyUsers() {
  try {
    const storage = useStorage("data");
    const existing = await storage.getItem(USERS_KEY);
    if (!Array.isArray(existing)) return [];
    return existing.map(normalizeUser).filter((u) => u.id && u.username && u.email);
  } catch {
    return [];
  }
}
async function upsertByIdentity(user) {
  const existing = await UserModel.findOne({
    $or: [{ _id: user.id }, { username: user.username }, { email: user.email }]
  }).lean();
  const payload = {
    username: user.username,
    password: user.password,
    email: user.email,
    role: user.role,
    google_id: user.google_id || null,
    apple_id: user.apple_id || null,
    first_name: user.first_name || null,
    last_name: user.last_name || null,
    avatar_url: user.avatar_url || null,
    github_id: user.github_id || null,
    permissions: resolveUserPermissions(user)
  };
  if (existing) {
    await UserModel.findByIdAndUpdate(existing._id, {
      ...payload,
      password: payload.password || existing.password
    });
    return;
  }
  await UserModel.create({ _id: user.id, ...payload });
}
async function ensureInitialized() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await UserModel.countDocuments();
      const legacyUsers = await readLegacyUsers();
      const merged = repairUsers([...legacyUsers, ...DEFAULT_USERS]).users;
      const deduped = /* @__PURE__ */ new Map();
      for (const user of merged) {
        const normalized = normalizeUser(user);
        if (!normalized.id || !normalized.username || !normalized.email) continue;
        if (!deduped.has(normalized.id)) {
          deduped.set(normalized.id, normalized);
        }
      }
      for (const user of deduped.values()) {
        await upsertByIdentity(user);
      }
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();
  return initPromise;
}
async function isDbReady() {
  if (dbMode === "off") return false;
  try {
    await getMongoose();
    await ensureInitialized();
    dbMode = "on";
    dbFailureLogged = false;
    return true;
  } catch (error) {
    markDbUnavailable(error);
    return false;
  }
}
async function getAllUsers() {
  if (await isDbReady()) {
    try {
      const users = await UserModel.find().lean();
      return users.map(toAppUser);
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  return await loadFallbackUsers();
}
async function findUserByUsername(username) {
  if (await isDbReady()) {
    try {
      const user = await UserModel.findOne({ username }).lean();
      return user ? toAppUser(user) : void 0;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  return users.find((u) => u.username === username);
}
async function findUserByEmail(email) {
  if (await isDbReady()) {
    try {
      const user = await UserModel.findOne({ email }).lean();
      return user ? toAppUser(user) : void 0;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  return users.find((u) => u.email === email);
}
async function findUserById(id) {
  if (await isDbReady()) {
    try {
      const user = await UserModel.findById(id).lean();
      return user ? toAppUser(user) : void 0;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  return users.find((u) => u.id === id);
}
async function updateUserPassword(userId, newPassword) {
  if (await isDbReady()) {
    try {
      const result = await UserModel.findByIdAndUpdate(userId, { password: newPassword });
      if (!result) return false;
      return true;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.password = newPassword;
  await saveFallbackUsers(users);
  return true;
}
async function deleteUserById(userId) {
  if (await isDbReady()) {
    try {
      await ReaderStatsModel.deleteMany({ userId });
      await DeployLikeModel.deleteMany({ userId });
      await BlogLikeModel.deleteMany({ userId });
      await QuranProgressModel.deleteMany({ userId });
      await TasbeehModel.deleteMany({ userId });
      await ProfileModel.deleteMany({ userId });
      const result = await UserModel.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  const nextUsers = users.filter((u) => u.id !== userId);
  if (nextUsers.length === users.length) {
    return false;
  }
  await saveFallbackUsers(nextUsers);
  return true;
}
async function addUser(user) {
  const normalized = normalizeUser(user);
  if (await isDbReady()) {
    try {
      await UserModel.create({
        _id: normalized.id,
        username: normalized.username,
        password: normalized.password,
        email: normalized.email,
        role: normalized.role,
        google_id: normalized.google_id || null,
        apple_id: normalized.apple_id || null,
        first_name: normalized.first_name || null,
        last_name: normalized.last_name || null,
        avatar_url: normalized.avatar_url || null,
        github_id: normalized.github_id || null,
        permissions: normalized.permissions || []
      });
      return;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  users.push(normalized);
  await saveFallbackUsers(users);
}
async function getUserStorageDiagnostics() {
  const dbReachable = await isDbReady();
  const fallbackAllowed = isFallbackAuthStorageAllowed();
  if (dbReachable) {
    try {
      const usersCount = await UserModel.countDocuments();
      return { source: "mongoose", usersCount, dbReachable: true, fallbackAllowed };
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  if (!fallbackAllowed) {
    return { source: "database-required", usersCount: 0, dbReachable: false, fallbackAllowed: false };
  }
  const users = await loadFallbackUsers();
  return { source: "fallback", usersCount: users.length, dbReachable: false, fallbackAllowed: true };
}
async function findOrCreateOAuthUser(oauthInfo) {
  const { provider, providerId, email, picture } = oauthInfo;
  const { firstName, lastName } = getOAuthNameParts(oauthInfo);
  const providerField = getOAuthProviderField(provider);
  if (await isDbReady()) {
    try {
      const existingByProvider = await UserModel.findOne({ [providerField]: providerId }).lean();
      if (existingByProvider) {
        const rec = existingByProvider;
        const persistedAvatar2 = await resolvePersistedOAuthAvatar(oauthInfo, rec.avatar_url || void 0);
        const updates = {};
        if (!rec.first_name && firstName) updates.first_name = firstName;
        if (!rec.last_name && lastName) updates.last_name = lastName;
        if (shouldPersistAvatar(rec.avatar_url || void 0, persistedAvatar2)) updates.avatar_url = persistedAvatar2;
        const userRecord = Object.keys(updates).length > 0 ? await UserModel.findByIdAndUpdate(rec._id, updates, { new: true }).lean() : rec;
        await syncOAuthProfile(rec._id, oauthInfo, persistedAvatar2 || (userRecord == null ? void 0 : userRecord.avatar_url) || void 0);
        return toAppUser(userRecord);
      }
      const existingByEmail = await UserModel.findOne({ email }).lean();
      if (existingByEmail) {
        const rec = existingByEmail;
        const persistedAvatar2 = await resolvePersistedOAuthAvatar(oauthInfo, rec.avatar_url || void 0);
        const updates = { [providerField]: providerId };
        if (!rec.first_name && firstName) updates.first_name = firstName;
        if (!rec.last_name && lastName) updates.last_name = lastName;
        if (shouldPersistAvatar(rec.avatar_url || void 0, persistedAvatar2)) updates.avatar_url = persistedAvatar2;
        const updated = await UserModel.findByIdAndUpdate(rec._id, updates, { new: true }).lean();
        await syncOAuthProfile(updated._id, oauthInfo, persistedAvatar2 || updated.avatar_url || void 0);
        return toAppUser(updated);
      }
      const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo);
      const username2 = createOAuthUsername(email);
      const userId = createOAuthUserId(provider, providerId);
      const newUser2 = await UserModel.create({
        _id: userId,
        username: username2,
        email,
        password: "",
        role: "user",
        first_name: firstName || null,
        last_name: lastName || null,
        avatar_url: persistedAvatar || picture || null,
        [providerField]: providerId,
        permissions: getRolePermissions("user")
      });
      await syncOAuthProfile(userId, oauthInfo, persistedAvatar || picture);
      return toAppUser(newUser2.toObject());
    } catch (error) {
      console.error("[findOrCreateOAuthUser] MongoDB error:", error);
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  let user = users.find((u) => u[providerField] === providerId);
  if (user) {
    if (!user.first_name && firstName) user.first_name = firstName;
    if (!user.last_name && lastName) user.last_name = lastName;
    if (shouldPersistAvatar(user.avatar_url, picture)) user.avatar_url = picture;
    await saveFallbackUsers(users);
    return user;
  }
  user = users.find((u) => u.email === email);
  if (user) {
    user[providerField] = providerId;
    if (!user.first_name && firstName) user.first_name = firstName;
    if (!user.last_name && lastName) user.last_name = lastName;
    if (shouldPersistAvatar(user.avatar_url, picture)) user.avatar_url = picture;
    await saveFallbackUsers(users);
    return user;
  }
  const username = createOAuthUsername(email);
  const newUser = {
    id: createOAuthUserId(provider, providerId),
    username,
    email,
    password: "",
    role: "user",
    first_name: firstName,
    last_name: lastName,
    avatar_url: picture,
    [providerField]: providerId,
    permissions: getRolePermissions("user")
  };
  users.push(newUser);
  await saveFallbackUsers(users);
  return newUser;
}
async function updateUserRoleAndPermissions(userId, updates) {
  var _a;
  const payload = {};
  if (updates.role) {
    payload.role = updates.role;
    payload.permissions = resolveUserPermissions({
      role: updates.role,
      permissions: (_a = updates.permissions) != null ? _a : []
    });
  } else if (updates.permissions) {
    payload.permissions = updates.permissions;
  }
  if (await isDbReady()) {
    try {
      const result = await UserModel.findByIdAndUpdate(userId, { $set: payload }, { new: true }).lean();
      return result ? toAppUser(result) : null;
    } catch (error) {
      markDbUnavailable(error);
    }
  }
  const users = await loadFallbackUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  if (payload.role) user.role = payload.role;
  if (payload.permissions) user.permissions = payload.permissions;
  await saveFallbackUsers(users);
  return user;
}

export { updateUserRoleAndPermissions as a, findUserById as b, getUserStorageDiagnostics as c, deleteUserById as d, findUserByUsername as e, findOrCreateOAuthUser as f, getAllUsers as g, findUserByEmail as h, addUser as i, resolveUserPermissions as r, updateUserPassword as u };
//# sourceMappingURL=users.mjs.map
