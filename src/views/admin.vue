<template>
  <q-page padding class="admin-page">
    <section class="header q-mb-md">
      <h1 class="text-h4 q-mb-xs">{{ t('pages.admin.title') }}</h1>
      <p class="text-subtitle2 text-grey-7 q-mb-none">
        {{ t('pages.admin.subtitle') }}
      </p>
    </section>

    <q-card flat bordered>
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-badge color="primary" outline>
            {{ t('pages.admin.currentVersion') }}: {{ appVersion }}
          </q-badge>
        </div>
        <div class="col-12 col-md-auto">
          <q-toggle
            v-model="evenOnly"
            color="primary"
            :label="t('pages.admin.onlyEven')"
          />
        </div>
        <div class="col-12 col-md-auto">
          <q-btn
            color="primary"
            outline
            icon="refresh"
            :label="t('pages.admin.refresh')"
            :loading="loading"
            @click="loadReleases"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-banner
          v-if="error"
          rounded
          dense
          class="bg-red-1 text-negative q-mb-md"
        >
          {{ error }}
        </q-banner>

        <q-list bordered separator>
          <q-item v-for="release in filteredReleases" :key="release.tagName">
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ release.tagName }}
                <q-badge
                  v-if="isEvenPatch(release.tagName)"
                  color="positive"
                  class="q-ml-sm"
                  :label="t('pages.admin.even')"
                />
              </q-item-label>
              <q-item-label caption>
                {{ release.name || t('pages.admin.noTitle') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>
                {{ formatDate(release.publishedAt) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="!loading && !filteredReleases.length">
            <q-item-section>
              <q-item-label>{{ t('pages.admin.noVersions') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="loading">
            <q-item-section avatar>
              <q-spinner color="primary" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t('pages.admin.loading') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- User Management (admin-only) -->
    <q-card v-if="ability.can('manage', 'admin')" flat bordered class="q-mt-md">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">{{ t('pages.admin.users.title') }}</div>
        <q-btn
          color="primary"
          outline
          icon="refresh"
          :label="t('pages.admin.refresh')"
          :loading="usersLoading"
          @click="loadUsers"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-banner
          v-if="usersError"
          rounded
          dense
          class="bg-red-1 text-negative q-mb-md"
        >
          {{ usersError }}
        </q-banner>

        <q-banner
          v-if="usersSaveMsg"
          rounded
          dense
          class="bg-green-1 text-positive q-mb-md"
        >
          {{ usersSaveMsg }}
        </q-banner>

        <q-item v-if="usersLoading">
          <q-item-section avatar>
            <q-spinner color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('pages.admin.users.loading') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-table
          v-if="!usersLoading && users.length"
          :rows="users"
          :columns="userColumns"
          row-key="id"
          flat
          dense
          hide-pagination
          :rows-per-page-options="[0]"
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-select
                v-model="props.row.role"
                :options="roleOptions"
                dense
                outlined
                emit-value
                map-options
                style="min-width: 120px"
              />
            </q-td>
          </template>
          <template #body-cell-lastLogin="props">
            <q-td :props="props">
              <span v-if="props.row.lastLogin">
                {{ formatDate(props.row.lastLogin) }}
                <q-badge
                  v-if="props.row.lastLoginProvider"
                  color="grey-5"
                  class="q-ml-xs"
                >
                  {{ props.row.lastLoginProvider }}
                </q-badge>
              </span>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>
          <template #body-cell-lastReadAt="props">
            <q-td :props="props">
              <span v-if="props.row.lastReadAt">
                {{ formatDate(props.row.lastReadAt) }}
                <q-badge
                  v-if="props.row.lastReadSura"
                  color="primary"
                  outline
                  class="q-ml-xs"
                >
                  {{ t('pages.admin.users.sura') }} {{ props.row.lastReadSura }}
                </q-badge>
              </span>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                color="primary"
                dense
                flat
                icon="save"
                :label="t('pages.admin.users.save')"
                :loading="savingUserId === props.row.id"
                @click="saveUser(props.row)"
              />
              <q-btn
                color="secondary"
                dense
                flat
                icon="security"
                :label="t('pages.admin.users.editPerms')"
                @click="openPermEditor(props.row)"
              />
            </q-td>
          </template>
        </q-table>

        <!-- Permissions Editor Dialog -->
        <q-dialog v-model="permDialog" persistent>
          <q-card style="min-width: 520px; max-width: 95vw">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">
                {{ t('pages.admin.users.permsTitle') }}
                <span class="text-primary q-ml-sm">{{
                  permUser?.username
                }}</span>
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
              <div class="text-caption text-grey q-mb-sm">
                {{ t('pages.admin.users.permsHint') }}
              </div>
              <q-markup-table flat dense separator="cell" class="perm-table">
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ t('pages.admin.users.permsSubject') }}
                    </th>
                    <th
                      v-for="action in CASL_ACTIONS"
                      :key="action"
                      class="text-center"
                    >
                      {{ action }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="subject in CASL_SUBJECTS" :key="subject">
                    <td class="text-weight-medium">{{ subject }}</td>
                    <td
                      v-for="action in CASL_ACTIONS"
                      :key="action"
                      class="text-center"
                    >
                      <q-checkbox
                        v-model="permMatrix[subject][action]"
                        dense
                        color="primary"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                flat
                :label="t('pages.admin.users.cancel')"
                v-close-popup
              />
              <q-btn
                color="primary"
                :label="t('pages.admin.users.savePerms')"
                :loading="savingUserId === permUser?.id"
                @click="savePermissions"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-item v-if="!usersLoading && !users.length && !usersError">
          <q-item-section>
            <q-item-label>{{ t('pages.admin.users.noUsers') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.pinia'

declare const __APP_VERSION__: string

const appVersion = __APP_VERSION__ || '0.0.0'
const { t } = useI18n()
const { ability } = useAuthStore()
const evenOnly = ref(true)
const loading = ref(false)
const error = ref('')

interface Release {
  tagName: string
  name: string
  publishedAt: string
}

interface GitHubReleaseItem {
  tag_name?: unknown
  name?: unknown
  published_at?: unknown
}

const releases = ref<Release[]>([])

function normalizeTag(tag: string): string {
  return (tag || '').trim().replace(/^v/i, '')
}

function parsePatch(tag: string): number | null {
  const normalized = normalizeTag(tag)
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return Number(match[3])
}

function isEvenPatch(tag: string): boolean {
  const patch = parsePatch(tag)
  return patch !== null && patch % 2 === 0
}

const filteredReleases = computed(() => {
  if (!evenOnly.value) return releases.value
  return releases.value.filter((r) => isEvenPatch(r.tagName))
})

function formatDate(dateStr: string): string {
  if (!dateStr) return t('pages.admin.unknownDate')
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return t('pages.admin.unknownDate')
  return d.toLocaleDateString()
}

async function loadReleases() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(
      'https://api.github.com/repos/Islam2074/peace2074.com/releases?per_page=100'
    )
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: unknown = await response.json()
    releases.value = (Array.isArray(data) ? data : [])
      .map((item: GitHubReleaseItem) => ({
        tagName: String(item.tag_name || '').trim(),
        name: String(item.name || '').trim(),
        publishedAt: String(item.published_at || '').trim(),
      }))
      .filter((r) => !!r.tagName)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('pages.admin.loadFailed')
    releases.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReleases()
  if (ability.can('manage', 'admin')) {
    loadUsers()
  }
})

// ── User Management ─────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  permissions: Array<{ action: string; subject: string }>
  first_name: string | null
  last_name: string | null
  lastLogin: string | null
  lastLoginProvider: string | null
  loginCount: number
  bookmarkCount: number
  tasbeehTotal: number
  completedSurasCount: number
  lastReadSura: number | null
  lastReadAt: string | null
}

const DEFAULT_NITRO_PORT = 3000

function computeUsersApiBase(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const configured = import.meta.env.VITE_NITRO_BASE as string | undefined
    if (configured) return configured.replace(/\/$/, '')
    if (
      protocol === 'capacitor:' ||
      protocol === 'ionic:' ||
      protocol === 'app:'
    )
      return 'https://peace2074.com/api'
    if (hostname === 'localhost' || hostname === '127.0.0.1')
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`
    return '/api'
  }
  return '/api'
}

const USERS_API_BASE = computeUsersApiBase()

const users = ref<AdminUser[]>([])
const usersLoading = ref(false)
const usersError = ref('')
const usersSaveMsg = ref('')
const savingUserId = ref<string | null>(null)

const roleOptions = [
  { label: t('pages.admin.users.roles.user'), value: 'user' },
  { label: t('pages.admin.users.roles.editor'), value: 'editor' },
  { label: t('pages.admin.users.roles.admin'), value: 'admin' },
]

const userColumns = [
  {
    name: 'username',
    label: 'Username',
    field: 'username',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'role',
    label: t('pages.admin.users.roleLabel'),
    field: 'role',
    align: 'left' as const,
  },
  {
    name: 'lastLogin',
    label: t('pages.admin.users.lastLogin'),
    field: 'lastLogin',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'loginCount',
    label: t('pages.admin.users.loginCount'),
    field: 'loginCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'bookmarkCount',
    label: t('pages.admin.users.bookmarks'),
    field: 'bookmarkCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'completedSurasCount',
    label: t('pages.admin.users.surasCompleted'),
    field: 'completedSurasCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'lastReadAt',
    label: t('pages.admin.users.lastRead'),
    field: 'lastReadAt',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
]

async function loadUsers() {
  usersLoading.value = true
  usersError.value = ''
  usersSaveMsg.value = ''
  try {
    const res = await fetch(`${USERS_API_BASE}/admin/users`, {
      credentials: 'include',
    })
    const data = (await res.json()) as {
      ok: boolean
      users?: AdminUser[]
      error?: string
    }
    if (!data.ok)
      throw new Error(data.error || t('pages.admin.users.loadFailed'))
    users.value = data.users ?? []
  } catch (e: unknown) {
    usersError.value =
      e instanceof Error ? e.message : t('pages.admin.users.loadFailed')
    users.value = []
  } finally {
    usersLoading.value = false
  }
}

async function saveUser(user: AdminUser) {
  savingUserId.value = user.id
  usersError.value = ''
  usersSaveMsg.value = ''
  try {
    const res = await fetch(`${USERS_API_BASE}/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: user.role }),
    })
    const data = (await res.json()) as { ok: boolean; error?: string }
    if (!data.ok)
      throw new Error(data.error || t('pages.admin.users.updateFailed'))
    usersSaveMsg.value = t('pages.admin.users.updateSuccess')
    setTimeout(() => {
      usersSaveMsg.value = ''
    }, 3000)
  } catch (e: unknown) {
    usersError.value =
      e instanceof Error ? e.message : t('pages.admin.users.updateFailed')
  } finally {
    savingUserId.value = null
  }
}

// ── Permissions Editor ───────────────────────────────────────────────────────

const CASL_ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const
const CASL_SUBJECTS = [
  'admin',
  'category',
  'chat',
  'likes',
  'mediafile',
  'permissions',
  'post',
  'roles',
  'user',
] as const

type CaslAction = (typeof CASL_ACTIONS)[number]
type CaslSubject = (typeof CASL_SUBJECTS)[number]
type PermMatrix = Record<CaslSubject, Record<CaslAction, boolean>>

const permDialog = ref(false)
const permUser = ref<AdminUser | null>(null)
const permMatrix = ref<PermMatrix>(buildEmptyMatrix())

function buildEmptyMatrix(): PermMatrix {
  return Object.fromEntries(
    CASL_SUBJECTS.map((subject) => [
      subject,
      Object.fromEntries(CASL_ACTIONS.map((action) => [action, false])),
    ])
  ) as PermMatrix
}

function permsToMatrix(
  permissions: Array<{ action: string; subject: string }>
): PermMatrix {
  const matrix = buildEmptyMatrix()
  for (const { action, subject } of permissions) {
    const s = subject as CaslSubject
    const a = action as CaslAction
    if (matrix[s] !== undefined && a in matrix[s]) {
      matrix[s][a] = true
    }
  }
  return matrix
}

function matrixToPerms(
  matrix: PermMatrix
): Array<{ action: string; subject: string }> {
  const result: Array<{ action: string; subject: string }> = []
  for (const subject of CASL_SUBJECTS) {
    for (const action of CASL_ACTIONS) {
      if (matrix[subject][action]) {
        result.push({ action, subject })
      }
    }
  }
  return result
}

function openPermEditor(user: AdminUser) {
  permUser.value = user
  permMatrix.value = permsToMatrix(
    Array.isArray(user.permissions) ? user.permissions : []
  )
  permDialog.value = true
}

async function savePermissions() {
  if (!permUser.value) return
  savingUserId.value = permUser.value.id
  usersError.value = ''
  usersSaveMsg.value = ''
  try {
    const permissions = matrixToPerms(permMatrix.value)
    const res = await fetch(
      `${USERS_API_BASE}/admin/users/${permUser.value.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      }
    )
    const data = (await res.json()) as { ok: boolean; error?: string }
    if (!data.ok)
      throw new Error(data.error || t('pages.admin.users.updateFailed'))
    // Sync back into the users list
    const idx = users.value.findIndex((u) => u.id === permUser.value!.id)
    if (idx !== -1) users.value[idx]!.permissions = permissions
    usersSaveMsg.value = t('pages.admin.users.updateSuccess')
    permDialog.value = false
    setTimeout(() => {
      usersSaveMsg.value = ''
    }, 3000)
  } catch (e: unknown) {
    usersError.value =
      e instanceof Error ? e.message : t('pages.admin.users.updateFailed')
  } finally {
    savingUserId.value = null
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 980px;
  margin: 0 auto;
}

.header h1 {
  letter-spacing: 0.01em;
}

.perm-table th,
.perm-table td {
  padding: 4px 8px;
}
</style>
