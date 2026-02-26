#!/usr/bin/env node
/**
 * Test database connection and show diagnostic information
 * Usage: node scripts/test-db-connection.mjs
 */

import "dotenv/config";

console.log("🔍 Testing Database Connection...\n");

// Check environment variables
console.log("📋 Environment Check:");
console.log(
  `   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`,
);
console.log(`   Length: ${process.env.DATABASE_URL?.length || 0} characters`);

if (process.env.DATABASE_URL) {
  // Mask password in connection string for display
  const masked = process.env.DATABASE_URL.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    "mongodb+srv://$1:***@",
  );
  console.log(`   Masked: ${masked.substring(0, 80)}...`);
}

console.log("");

// Try to connect with Prisma
try {
  console.log("🔌 Attempting Prisma connection...");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  console.log("   ✅ PrismaClient initialized");

  // Test connection
  await prisma.$connect();
  console.log("   ✅ Connected to database!");

  // Get user count
  const userCount = await prisma.user.count();
  console.log(`   📊 Found ${userCount} user(s) in database`);

  // List usernames (not passwords!)
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("\n   👥 Users:");
  users.forEach((user) => {
    console.log(`      • ${user.username} (${user.role}) - ${user.email}`);
  });

  // Disconnect
  await prisma.$disconnect();
  console.log("\n✨ Database connection test successful!");
  console.log("\n💡 Your database is properly configured.");
  console.log("   If signups are still failing, check:");
  console.log("   1. MongoDB Atlas Network Access (allow 0.0.0.0/0)");
  console.log("   2. Netlify environment variables are set");
  console.log("   3. Recent deployment after setting env vars");
} catch (error) {
  console.error("\n❌ Database connection failed!");
  console.error(`   Error: ${error.message}`);

  if (error.message.includes("Environment variable not found")) {
    console.error("\n💡 Solution:");
    console.error("   DATABASE_URL is not set. Check your .env file.");
    console.error("   Make sure you are running from the project root.");
  } else if (error.message.includes("Authentication failed")) {
    console.error("\n💡 Solution:");
    console.error("   MongoDB authentication failed. Check:");
    console.error("   1. Username and password are correct");
    console.error("   2. Database user has proper permissions");
    console.error("   3. Connection string format is correct");
  } else if (
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ETIMEDOUT")
  ) {
    console.error("\n💡 Solution:");
    console.error("   Cannot reach MongoDB server. Check:");
    console.error("   1. MongoDB Atlas Network Access allows your IP");
    console.error("   2. Cluster hostname is correct");
    console.error("   3. Internet connection is working");
  } else if (error.message.includes("prisma")) {
    console.error("\n💡 Solution:");
    console.error("   Prisma client issue. Try:");
    console.error("   cd apps/nitro-api && pnpm prisma:generate");
  }

  console.error("\n📚 For more help, see DATABASE_CONNECTION_FIX.md");
  process.exit(1);
}
