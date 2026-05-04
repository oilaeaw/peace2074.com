import { d as defineEventHandler, c as createError, r as readBody, x as setResponseStatus, u as useRuntimeConfig, m as getHeader } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import { a as readSession } from '../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const DEFAULT_MODEL = "@cf/moonshotai/kimi-k2.6";
const MAX_TOKENS_CAP = 800;
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1e3;
const ipHits = /* @__PURE__ */ new Map();
function getClientIp(event) {
  const forwarded = getHeader(event, "x-forwarded-for") || "";
  return (forwarded.split(",")[0] || "unknown").trim().toLowerCase();
}
function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}
function getBlacklist(envVar) {
  const raw = process.env[envVar] || "";
  return new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
}
function normalizeEnvValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function isPlaceholderValue(value) {
  if (!value) {
    return true;
  }
  return [
    /^\$\{[A-Z0-9_]+\}$/i,
    /^<[^>]+>$/,
    /paste[_\s-]*your/i,
    /change[_\s-]*me/i,
    /your[_\s-]*(api[_\s-]*)?(key|token)/i,
    /example/i
  ].some((pattern) => pattern.test(value));
}
function firstUsableValue(...values) {
  for (const value of values) {
    const normalized = normalizeEnvValue(value);
    if (normalized && !isPlaceholderValue(normalized)) {
      return normalized;
    }
  }
  return "";
}
function isCloudflareAiUrl(baseUrl) {
  return /api\.cloudflare\.com/i.test(baseUrl) || /\/ai\/v1(?:\/|$)/i.test(baseUrl);
}
function getLastUserPrompt(messages) {
  var _a;
  const lastUserMessage = [...messages].reverse().find((message) => {
    var _a2;
    return message.role === "user" && ((_a2 = message.content) == null ? void 0 : _a2.trim());
  });
  return ((_a = lastUserMessage == null ? void 0 : lastUserMessage.content) == null ? void 0 : _a.trim()) || "";
}
function isSupportedTopic(prompt) {
  return /\b(quran|surah|sura|ayah|verse|tafsir|translation|recit|allah|islam|peace2074|website|site|app|bookmark|holy names|tasbeeh|dhikr|blog|account|settings|reader|chapter|juz)\b/i.test(prompt);
}
function buildFallbackResponse(messages) {
  const prompt = getLastUserPrompt(messages);
  if (!prompt) {
    return "Peace be with you \u2014 I can help you explore the Quran and the features of PEACE2074.";
  }
  if (!isSupportedTopic(prompt)) {
    return `I'm Peace AI, focused only on the Holy Quran and the peace2074.com website. I'm not able to help with that, but I'm happy to assist you explore the Quran or the site's features.`;
  }
  if (/\b(hello|hi|salam|assalam)\b/i.test(prompt)) {
    return "Peace be with you \u2014 the Quran guides hearts with mercy, and I can help you explore it on PEACE2074.";
  }
  if (/maryam/i.test(prompt)) {
    return "Surah Maryam highlights Allah\u2019s mercy, trust, and patience; you can read it in the Quran section and jump directly to its verses on PEACE2074.";
  }
  if (/\b(peace2074|website|site|app|feature|bookmark|holy names|tasbeeh|reader|listen|recit|blog|account|settings)\b/i.test(prompt)) {
    return "On PEACE2074 you can read surahs, explore verses, listen to recitation, save bookmarks, and use tools like Holy Names and Tasbeeh.";
  }
  if (/\b(surah|sura|ayah|verse|quran|tafsir|translation|juz)\b/i.test(prompt)) {
    return "The Quran teaches mercy, patience, and remembrance of Allah; share a surah or verse and I can help you explore it.";
  }
  return "I can help with Quran reading, recitation, bookmarks, Holy Names, Tasbeeh, and navigating the PEACE2074 website.";
}
function createAiSuccess(content, model, provider) {
  return {
    id: "kimi-ai-" + Date.now(),
    model,
    provider,
    message: {
      role: "assistant",
      content
    },
    raw: content
  };
}
function shouldUseFallbackResponse(message) {
  return /\b(401|403|authentication|unauthorized|invalid api key|missing api key|fetch failed|network|econnrefused|enotfound|timed out)\b/i.test(message);
}
const kimi_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  applyCors(event);
  const clientIp = getClientIp(event);
  const ipBlacklist = getBlacklist("KIMI_IP_BLACKLIST");
  if (ipBlacklist.has(clientIp)) {
    throw createError({ statusCode: 403, statusMessage: "Access denied." });
  }
  const session = readSession(event);
  const userBlacklist = getBlacklist("KIMI_USER_BLACKLIST");
  if ((session == null ? void 0 : session.id) && userBlacklist.has(session.id.toLowerCase())) {
    throw createError({ statusCode: 403, statusMessage: "Access denied." });
  }
  if (isRateLimited(clientIp)) {
    throw createError({ statusCode: 429, statusMessage: `Too many requests. Limit is ${RATE_LIMIT_MAX} per hour.` });
  }
  const config = useRuntimeConfig();
  const body = await readBody(event) || {};
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Request body must include at least one message."
    });
  }
  const SYSTEM_PROMPT = {
    role: "system",
    content: `You are Peace AI, a helpful assistant exclusively for the peace2074.com website and the Holy Quran.

You ONLY answer questions about:
- The Holy Quran: verses, surahs, tafsir, meanings, translations, recitation, and related Islamic knowledge
- The peace2074.com website: its features, how to use it, navigation, Quran reading/listening tools, bookmarks, account, settings, and blog posts

If the user asks about anything outside these two topics (homework, coding, general knowledge, politics, entertainment, other religions, etc.), politely decline and redirect them:
"I'm Peace AI, focused only on the Holy Quran and the peace2074.com website. I'm not able to help with that, but I'm happy to assist you explore the Quran or the site's features."

Always be respectful, concise, and spiritually thoughtful.`
  };
  const userMessages = body.messages.filter((m) => m.role !== "system");
  const finalModel = body.model || DEFAULT_MODEL;
  const aiBinding = (_c = (_b = (_a = event.context) == null ? void 0 : _a.cloudflare) == null ? void 0 : _b.env) == null ? void 0 : _c.AI;
  try {
    let aiResponse;
    if (aiBinding) {
      const response = await aiBinding.run(finalModel, {
        messages: [SYSTEM_PROMPT, ...userMessages],
        temperature: (_d = body.temperature) != null ? _d : 0.7,
        max_tokens: Math.min((_e = body.max_tokens) != null ? _e : MAX_TOKENS_CAP, MAX_TOKENS_CAP)
      });
      aiResponse = (response == null ? void 0 : response.response) || response || "";
    } else {
      const baseUrl = firstUsableValue(
        process.env.NITRO_KIMI_BASE_URL,
        config.kimiBaseUrl,
        process.env.KIMI_BASE_URL
      ) || "https://api.moonshot.cn/v1";
      const apiKey = isCloudflareAiUrl(baseUrl) ? firstUsableValue(
        process.env.CLOUDFLARE_API_TOKEN,
        process.env.NITRO_KIMI_API_KEY,
        config.kimiApiKey,
        process.env.KIMI_API_KEY
      ) : firstUsableValue(
        process.env.NITRO_KIMI_API_KEY,
        config.kimiApiKey,
        process.env.KIMI_API_KEY,
        process.env.CLOUDFLARE_API_TOKEN
      );
      if (!apiKey) {
        console.warn("[AI] No usable provider credentials found; using local fallback response.");
        return createAiSuccess(buildFallbackResponse(userMessages), finalModel, "local-fallback");
      }
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: finalModel,
          messages: [SYSTEM_PROMPT, ...userMessages],
          temperature: (_f = body.temperature) != null ? _f : 0.7,
          max_tokens: Math.min((_g = body.max_tokens) != null ? _g : MAX_TOKENS_CAP, MAX_TOKENS_CAP)
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      aiResponse = ((_j = (_i = (_h = data == null ? void 0 : data.choices) == null ? void 0 : _h[0]) == null ? void 0 : _i.message) == null ? void 0 : _j.content) || (data == null ? void 0 : data.response) || "";
      if (!aiResponse) {
        console.warn("[AI] Provider returned an empty response; using local fallback response.");
        return createAiSuccess(buildFallbackResponse(userMessages), finalModel, "local-fallback");
      }
    }
    return createAiSuccess(typeof aiResponse === "string" ? aiResponse : JSON.stringify(aiResponse), finalModel, aiBinding ? "cloudflare-binding" : "remote-provider");
  } catch (error) {
    const statusCode = (_k = error == null ? void 0 : error.status) != null ? _k : 500;
    const message = (error == null ? void 0 : error.message) || "AI request failed";
    console.error(`[AI] request failed with status ${statusCode}:`, message);
    if (shouldUseFallbackResponse(message)) {
      console.warn("[AI] Upstream provider failed; using local fallback response instead.");
      return createAiSuccess(buildFallbackResponse(userMessages), finalModel, "local-fallback");
    }
    setResponseStatus(event, statusCode);
    return {
      error: {
        message,
        status: statusCode,
        data: message
      }
    };
  }
});

export { kimi_post as default };
//# sourceMappingURL=kimi.post.mjs.map
