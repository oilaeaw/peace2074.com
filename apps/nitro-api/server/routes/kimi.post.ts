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

    try {
        let aiResponse = '';
        
        // Proxy the request to the deployed Cloudflare Agent Worker
        const workerUrl = 'https://aged-limit-06d9.wahbehw.workers.dev/agents/chat';
        
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [SYSTEM_PROMPT, ...userMessages],
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Agent worker failed with status ${response.status}: ${errorText}`);
        }

        // Parse the Vercel AI SDK Data Stream protocol and accumulate it into a single string
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        if (reader) {
            let buffer = '';
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n');
                    buffer = parts.pop() || ''; 
                    
                    for (const line of parts) {
                        if (line.startsWith('0:')) {
                            try {
                                const textContent = JSON.parse(line.slice(2));
                                aiResponse += textContent;
                            } catch (e) {
                                // Ignore partial chunks
                            }
                        }
                    }
                }
            }
            // Flush remaining buffer
            if (buffer.startsWith('0:')) {
                try {
                    aiResponse += JSON.parse(buffer.slice(2));
                } catch (e) {}
            }
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
