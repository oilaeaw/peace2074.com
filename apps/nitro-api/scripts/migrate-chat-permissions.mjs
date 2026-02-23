#!/usr/bin/env node
/**
 * Migration script to add chat permissions to existing users
 * Run with: node apps/nitro-api/scripts/migrate-chat-permissions.mjs
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const CaslActionE = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
};

const CaslSubjectE = {
  ALL: "all",
  ADMIN: "admin",
  CATEGORY: "category",
  CHAT: "chat",
  LIKES: "likes",
  MEDIAFILE: "mediafile",
  PERMISSIONS: "permissions",
  POST: "post",
  ROLES: "roles",
  REFRESH_TOKEN: "reshresh_token",
  TWEET: "tweet",
  USER: "user",
};

function getDefaultPermissions(role) {
  const basePermissions = [
    { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
    { action: CaslActionE.READ, subject: CaslSubjectE.POST },
    { action: CaslActionE.CREATE, subject: CaslSubjectE.USER },
    { action: CaslActionE.READ, subject: CaslSubjectE.USER },
    { action: CaslActionE.UPDATE, subject: CaslSubjectE.USER },
  ];

  if (role === "admin") {
    return [
      ...basePermissions,
      { action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN },
      { action: CaslActionE.MANAGE, subject: CaslSubjectE.CHAT },
      { action: CaslActionE.READ, subject: CaslSubjectE.CHAT },
    ];
  }

  if (role === "editor") {
    return [
      ...basePermissions,
      { action: CaslActionE.UPDATE, subject: CaslSubjectE.POST },
      { action: CaslActionE.READ, subject: CaslSubjectE.CHAT },
    ];
  }

  // Regular users get read access to chat
  return [
    ...basePermissions,
    { action: CaslActionE.READ, subject: CaslSubjectE.CHAT },
  ];
}

async function main() {
  console.log("🔄 Starting chat permissions migration...");

  try {
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Parse existing permissions if they exist
        let permissions = [];
        if (user.permissions && typeof user.permissions === "object") {
          permissions = Array.isArray(user.permissions) ? user.permissions : [];
        }

        // Check if user already has chat permissions
        const hasChat = permissions.some(
          (p) => p.subject === CaslSubjectE.CHAT,
        );

        if (hasChat) {
          console.log(
            `⏭️  Skipping ${user.username} - already has chat permissions`,
          );
          skipped++;
          continue;
        }

        // Get role-based permissions
        const newPermissions = getDefaultPermissions(user.role);

        await prisma.user.update({
          where: { id: user.id },
          data: { permissions: newPermissions },
        });

        console.log(
          `✅ Updated ${user.username} (${user.role}) with ${newPermissions.length} permissions`,
        );
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update ${user.username}:`, error.message);
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Total: ${users.length}`);
    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
