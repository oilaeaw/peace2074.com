#!/usr/bin/env node
/**
 * Backfill embeddings for all BlogPost documents that are missing them.
 * Run: node apps/nitro-api/scripts/backfill-blog-embeddings.mjs
 *
 * Requires DATABASE_URL and COHERE_API_KEY in .env
 */
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

const COHERE_EMBEDDING_MODEL = 'embed-english-v3.0'
const BATCH_SIZE = 10
const DELAY_MS = 200

const prisma = new PrismaClient()

async function generateEmbedding(text) {
  const response = await fetch('https://api.cohere.com/v2/embed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
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
    throw new Error(`Cohere error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.embeddings.float[0]
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

  const allPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      tags: true,
      embedding: true,
    },
  })
  const posts = allPosts.filter((p) => !p.embedding || p.embedding.length === 0)

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
