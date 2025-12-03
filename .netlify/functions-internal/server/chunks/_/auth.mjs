import { getServerSession } from '#auth';

async function getUserFromEvent(event) {
  var _a;
  const session = await getServerSession(event);
  return (_a = session == null ? void 0 : session.user) != null ? _a : null;
}

export { getUserFromEvent };
//# sourceMappingURL=auth.mjs.map
