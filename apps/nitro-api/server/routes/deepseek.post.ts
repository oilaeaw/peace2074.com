import { createError, defineEventHandler, getHeader, readBody, setResponseStatus } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'

type ChatMessage = {
    role: 'system' | 'user' | 'assistant'
    content: string
}

type DeepSeekRequestBody = {
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
    const ipBlacklist = getBlacklist('DEEPSEEK_IP_BLACKLIST')
    if (ipBlacklist.has(clientIp)) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied.' })
    }

    // Session / user blacklist check
    const session = readSession(event as any)
    const userBlacklist = getBlacklist('DEEPSEEK_USER_BLACKLIST')
    if (session?.id && userBlacklist.has(session.id.toLowerCase())) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied.' })
    }

    // Authentication removed: AI is completely free for everyone to use.

    // Rate limit by IP
    if (isRateLimited(clientIp)) {
        throw createError({ statusCode: 429, statusMessage: `Too many requests. Limit is ${RATE_LIMIT_MAX} per hour.` })
    }
    const config = useRuntimeConfig()

    const apiKey = (config as any).deepseekApiKey
        || (config as any).deepSeekApi
        || process.env.DEEPSEEK_API_KEY
        || process.env.NITRO_DEEPSEEK_API_KEY
        || process.env.deepSeekApi

    if (!apiKey || String(apiKey).trim() === '') {
        throw createError({
            statusCode: 500,
            statusMessage: 'Cloudflare AI API key missing. Set DEEPSEEK_API_KEY in the environment.',
        })
    }

    const body = (await readBody<DeepSeekRequestBody>(event)) || {}

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
    const userMessages = body.messages!.filter(m => m.role !== 'system')
    const finalModel = body.model || DEFAULT_MODEL
    
    // Cloudflare Workers AI raw REST API endpoint
    const url = `https://api.cloudflare.com/client/v4/accounts/f8e411adbc0ac8c96ac4e00beaacd9cd/ai/run/${finalModel}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${String(apiKey).trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [SYSTEM_PROMPT, ...userMessages],
                temperature: body.temperature ?? 0.7,
                max_tokens: Math.min(body.max_tokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP),
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        
        // Cloudflare returns the text in data.result.response
        // We wrap it in a structure the frontend expects
        return {
            id: 'cloudflare-ai-' + Date.now(),
            model: finalModel,
            message: {
                role: 'assistant',
                content: data.result?.response || ''
            },
            raw: data
        }
    } catch (error: any) {
        const statusCode = error?.status ?? 500
        const message = error?.message || 'Cloudflare AI request failed'
        console.error(`[Cloudflare AI] request failed with status ${statusCode}:`, message)

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
