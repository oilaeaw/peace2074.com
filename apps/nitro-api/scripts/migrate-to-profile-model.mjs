#!/usr/bin/env node

/**
 * Migration script: User → User + Profile + Tasbeeh
 *
 * This script migrates data from the old User model to the new separated structure:
 * - User: Authentication only (id, username, password, email, role, permissions)
 * - Profile: User data (first_name, last_name, avatar, bookmarks, settings, tasbeeh_summary)
 * - Tasbeeh: Already exists as separate collection
 *
 * Run with: node apps/nitro-api/scripts/migrate-to-profile-model.mjs
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root .env
config({ path: resolve(process.cwd(), "../../.env") });

const prisma = new PrismaClient();

async function migrate() {
  console.log("🔄 Starting migration to Profile model...\n");

  try {
    // 1. Get all users
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users\n`);

    // 2. Get all existing profiles (to avoid duplicates)
    const existingProfiles = await prisma.profile.findMany();
    const existingUserIds = new Set(existingProfiles.map((p) => p.userId));
    console.log(`✅ Found ${existingProfiles.length} existing profiles\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    // 3. For each user, create a profile if it doesn't exist
    for (const user of users) {
      try {
        // Skip if profile already exists
        if (existingUserIds.has(user.id)) {
          console.log(`⏭️  Skipping ${user.username} - profile already exists`);
          skipped++;
          continue;
        }

        // Get tasbeeh summary from Tasbeeh collection
        const tasbeeh = await prisma.tasbeeh.findFirst({
          where: { userId: user.id },
        });

        let tasbeeh_summary = { total: 0, sessions: 0 };
        if (tasbeeh) {
          // Calculate totals from tasbeeh data
          const daily = tasbeeh.daily || [];
          const sessions = tasbeeh.sessions || [];

          tasbeeh_summary = {
            total: daily.reduce((sum, d) => sum + (d.total || 0), 0),
            sessions: sessions.length,
          };
        }

        // Extract profile data from user (if old schema had these fields)
        const profileData = {
          userId: user.id,
          first_name: user.first_name || user.username,
          last_name: user.last_name || "",
          avatar_url: user.avatar_url || null,
          github_id: user.github_id || null,
          bookmarks: user.bookmarks || [],
          settings: {},
          tasbeeh_summary: tasbeeh_summary,
        };

        // Create profile
        await prisma.profile.create({ data: profileData });

        console.log(`✅ Created profile for ${user.username}`);
        console.log(
          `   - Name: ${profileData.first_name} ${profileData.last_name}`,
        );
        console.log(`   - Bookmarks: ${profileData.bookmarks.length}`);
        console.log(
          `   - Tasbeeh: ${tasbeeh_summary.total} total, ${tasbeeh_summary.sessions} sessions`,
        );
        created++;
      } catch (error) {
        console.error(
          `❌ Error creating profile for ${user.username}:`,
          error.message,
        );
        errors++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${users.length}`);

    if (errors === 0) {
      console.log("\n🎉 Migration completed successfully!\n");
    } else {
      console.log("\n⚠️  Migration completed with errors. Please review.\n");
    }
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate().catch(console.error);
