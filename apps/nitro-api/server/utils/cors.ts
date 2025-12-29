import { H3Event, setHeader } from "h3";

export function applyCors(event: H3Event) {
  const origin = event.node.req.headers.origin || "*";
  setHeader(event, "Access-Control-Allow-Origin", origin);
  setHeader(event, "Access-Control-Allow-Credentials", "true");
  setHeader(event, "Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin");
  setHeader(event, "Vary", "Origin");
}