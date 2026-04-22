const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
const OPENAI_EMBEDDING_DIMS = 1536

export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: OPENAI_EMBEDDING_MODEL,
            input: text,
            dimensions: OPENAI_EMBEDDING_DIMS,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenAI embeddings error: ${response.status} ${err}`)
    }

    const data = (await response.json()) as { data: { embedding: number[] }[] }
    return data.data[0].embedding
}

export function blogPostEmbeddingText(post: {
    title: string
    excerpt?: string | null
    content: string
    tags: string[]
}): string {
    return [post.title, post.excerpt ?? '', post.tags.join(' '), post.content.slice(0, 2000)]
        .filter(Boolean)
        .join('\n')
}
