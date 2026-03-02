// Test User table access directly
import { getPrisma } from "./apps/nitro-api/server/utils/prisma.ts";

async function main() {
  try {
    console.log("Loading Prisma...");
    const prisma = await getPrisma();

    if (!prisma) {
      console.error("❌ getPrisma() returned null");
      process.exit(1);
    }

    console.log("✅ Prisma loaded");

    console.log("\nTesting User.count()...");
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);

    console.log("\nTesting BlogPost.count()...");
    const postCount = await prisma.blogPost.count();
    console.log(`✅ Blog post count: ${postCount}`);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main();
