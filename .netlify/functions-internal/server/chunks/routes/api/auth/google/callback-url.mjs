import { d as defineEventHandler, g as getHeader, u as useRuntimeConfig } from '../../../../nitro/nitro.mjs';
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

const callbackUrl = defineEventHandler((event) => {
  const host = getHeader(event, "x-forwarded-host") || getHeader(event, "host");
  const proto = getHeader(event, "x-forwarded-proto") || (useRuntimeConfig().nodeEnv === "production" ? "https" : "http");
  const callbackURL = `${proto}://${host}/api/auth/google/callback`;
  return { callbackURL };
});

export { callbackUrl as default };
//# sourceMappingURL=callback-url.mjs.map
