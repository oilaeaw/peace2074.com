#!/usr/bin/env node
/**
 * Backfill embeddings for all BlogPost documents that are missing them.
 * Run: node apps/nitro-api/scripts/backfill-blog-embeddings.mjs
 *
 * Requires DATABASE_URL and OPENAI_API_KEY in .env
 */
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
const OPENAI_EMBEDDING_DIMS = 1536
const BATCH_SIZE = 10
const DELAY_MS = 200

const prisma = new PrismaClient()

async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
      dimensions: OPENAI_EMBEDDING_DIMS,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

function toEmbeddingText(post) {
  return [
    post.title,
    post.excerpt ?? '',
    post.tags.join(' '),
    post.content.slice(0, 2000),
  ]
    .filter(Boolean)
    .join('\n')
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('Fetching blog posts without embeddings...')

  const posts = await prisma.blogPost.findMany({
    where: { embedding: { isEmpty: true } },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      tags: true,
    },
  })

  console.log(`Found ${posts.length} posts to backfill.`)
  if (posts.length === 0) {
    console.log('Nothing to do.')
    return
  }

  let done = 0
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (post) => {
        try {
          const embedding = await generateEmbedding(toEmbeddingText(post))
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { embedding },
          })
          done++
          console.log(`[${done}/${posts.length}] Embedded: ${post.slug}`)
        } catch (err) {
          console.error(`Failed: ${post.slug} — ${err.message}`)
        }
      })
    )
    if (i + BATCH_SIZE < posts.length) await sleep(DELAY_MS)
  }

  console.log(`\nDone. ${done}/${posts.length} posts embedded.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
