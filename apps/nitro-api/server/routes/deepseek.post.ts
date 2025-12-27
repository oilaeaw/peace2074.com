import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'
import OpenAI from 'openai'

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

const DEFAULT_MODEL = 'deepseek-chat'
const DEFAULT_BASE_URL = 'https://api.deepseek.com'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    if (!config.deepseekApiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'DeepSeek API key missing. Set DEEPSEEK_API_KEY in the environment.',
        })
    }

    const client = new OpenAI({
        apiKey: config.deepseekApiKey,
        baseURL: config.deepseekBaseUrl || DEFAULT_BASE_URL,
    })

    const body = (await readBody<DeepSeekRequestBody>(event)) || {}

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body must include at least one message.',
        })
    }

    try {
        const completion = await client.chat.completions.create({
            model: body.model || DEFAULT_MODEL,
            messages: body.messages,
            temperature: body.temperature ?? 0.7,
            max_tokens: body.max_tokens,
        })

        const message = completion.choices?.[0]?.message

        return {
            id: completion.id,
            created: completion.created,
            model: completion.model,
            message,
            usage: completion.usage,
            raw: completion.choices,
        }
    } catch (error: any) {
        const statusCode = error?.status ?? 500
        const message = error?.message || 'DeepSeek request failed'
        console.error(`[DeepSeek] request failed with status ${statusCode}:`, message)

        setResponseStatus(event, statusCode)

        return {
            error: {
                message,
                status: statusCode,
                data: error?.error?.message,
            }
        }
    }
})
