// Direct Prisma connection test
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  try {
    console.log("Testing Prisma connection...");
    const userCount = await prisma.user.count();
    console.log(`✅ Prisma works! Found ${userCount} users`);

    const posts = await prisma.blogPost.findMany();
    console.log(`✅ Found ${posts.length} blog posts`);
  } catch (error) {
    console.error("❌ Prisma failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
