import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const usersFile = resolve(process.cwd(), '.data/kv/db/users')

function normalize(user = {}) {
  return {
    id: String(user.id || ''),
    username: String(user.username || '').trim(),
    password: String(user.password || '').trim(),
    email: String(user.email || '').trim(),
    role: String(user.role || 'user'),
    first_name: (user.first_name || '').trim() || null,
    last_name: (user.last_name || '').trim() || null,
    tasbeeh: Array.isArray(user.tasbeeh) ? user.tasbeeh : [],
    bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks : [],
    avatar_url: user.avatar_url || null,
    github_id: user.github_id || null,
  }
}

async function run() {
  let users = []

  try {
    const raw = await readFile(usersFile, 'utf8')
    const parsed = JSON.parse(raw)
    users = Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`[sync-users] Failed to read ${usersFile}:`, error?.message || error)
    process.exitCode = 1
    return
  }

  if (!users.length) {
    console.log('[sync-users] No users found in legacy KV file.')
    return
  }

  let synced = 0

  for (const user of users) {
    const normalized = normalize(user)
    if (!normalized.id || !normalized.username || !normalized.email) {
      continue
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: normalized.id },
          { username: normalized.username },
          { email: normalized.email },
        ],
      },
    })

    const payload = {
      username: normalized.username,
      password: normalized.password,
      email: normalized.email,
      role: normalized.role,
      first_name: normalized.first_name,
      last_name: normalized.last_name,
      tasbeeh: normalized.tasbeeh,
      bookmarks: normalized.bookmarks,
      avatar_url: normalized.avatar_url,
      github_id: normalized.github_id,
    }

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: payload,
      })
    } else {
      await prisma.user.create({
        data: {
          id: normalized.id,
          ...payload,
        },
      })
    }

    synced += 1
  }

  const count = await prisma.user.count()
  console.log(`[sync-users] Synced ${synced} user(s). DB now has ${count} user(s).`)
}

run()
  .catch((error) => {
    console.error('[sync-users] Unexpected error:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
