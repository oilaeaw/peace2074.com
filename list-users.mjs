import { PrismaClient } from "./apps/nitro-api/node_modules/@prisma/client/index.js";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./apps/nitro-api/prisma/dev.db",
    },
  },
});

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("\n=== Users in Database ===");
    console.log(JSON.stringify(users, null, 2));
    console.log(`\nTotal: ${users.length} users`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
