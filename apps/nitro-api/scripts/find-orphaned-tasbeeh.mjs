#!/usr/bin/env node

/**
 * Script to find and link orphaned Tasbeeh records
 * Checks for Tasbeeh records where the userId doesn't match any User
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), "../../.env") });

const prisma = new PrismaClient();

async function findOrphans() {
  console.log("🔍 Searching for orphaned Tasbeeh records...\n");

  try {
    // Get all tasbeeh records
    const allTasbeeh = await prisma.tasbeeh.findMany();
    console.log(`📊 Found ${allTasbeeh.length} tasbeeh records`);

    // Get all user IDs
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });
    const userIds = new Set(users.map((u) => u.id));
    console.log(`👥 Found ${users.length} users\n`);

    // Find orphaned records
    const orphaned = allTasbeeh.filter((t) => !userIds.has(t.userId));

    if (orphaned.length === 0) {
      console.log("✅ No orphaned Tasbeeh records found!\n");
      return;
    }

    console.log(`⚠️  Found ${orphaned.length} orphaned Tasbeeh records:\n`);

    for (const t of orphaned) {
      const daily = t.daily || [];
      const sessions = t.sessions || [];
      const totalCount = daily.reduce((sum, d) => sum + (d.total || 0), 0);

      console.log(`📦 Orphaned Record:`);
      console.log(`   _id: ${t.id}`);
      console.log(`   userId: ${t.userId} (user not found)`);
      console.log(`   Daily entries: ${daily.length}`);
      console.log(`   Sessions: ${sessions.length}`);
      console.log(`   Total count: ${totalCount}`);
      console.log(`   Created: ${t.createdAt}`);
      console.log(`   Updated: ${t.updatedAt}\n`);
    }

    console.log("💡 Options:");
    console.log("   1. Delete orphaned records");
    console.log("   2. Link to existing user (if you know the correct user)");
    console.log("   3. Keep as-is (waiting for user signup)\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findOrphans().catch(console.error);
