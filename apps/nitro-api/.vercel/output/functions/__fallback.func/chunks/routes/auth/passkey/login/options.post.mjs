import { d as defineEventHandler, r as readBody } from '../../../../nitro/nitro.mjs';
import { b as requireSecrets } from '../../../../_/auth.mjs';
import { b as beginPasskeyAuthentication } from '../../../../_/passkeys.mjs';
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
  const body = await readBody(event) || {};
  const result = await beginPasskeyAuthentication(event, body.username);
  return {
    ok: true,
    ...result
  };
});

export { options_post as default };
//# sourceMappingURL=options.post.mjs.map
