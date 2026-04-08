# Offline Quran Recitation - Implementation Summary

## ✅ What's Been Created

### 1. **Core Composable** (`src/composables/useOfflineRecitation.ts`)

- Quality selection: Regular (64kbps ~1.5MB/sura) and HiQ (128kbps ~6MB/sura)
- Download management with progress tracking
- Cache storage using CacheStorage API
- Methods:
  - `downloadSura(suraId, totalVerses)` - Download individual sura
  - `get CachedAudioUrl(suraId, verseNumber, quality)` - Get offline audio
  - `isSuraCached(suraId, quality)` - Check cache status
  - `clearAllCache()` - Clear all downloads
  - `getCacheSize()` - Get total storage used

### 2. **UI Component** (`src/components/quran/OfflineRecitationManager.vue`)

- Quality selector (Regular vs HiQ)
- Storage usage display
- Download options:
  - Download current sura
  - Download full Quran (all 114 suras)
  - Clear all cache
- Progress indicators for active downloads
- Confirmation dialogs with storage estimates

### 3. **Translations** (English added to `src/locale/en.json`)

- ✅ English translations complete
- ⚠️ Need to add for: Arabic, German, Russian, Hebrew

---

## 🔧 Integration Steps

### Step 1: Add Missing Translations

Add this block to **each locale file** before the `"general"` section:

**Arabic** (`src/locale/ar.json`):

```json
  "offline": {
    "title": "التلاوة دون اتصال",
    "subtitle": "حمّل تلاوات القرآن للاستماع بدون إنترنت",
    "selectQuality": "اختر جودة الصوت",
    "regular": "جودة عادية",
    "highQuality": "جودة عالية",
    "storageUsed": "المساحة المستخدمة",
    "surasDownloaded": "السُّور المحملة",
    "downloadOptions": "خيارات التحميل",
    "downloadAllQuran": "حمّل القرآن كاملاً (114 سورة)",
    "downloadCurrentSura": "حمّل السورة الحالية",
    "clearAllCache": "امسح كل التلاوات المحملة",
    "downloading": "جارٍ التحميل",
    "sura": "سورة",
    "verses": "آيات",
    "noSuraSelected": "لم يتم اختيار سورة",
    "downloadingStarted": "بدأ التحميل...",
    "downloadComplete": "اكتمل التحميل!",
    "downloadFailed": "فشل التحميل، حاول مرة أخرى",
    "downloadAllComplete": "تم تحميل {completed} سورة. {failed} فشلت.",
    "cacheCleared": "تم مسح جميع التلاوات",
    "confirmDownloadAll": {
      "title": "تحميل القرآن كاملاً؟",
      "message": "سيتم تحميل حوالي {size} من بيانات الصوت بجودة {quality}. تأكد من وجود مساحة كافية واتصال مستقر."
    },
    "confirmClear": {
      "title": "مسح كل التلاوات؟",
      "message": "سيتم حذف جميع التلاوات المحملة. يمكنك إعادة تحميلها لاحقاً."
    }
  },
```

**German** (`src/locale/de.json`):

```json
  "offline": {
    "title": "Offline-Rezitation",
    "subtitle": "Laden Sie Quran-Rezitationen für Offline-Anhören herunter",
    "selectQuality": "Audioqualität wählen",
    "regular": "Normale Qualität",
    "highQuality": "Hohe Qualität",
    "storageUsed": "Verwendeter Speicher",
    "surasDownloaded": "Heruntergeladene Suren",
    "downloadOptions": "Download-Optionen",
    "downloadAllQuran": "Gesamten Quran herunterladen (114 Suren)",
    "downloadCurrentSura": "Aktuelle Sure herunterladen",
    "clearAllCache": "Alle heruntergeladenen Audios löschen",
    "downloading": "Wird heruntergeladen",
    "sura": "Sure",
    "verses": "Verse",
    "noSuraSelected": "Keine Sure ausgewählt",
    "downloadingStarted": "Download gestartet...",
    "downloadComplete": "Download abgeschlossen!",
    "downloadFailed": "Download fehlgeschlagen, bitte erneut versuchen",
    "downloadAllComplete": "{completed} Suren heruntergeladen. {failed} fehlgeschlagen.",
    "cacheCleared": "Alle Offline-Audios gelöscht",
    "confirmDownloadAll": {
      "title": "Gesamten Quran herunterladen?",
      "message": "Dies lädt etwa {size} an Audiodaten in {quality}-Qualität herunter. Stellen Sie sicher, dass Sie genügend Speicher und eine stabile Verbindung haben."
    },
    "confirmClear": {
      "title": "Alle Offline-Audios löschen?",
      "message": "Dies löscht alle heruntergeladenen Rezitationen. Sie können sie später erneut herunterladen."
    }
  },
```

**Russian** (`src/locale/ru.json`) & **Hebrew** (`src/locale/he.json`):
Similar translations needed.

Also add these to the `"general"` section of each file:

```json
"download": "Download", // Translate appropriately
"cancel": "Cancel",
"delete": "Delete"
```

---

### Step 2: Integrate with Quran Audio Player

Update `src/pages/quran/[id].vue` to check cache first before streaming:

```diff
+ import { useOfflineRecitation } from '@/composables/useOfflineRecitation'

// Add to setup section:
+ const { getCachedAudioUrl, selectedQuality, isSuraCached } = useOfflineRecitation()

// Modify loadAudioAndTimings to check cache first:
async function loadAudioAndTimings(id: number) {
+  // Check if sura is cached offline
+  const hasCached = await isSuraCached(id, selectedQuality.value)
+
+  if (hasCached) {
+    // Load from offline cache
+    await loadAudioFromCache(id)
+    return
+  }

  // Existing online loading code...
  const AUDIO_BASE_URL = 'https://verses.quran.com/'
  // ...
}

+ async function loadAudioFromCache(id: number) {
+   try {
+     const suraData = sura.value
+     if (!suraData) return
+
+     audioList.value = []
+     for (let verse = 1; verse <= suraData.total_verses;  verse++) {
+       const cachedUrl = await getCachedAudioUrl(id, verse, selectedQuality.value)
+       if (cachedUrl) {
+         audioList.value.push(cachedUrl)
+       }
+     }
+
+     $q.notify({
+       type: 'positive',
+       message: 'Playing from offline storage',
+       icon: 'offline_pin',
+       position: 'top',
+       timeout: 2000
+     })
+   } catch (err) {
+     console.error('[Offline Audio] Load error:', err)
+     await loadAudioAndTimings(id) // Fallback to online
+   }
+ }
```

---

### Step 3: Add UI Access Point

Add the offline manager to your Quran page or preferences:

**Option A: Add to Quran page** (`src/pages/quran/[id].vue`):

```vue
<template>
  <!-- Existing template -->

  <!-- Add offline manager button -->
  <q-btn
    flat
    round
    dense
    icon="folder_offline"
    @click="showOfflineManager = true"
  >
    <q-tooltip>{{ t('offline.title') }}</q-tooltip>
  </q-btn>

  <!-- Offline manager dialog -->
  <q-dialog v-model="showOfflineManager">
    <OfflineRecitationManager
      :current-sura-id="currentSuraId"
      :current-sura-total-verses="sura?.total_verses"
      @quality-changed="onOfflineQualityChanged"
      @download-complete="onSuraDownloaded"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import OfflineRecitationManager from '@/components/quran/OfflineRecitationManager.vue'

const showOfflineManager = ref(false)

function onOfflineQualityChanged(quality: RecitationQuality) {
  // Reload audio if current sura is playing
  if (isPlayingAudio.value) {
    stopAudio()
    loadAudioAndTimings(currentSuraId.value)
  }
}

function onSuraDownloaded(suraId: number) {
  // Reload audio to use cached version
  if (suraId === currentSuraId.value) {
    loadAudioAndTimings(suraId)
  }
}
</script>
```

**Option B: Add to Preferences** (`src/views/preferences.vue`):

```vue
<!-- Add a new section -->
<q-expansion-item
  icon="download"
  :label="t('offline.title')"
  :caption="t('offline.subtitle')"
>
  <q-card>
    <q-card-section>
      <OfflineRecitationManager />
    </q-card-section>
  </q-card>
</q-expansion-item>
```

---

### Step 4: Enhance Service Worker (Optional, for better caching)

Update `public/sw.js` to add audio caching strategy:

```javascript
// Add after existing routing rules:

// Quran audio - Check cache first, fallback to network
workbox.routing.registerRoute(
  ({ url }) =>
    url.hostname === 'everyayah.com' || url.pathname.includes('Alafasy'),
  new workbox.strategies.CacheFirst({
    cacheName: 'quran-audio-offline-v1',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1500, // ~114 suras × 13 avg verses
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        purgeOnQuotaError: true,
      }),
    ],
  })
)
```

---

## 📊 Storage Estimates

| Quality          | Per Sura | Full Quran (114 Suras) |
| ---------------- | -------- | ---------------------- |
| Regular (64kbps) | ~1.5MB   | ~180MB                 |
| HiQ (128kbps)    | ~6MB     | ~720MB                 |

---

## 🎯 Features Summary

✅ **Quality Options**: Users choose storage vs quality tradeoff
✅ **Smart Prompts**: Warns about storage before downloading
✅ **Progress Tracking**: Real-time download progress per sura
✅ **Cache Management**: View usage, clear cache, selective deletion
✅ **Fallback Support**: Seamlessly falls back to online if cache fails
✅ **Storage Efficient**: Uses CacheStorage API for optimal performance
✅ **Offline First**: Checks cache before making network requests

---

## 🚀 Testing

1. **Download a single sura**: Navigate to any sura, open the offline manager, click "Download Current Sura"
2. **Test offline playback**: Disable network, verify the sura plays from cache
3. **Check storage**: View storage usage in the manager
4. **Quality switching**: Change quality and re-download to verify
5. **Full Quran download**: Test with good connection and adequate storage

---

## 🐛 Troubleshooting

**"Offline storage not supported"**

- Ensure HTTPS or localhost
- Check browser compatibility (CacheStorage API)

**Downloads failing**

- Check network stability
- Verify enough storage space
- Try smaller batches (single suras)

**Audio not playing offline**

- Clear cache and re-download
- Check browser console for errors
- Verify cache keys match expected format

---

## 📝 Next Steps

1. Add translations for ar, de, ru, he locales
2. Integrate with Quran player (Step 2)
3. Add UI access (Step 3)
4. Test thoroughly on mobile devices
5. Consider adding background sync for large downloads

---

Ready to test! 🎉
