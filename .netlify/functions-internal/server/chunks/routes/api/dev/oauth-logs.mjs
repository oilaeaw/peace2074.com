import { d as defineEventHandler, u as useRuntimeConfig, e as setResponseStatus } from '../../../nitro/nitro.mjs';
import { ensureDbConnection } from '@server/utils/database';
import OAuthLog from '@server/models/oauth-log';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const oauthLogs = defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig();
  if (cfg.nodeEnv === "production") {
    setResponseStatus(event, 403);
    return { error: "Forbidden in production" };
  }
  await ensureDbConnection();
  const OLog = OAuthLog;
  const logs = await OLog.find({}).sort({ createdAt: -1 }).limit(20).lean();
  return { logs };
});

export { oauthLogs as default };
//# sourceMappingURL=oauth-logs.mjs.map
