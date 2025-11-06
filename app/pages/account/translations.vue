<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from "#imports";

const locales = ref<string[]>([]);
const selected = ref("en.json");
const editor = ref("");
const loading = ref(false);
const status = ref("");
const viewMode = ref<"table" | "raw">("table");

const $q = useQuasar();
const auth = useAuthStore();
const isAuthenticated = computed(() => !!auth.isAuthenticated);

// store all locale objects here
const localesData = reactive<Record<string, any>>({});

function collectKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  if (!obj || typeof obj !== "object") return keys;
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    keys.push(full);
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      keys.push(...collectKeys(obj[k], full));
    }
  }
  return keys;
}

async function loadFile(file: string) {
  loading.value = true;
  status.value = "";
  const res: any = await $fetch("/api/translations", { method: "GET", params: { file } });
  if (res?.ok) {
    localesData[file] = res.data;
    if (selected.value === file)
      editor.value = JSON.stringify(localesData[file], null, 2);
    status.value = "";
  } else {
    status.value = "Failed to load: " + (res?.error || "unknown");
  }
  loading.value = false;
}

async function loadAllFiles() {
  loading.value = true;
  // ensure we have the latest locales list from server
  try {
    const listRes: any = await $fetch("/api/translations", {
      method: "GET",
      params: { action: "list" },
    });
    if (listRes?.ok && Array.isArray(listRes.files)) {
      locales.value = listRes.files;
    } else {
      // fall back to en.json if server didn't return list
      locales.value = ["en.json"];
    }
  } catch (e) {
    locales.value = ["en.json"];
  }

  // pick first locale as selected if not already set
  if (!selected.value && locales.value.length) selected.value = locales.value[0] as string;

  for (const f of locales.value) {
    try {
      const res: any = await $fetch("/api/translations", {
        method: "GET",
        params: { file: f },
      });
      localesData[f] = res?.ok ? res.data : {};
    } catch (e) {
      localesData[f] = {};
    }
  }
  // ensure editor shows selected file
  editor.value = JSON.stringify(localesData[selected.value as string] || {}, null, 2);
  loading.value = false;
}

function getValue(file: string, dotted: string) {
  const parts = dotted.split(".");
  let cur = localesData[file];
  for (const p of parts) {
    if (!cur || typeof cur !== "object" || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setValue(file: string, dotted: string, value: any) {
  const parts = dotted.split(".");
  if (!localesData[file] || typeof localesData[file] !== "object") localesData[file] = {};
  let cur = localesData[file];
  for (let i = 0; i < parts.length; i++) {
    const p = String(parts[i]);
    if (i === parts.length - 1) {
      // final assignment
      (cur as any)[p] = value;
    } else {
      if (!(cur as any)[p] || typeof (cur as any)[p] !== "object") (cur as any)[p] = {};
      cur = (cur as any)[p];
    }
  }
}

async function saveLocaleFile(file: string) {
  loading.value = true;
  status.value = "";
  try {
    const res: any = await $fetch("/api/translations", {
      method: "POST",
      body: { file, content: localesData[file] },
    });
    if (res?.ok) status.value = `Saved ${file}`;
    else status.value = `Failed to save ${file}: ${res?.error || "unknown"}`;
  } catch (e: any) {
    status.value = `Save error: ${String(e)}`;
  }
  loading.value = false;
}

// helper to build union of keys from en.json and other locales
const allKeys = computed(() => {
  const s = new Set<string>();
  if (localesData["en.json"])
    collectKeys(localesData["en.json"]).forEach((k) => s.add(k));
  for (const f of locales.value) {
    if (localesData[f]) collectKeys(localesData[f]).forEach((k) => s.add(k));
  }
  return Array.from(s).sort();
});

// load initial
loadAllFiles();

onBeforeMount(() => {
  if (!isAuthenticated.value) {
    try { $q.notify({ message: 'You must be logged in to access the translation editor.', type: 'warning' }) } catch {}
    const router = useRouter();
    router.push("/auth/login");
  }
});

function promptEdit(file: string, key: string) {
  const current = getValue(file, key) ?? ''
  const v = (typeof window !== 'undefined' && typeof window.prompt === 'function')
    ? window.prompt(`Edit value for ${file} ${key}`, String(current))
    : null
  if (v !== null) setValue(file, key, v)
}
</script>

<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Translations (table view)</div>
        <div>
          <q-btn
            flat
            :label="viewMode === 'table' ? 'Raw' : 'Table'"
            @click="viewMode = viewMode === 'table' ? 'raw' : 'table'"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption">{{ status }}</div>
        <div v-if="loading">Loading...</div>

        <div v-else>
          <div v-if="viewMode === 'table'">
            <div class="table-wrap">
              <table class="translations-table">
                <thead>
                  <tr>
                    <th class="key-col">Key</th>
                    <th v-for="(f, idx) in locales" :key="f" class="lang-col">
                      <div class="header-cell">
                        <div>{{ f.replace(".json", "") }}</div>
                        <q-btn
                          dense
                          flat
                          small
                          color="primary"
                          label="Save"
                          @click="saveLocaleFile(f)"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="k in allKeys" :key="k">
                    <td class="key-col">
                      <code>{{ k }}</code>
                    </td>
                    <td v-for="f in locales" :key="f" class="lang-col">
                      <div class="cell-value">
                        <div v-if="typeof getValue(f, k) === 'string'">
                          {{ getValue(f, k) }}
                        </div>
                        <div v-else-if="getValue(f, k) === undefined" class="muted">
                          —
                        </div>
                        <div v-else>
                          <small>{{ JSON.stringify(getValue(f, k)) }}</small>
                        </div>
                        <div class="q-mt-xs">
                          <q-btn
                            dense
                            flat
                            small
                            label="Edit"
                            @click="() => promptEdit(f as string, k as string)"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else>
            <q-select
              v-model="selected"
              :options="locales"
              label="Locale file"
              @update:model-value="
                (v) => (editor = JSON.stringify(localesData[v] || {}, null, 2))
              "
            />
            <div class="q-mt-md">
              <q-btn
                label="Save"
                color="primary"
                @click="() => saveLocaleFile(selected as string)"
              />
              <q-btn label="Reload All" flat @click="loadAllFiles" />
            </div>
            <div class="q-mt-md">
              <q-input
                v-model="editor"
                type="textarea"
                autogrow
                style="min-height: 400px"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
.translations-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 720px;
}
.translations-table th,
.translations-table td {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  vertical-align: top;
}
.translations-table thead th {
  background: #fafafa;
  position: sticky;
  top: 0;
  z-index: 1;
}
.key-col {
  width: 320px;
  font-family: monospace;
}
.lang-col {
  min-width: 200px;
}
.header-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.muted {
  color: #9ca3af;
}

@media (max-width: 700px) {
  .translations-table {
    min-width: 0;
    font-size: 13px;
  }
  .key-col {
    width: 160px;
  }
  .lang-col {
    min-width: 140px;
  }
}
</style>
