import { d as defineEventHandler } from '../../../../nitro/nitro.mjs';
import { b as requireSecrets, r as requireAuth } from '../../../../_/auth.mjs';
import { c as beginPasskeyRegistration } from '../../../../_/passkeys.mjs';
import { a as applyCors } from '../../../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '@simplewebauthn/server';
import '../../../../_/profile.mjs';
import '../../../../_/users.mjs';
import '../../../../_/User.mjs';
import '../../../../_/ReaderStats.mjs';
import '../../../../_/DeployLike.mjs';
import '../../../../_/BlogLike.mjs';
import '../../../../_/QuranProgress.mjs';
import '../../../../_/Tasbeeh.mjs';

const options_post = defineEventHandler(async (event) => {
  applyCors(event);
  requireSecrets({ needPasscode: false });
  const session = requireAuth(event);
  const result = await beginPasskeyRegistration(event, session.id);
  return {
    ok: true,
    ...result
  };
});

export { options_post as default };
//# sourceMappingURL=options.post.mjs.map
