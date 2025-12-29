import { defineEventHandler, setHeader } from "h3";

// Global OPTIONS responder to satisfy CORS preflight, even if a route
// does not define its own .options handler.
export default defineEventHandler((event) => {
  if (event.node.req.method !== "OPTIONS") return;

  const origin = event.node.req.headers.origin || "*";
  setHeader(event, "Access-Control-Allow-Origin", origin);
  setHeader(event, "Access-Control-Allow-Credentials", "true");
  setHeader(event, "Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin");
  setHeader(event, "Vary", "Origin");

  event.node.res.statusCode = 204;
  event.node.res.end();
});