#!/usr/bin/env node

/**
 * Debug script to check User, Profile, and Tasbeeh data
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), "../../.env") });

const prisma = new PrismaClient();

async function debug() {
  console.log("🔍 Checking database state...\n");

  try {
    // Users
    const users = await prisma.user.findMany();
    console.log("👥 Users:");
    users.forEach((u) => {
      console.log(`   - ${u.username} (ID: ${u.id}, Email: ${u.email})`);
    });

    // Profiles
    const profiles = await prisma.profile.findMany();
    console.log("\n📋 Profiles:");
    profiles.forEach((p) => {
      console.log(`   - UserID: ${p.userId}`);
      console.log(`     Name: ${p.first_name} ${p.last_name}`);
      console.log(`     Bookmarks: ${(p.bookmarks || []).length}`);
      console.log(`     Tasbeeh Summary:`, p.tasbeeh_summary);
    });

    // Tasbeeh records
    const tasbeeh = await prisma.tasbeeh.findMany();
    console.log("\n🕌 Tasbeeh Records:");
    tasbeeh.forEach((t) => {
      const daily = t.daily || [];
      const sessions = t.sessions || [];
      console.log(`   - UserID: ${t.userId}`);
      console.log(`     Daily entries: ${daily.length}`);
      console.log(`     Sessions: ${sessions.length}`);
      if (daily.length > 0) {
        const totalCount = daily.reduce((sum, d) => sum + (d.total || 0), 0);
        console.log(`     Total count: ${totalCount}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debug().catch(console.error);
