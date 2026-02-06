import { h as setHeader } from '../nitro/nitro.mjs';

function applyCors(event) {
  const origin = event.node.req.headers.origin || "*";
  setHeader(event, "Access-Control-Allow-Origin", origin);
  setHeader(event, "Access-Control-Allow-Credentials", "true");
  setHeader(event, "Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin");
  setHeader(event, "Vary", "Origin");
}

export { applyCors as a };
//# sourceMappingURL=cors.mjs.map
