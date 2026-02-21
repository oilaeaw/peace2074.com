import { defineEventHandler, setHeader } from "h3";

// Simple permissive CORS for API routes (DeepSeek, search, etc.)
export default defineEventHandler((event) => {
    const allowedOrigins = [
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://peace2074.com",
        "https://www.peace2074.com",
        "https://waelio.com",
        "https://www.waelio.com",
    ];

    const origin = event.node.req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        setHeader(event, "Access-Control-Allow-Origin", origin);
        setHeader(event, "Access-Control-Allow-Credentials", "true");
    } else {
        // Fallback for unknown origins (no credentials in this mode)
        setHeader(event, "Access-Control-Allow-Origin", "*");
    }

    setHeader(event, "Vary", "Origin");
    setHeader(event, "Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    setHeader(
        event,
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,Accept,Origin"
    );

    if (event.node.req.method === "OPTIONS") {
        event.node.res.statusCode = 204; // No Content
        event.node.res.end();
    }
});
