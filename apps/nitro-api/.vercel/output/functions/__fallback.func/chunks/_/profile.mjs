import { q as isDatabaseRequired, p as createDatabaseRequiredError, g as getMongoose } from '../nitro/nitro.mjs';
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const ProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    avatar_url: { type: String, default: null },
    github_id: { type: String, default: null },
    bookmarks: { type: Schema.Types.Mixed, default: [] },
    settings: { type: Schema.Types.Mixed, default: {} },
    tasbeeh_summary: { type: Schema.Types.Mixed, default: { total: 0, sessions: 0 } }
  },
  { timestamps: true, collection: "Profile" }
);
const ProfileModel = models.Profile || model("Profile", ProfileSchema);

async function isDbReady() {
  try {
    await getMongoose();
    return true;
  } catch {
    if (isDatabaseRequired()) throw createDatabaseRequiredError();
    return false;
  }
}
async function getProfile(userId) {
  if (await isDbReady()) {
    try {
      const profile = await ProfileModel.findOne({ userId }).lean();
      return profile;
    } catch (e) {
      console.error("Failed to get profile:", e);
      if (isDatabaseRequired()) throw createDatabaseRequiredError(e);
    }
  }
  return null;
}
async function createProfile(profile) {
  if (await isDbReady()) {
    try {
      const created = await ProfileModel.create({
        userId: profile.userId,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        github_id: profile.github_id,
        bookmarks: profile.bookmarks || [],
        settings: profile.settings || {},
        tasbeeh_summary: profile.tasbeeh_summary || { total: 0, sessions: 0 }
      });
      return created.toObject();
    } catch (e) {
      console.error("Failed to create profile:", e);
      if (isDatabaseRequired()) throw createDatabaseRequiredError(e);
    }
  }
  return null;
}
async function updateProfile(userId, updates) {
  if (await isDbReady()) {
    try {
      const updated = await ProfileModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      ).lean();
      return updated;
    } catch (e) {
      console.error("Failed to update profile:", e);
      if (isDatabaseRequired()) throw createDatabaseRequiredError(e);
    }
  }
  return null;
}
async function getBookmarks(userId) {
  const profile = await getProfile(userId);
  return (profile == null ? void 0 : profile.bookmarks) || [];
}
async function addBookmark(userId, bookmark) {
  const profile = await getProfile(userId);
  if (!profile) return null;
  const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : [];
  const existing = bookmarks.find((b) => b.bookmark === bookmark);
  if (existing) return existing;
  const newBookmark = {
    _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bookmark,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  bookmarks.push(newBookmark);
  await updateProfile(userId, { bookmarks });
  return newBookmark;
}
async function removeBookmark(userId, bookmarkId) {
  const profile = await getProfile(userId);
  if (!profile) return false;
  const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : [];
  const filtered = bookmarks.filter((b) => b._id !== bookmarkId);
  if (filtered.length === bookmarks.length) return false;
  await updateProfile(userId, { bookmarks: filtered });
  return true;
}
async function updateTasbeehSummary(userId, increment, sessionComplete = false) {
  const profile = await getProfile(userId);
  if (!profile) return;
  const summary = profile.tasbeeh_summary || { total: 0, sessions: 0 };
  summary.total += increment;
  if (sessionComplete) {
    summary.sessions += 1;
  }
  await updateProfile(userId, { tasbeeh_summary: summary });
}

export { ProfileModel as P, getBookmarks as a, addBookmark as b, createProfile as c, updateTasbeehSummary as d, getProfile as g, removeBookmark as r, updateProfile as u };
//# sourceMappingURL=profile.mjs.map
