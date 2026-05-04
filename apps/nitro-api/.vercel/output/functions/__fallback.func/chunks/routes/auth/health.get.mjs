import { d as defineEventHandler, u as useRuntimeConfig } from '../../nitro/nitro.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { d as getOAuthAvailability } from '../../_/oauth.mjs';
import { c as getUserStorageDiagnostics } from '../../_/users.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'arctic';
import '../../_/User.mjs';
import '../../_/ReaderStats.mjs';
import '../../_/DeployLike.mjs';
import '../../_/BlogLike.mjs';
import '../../_/QuranProgress.mjs';
import '../../_/Tasbeeh.mjs';
import '../../_/profile.mjs';

const health_get = defineEventHandler(async (event) => {
  applyCors(event);
  const config = useRuntimeConfig();
  const oauth = getOAuthAvailability();
  const authSecret = config.authSecret || process.env.NITRO_AUTH_SECRET || process.env.AUTH_SECRET || "";
  const authPasscode = config.authPasscode || process.env.NITRO_AUTH_PASSCODE || process.env.AUTH_PASSCODE || "";
  const databaseUrl = process.env.DATABASE_URL || "";
  const users = await getUserStorageDiagnostics();
  return {
    ok: true,
    env: {
      hasAuthSecret: Boolean(authSecret),
      hasAuthPasscode: Boolean(authPasscode),
      hasDatabaseUrl: Boolean(databaseUrl)
    },
    oauth,
    users,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { health_get as default };
//# sourceMappingURL=health.get.mjs.map
