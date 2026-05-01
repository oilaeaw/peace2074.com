import { createError, defineEventHandler, getHeader, readBody, setResponseStatus } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'

type ChatMessage = {
    role: 'system' | 'user' | 'assistant'
    content: string
}

type KimiRequestBody = {
    messages?: ChatMessage[]
    model?: string
    temperature?: number
    max_tokens?: number
}

const DEFAULT_MODEL = '@cf/moonshotai/kimi-k2.6'
const MAX_TOKENS_CAP = 800
const RATE_LIMIT_MAX = 15       // requests per window per IP
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// In-memory rate limit store (best-effort; resets on cold start)
const ipHits = new Map<string, { count: number; windowStart: number }>()

function getClientIp(event: ReturnType<typeof defineEventHandler> extends (e: infer E) => any ? E : never): string {
    const forwarded = getHeader(event as any, 'x-forwarded-for') || ''
    return (forwarded.split(',')[0] || 'unknown').trim().toLowerCase()
}

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const entry = ipHits.get(ip)
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        ipHits.set(ip, { count: 1, windowStart: now })
        return false
    }
    entry.count++
    return entry.count > RATE_LIMIT_MAX
}

function getBlacklist(envVar: string): Set<string> {
    const raw = process.env[envVar] || ''
    return new Set(raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))
}

export default defineEventHandler(async (event) => {
    applyCors(event)

    const clientIp = getClientIp(event as any)

    // IP blacklist check
    const ipBlacklist = getBlacklist('KIMI_IP_BLACKLIST')
    if (ipBlacklist.has(clientIp)) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied.' })
    }

    // Session / user blacklist check
    const session = readSession(event as any)
    const userBlacklist = getBlacklist('KIMI_USER_BLACKLIST')
    if (session?.id && userBlacklist.has(session.id.toLowerCase())) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied.' })
    }

    // Authentication removed: AI is completely free for everyone to use.

    // Rate limit by IP
    if (isRateLimited(clientIp)) {
        throw createError({ statusCode: 429, statusMessage: `Too many requests. Limit is ${RATE_LIMIT_MAX} per hour.` })
    }
    const config = useRuntimeConfig()

    // API Key checks removed because Cloudflare Bindings do not require them!

    const body = (await readBody<KimiRequestBody>(event)) || {}

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body must include at least one message.',
        })
    }

    const SYSTEM_PROMPT: ChatMessage = {
        role: 'system',
        content: `You are Peace AI, a helpful assistant exclusively for the peace2074.com website and the Holy Quran.

You ONLY answer questions about:
- The Holy Quran: verses, surahs, tafsir, meanings, translations, recitation, and related Islamic knowledge
- The peace2074.com website: its features, how to use it, navigation, Quran reading/listening tools, bookmarks, account, settings, and blog posts

If the user asks about anything outside these two topics (homework, coding, general knowledge, politics, entertainment, other religions, etc.), politely decline and redirect them:
"I'm Peace AI, focused only on the Holy Quran and the peace2074.com website. I'm not able to help with that, but I'm happy to assist you explore the Quran or the site's features."

Always be respectful, concise, and spiritually thoughtful.`,
    }

    // Strip any system messages from the client to prevent prompt injection, then prepend ours
    const userMessages = body.messages!.filter(m => m.role !== 'system');
    const finalModel = body.model || DEFAULT_MODEL;

    const aiBinding = (event.context as any)?.cloudflare?.env?.AI;

    try {
        let aiResponse;
        
        // 1. Prioritize native Cloudflare AI Binding if available (Cloudflare Pages/Workers)
        if (aiBinding) {
            const response = await aiBinding.run(finalModel, {
                messages: [SYSTEM_PROMPT, ...userMessages],
                temperature: body.temperature ?? 0.7,
                max_tokens: Math.min(body.max_tokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP)
            });
            aiResponse = response?.response || response || '';
        } 
        // 2. Fallback to Cloudflare AI REST API if on Netlify or nitro dev
        else {
            const apiKey = config.kimiApiKey;
            const baseUrl = config.kimiBaseUrl || 'https://api.moonshot.cn/v1';

            if (!apiKey) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Cloudflare AI binding not found, AND KIMI_API_KEY is not configured in the environment for fallback.',
                });
            }

            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: finalModel,
                    messages: [SYSTEM_PROMPT, ...userMessages],
                    temperature: body.temperature ?? 0.7,
                    max_tokens: Math.min(body.max_tokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP)
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AI request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json() as any;
            aiResponse = data?.choices?.[0]?.message?.content || data?.response || '';
        }

        return {
            id: 'kimi-ai-' + Date.now(),
            model: finalModel,
            message: {
                role: 'assistant',
                content: aiResponse
            },
            raw: aiResponse
        }
    } catch (error: any) {
        const statusCode = error?.status ?? 500
        const message = error?.message || 'AI request failed'
        console.error(`[AI] request failed with status ${statusCode}:`, message)

        setResponseStatus(event, statusCode)

        return {
            error: {
                message,
                status: statusCode,
                data: message,
            }
        }
    }
})
