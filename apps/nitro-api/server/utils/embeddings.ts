const COHERE_EMBEDDING_MODEL = 'embed-english-v3.0'

export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.COHERE_API_KEY
    if (!apiKey) throw new Error('COHERE_API_KEY is not set')

    const response = await fetch('https://api.cohere.com/v2/embed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: COHERE_EMBEDDING_MODEL,
            texts: [text],
            input_type: 'search_document',
            embedding_types: ['float'],
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Cohere embeddings error: ${response.status} ${err}`)
    }

    const data = (await response.json()) as { embeddings: { float: number[][] } }
    return data.embeddings.float[0]
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
