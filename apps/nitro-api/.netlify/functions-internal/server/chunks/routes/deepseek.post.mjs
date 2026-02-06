import { d as defineEventHandler, c as createError, r as readBody, f as setResponseStatus, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import OpenAI from 'openai';
import { a as applyCors } from '../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const DEFAULT_MODEL = "deepseek-chat";
const deepseek_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  applyCors(event);
  const config = useRuntimeConfig();
  const apiKey = config.deepseekApiKey || config.deepSeekApi || process.env.DEEPSEEK_API_KEY || process.env.NITRO_DEEPSEEK_API_KEY || process.env.deepSeekApi;
  if (!apiKey || String(apiKey).trim() === "") {
    throw createError({
      statusCode: 500,
      statusMessage: "DeepSeek API key missing. Set DEEPSEEK_API_KEY (or NITRO_DEEPSEEK_API_KEY) in the environment."
    });
  }
  const baseURL = config.deepseekBaseUrl || config.deepSeekBaseUrl || process.env.DEEPSEEK_BASE_URL || process.env.NITRO_DEEPSEEK_BASE_URL || process.env.deepSeekBaseUrl;
  if (!baseURL) {
    throw createError({
      statusCode: 500,
      message: "DEEPSEEK_BASE_URL environment variable is required"
    });
  }
  const client = new OpenAI({
    apiKey: String(apiKey).trim(),
    baseURL: String(baseURL).trim()
  });
  const body = await readBody(event) || {};
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Request body must include at least one message."
    });
  }
  try {
    const completion = await client.chat.completions.create({
      model: body.model || DEFAULT_MODEL,
      messages: body.messages,
      temperature: (_a = body.temperature) != null ? _a : 0.7,
      max_tokens: body.max_tokens
    });
    const message = (_c = (_b = completion.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message;
    return {
      id: completion.id,
      created: completion.created,
      model: completion.model,
      message,
      usage: completion.usage,
      raw: completion.choices
    };
  } catch (error) {
    const statusCode = (_d = error == null ? void 0 : error.status) != null ? _d : 500;
    const message = (error == null ? void 0 : error.message) || "DeepSeek request failed";
    console.error(`[DeepSeek] request failed with status ${statusCode}:`, message);
    setResponseStatus(event, statusCode);
    return {
      error: {
        message,
        status: statusCode,
        data: (_e = error == null ? void 0 : error.error) == null ? void 0 : _e.message
      }
    };
  }
});

export { deepseek_post as default };
//# sourceMappingURL=deepseek.post.mjs.map
