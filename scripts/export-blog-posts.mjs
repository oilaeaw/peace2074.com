#!/usr/bin/env node

/**
 * Export blog posts from local API to JSON file
 * Usage: node scripts/export-blog-posts.mjs
 */

const response = await fetch('http://localhost:3000/blog')
const data = await response.json()

if (data.ok && data.posts) {
  const json = JSON.stringify(data.posts, null, 2)
  const fs = await import('fs/promises')
  await fs.writeFile('blog-posts-export.json', json, 'utf-8')
  console.log(
    `✓ Exported ${data.posts.length} blog posts to blog-posts-export.json`
  )
  console.log('\nNext steps:')
  console.log('1. Log in to your production site: https://peace2074.com')
  console.log('2. Visit /blog-editor')
  console.log('3. Create each post using the data from blog-posts-export.json')
} else {
  console.error('✗ Failed to fetch blog posts:', data.error)
  process.exit(1)
}
