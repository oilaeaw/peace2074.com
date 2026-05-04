import { d as defineEventHandler, r as readBody, c as createError } from '../../../../nitro/nitro.mjs';
import { b as requireSecrets, c as createSession } from '../../../../_/auth.mjs';
import { a as applyCors } from '../../../../_/cors.mjs';
import { f as finishPasskeyAuthentication, a as buildAuthenticatedUser } from '../../../../_/passkeys.mjs';
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

const verify_post = defineEventHandler(async (event) => {
  applyCors(event);
  requireSecrets({ needPasscode: false });
  const body = await readBody(event) || {};
  const requestId = String(body.requestId || "").trim();
  if (!requestId || !body.authenticationResponse) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey login request is incomplete"
    });
  }
  const user = await finishPasskeyAuthentication(
    requestId,
    body.authenticationResponse
  );
  const payload = await buildAuthenticatedUser(user);
  createSession(event, payload.sessionUser, "passkey");
  return {
    ok: true,
    user: payload.user
  };
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map
