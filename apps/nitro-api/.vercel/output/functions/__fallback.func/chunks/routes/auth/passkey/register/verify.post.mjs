import { d as defineEventHandler, r as readBody, c as createError } from '../../../../nitro/nitro.mjs';
import { b as requireSecrets, r as requireAuth } from '../../../../_/auth.mjs';
import { a as applyCors } from '../../../../_/cors.mjs';
import { e as finishPasskeyRegistration } from '../../../../_/passkeys.mjs';
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
  const session = requireAuth(event);
  const body = await readBody(event) || {};
  const requestId = String(body.requestId || "").trim();
  if (!requestId || !body.registrationResponse) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey registration request is incomplete"
    });
  }
  const passkey = await finishPasskeyRegistration(
    session.id,
    requestId,
    body.registrationResponse
  );
  return {
    ok: true,
    passkey: {
      id: passkey.id,
      createdAt: passkey.createdAt
    }
  };
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map
