#!/usr/bin/env node

/**
 * Sync blog posts from blog-seed.json to MongoDB via Prisma
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read seed data
    const seedPath = join(__dirname, "../server/data/blog-seed.json");
    const seedData = JSON.parse(readFileSync(seedPath, "utf-8"));

    console.log(
      `[sync-blogs] Found ${seedData.length} blog post(s) in seed file`,
    );

    let synced = 0;

    for (const post of seedData) {
      // Check if post already exists by slug
      const existing = await prisma.blogPost.findUnique({
        where: { slug: post.slug },
      });

      const postData = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        tags: post.tags || [],
        date: post.date,
        author: post.author,
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      };

      if (existing) {
        // Update existing post
        await prisma.blogPost.update({
          where: { slug: post.slug },
          data: postData,
        });
        console.log(`[sync-blogs] ✓ Updated: ${post.title}`);
      } else {
        // Create new post
        await prisma.blogPost.create({
          data: postData,
        });
        console.log(`[sync-blogs] ✓ Created: ${post.title}`);
      }
      synced++;
    }

    const total = await prisma.blogPost.count();
    console.log(
      `[sync-blogs] Synced ${synced} blog post(s). DB now has ${total} blog post(s).`,
    );
  } catch (error) {
    console.error("[sync-blogs] Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
