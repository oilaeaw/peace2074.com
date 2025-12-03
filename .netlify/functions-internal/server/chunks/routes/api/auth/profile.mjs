import { d as defineEventHandler, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { getServerSession } from '#auth';
import User from '@server/models/user';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '@server/utils/abilities';

const profile = defineEventHandler(async (event) => {
  if (event.node.req.method !== "PATCH") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed"
    });
  }
  const session = await getServerSession(event);
  if (!(session == null ? void 0 : session.user)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const userId = session.user.id;
  const U = User;
  const updatedUser = await U.findByIdAndUpdate(userId, {
    first_name: body.first_name,
    last_name: body.last_name
  }, { new: true }).lean();
  return { status: "ok", user: updatedUser };
});

export { profile as default };
//# sourceMappingURL=profile.mjs.map
