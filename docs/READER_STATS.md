# Reader Stats

Track Quran reading statistics for authenticated users.

## Database Schema

```prisma
model ReaderStats {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  sura      Int
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([sura])
  @@index([timestamp])
  @@map("ReaderStats")
}
```

## API Endpoints

### POST `/api/reader-stats`

Record a reading event when a user views/reads a surah.

**Request:**

```json
{
  "sura": 1
}
```

**Response:**

```json
{
  "ok": true,
  "stat": {
    "id": "...",
    "userId": "...",
    "sura": 1,
    "timestamp": "2026-03-16T..."
  }
}
```

### GET `/api/reader-stats`

Get all reading stats for the authenticated user.

**Response:**

```json
{
  "ok": true,
  "stats": [
    {
      "id": "...",
      "userId": "...",
      "sura": 1,
      "timestamp": "2026-03-16T..."
    }
  ]
}
```

### GET `/api/reader-stats?analytics=true`

Get aggregated reading analytics for the authenticated user.

**Response:**

```json
{
  "ok": true,
  "analytics": {
    "totalReadings": 42,
    "uniqueSuras": 15,
    "mostRead": [
      { "sura": 1, "count": 10 },
      { "sura": 2, "count": 5 }
    ],
    "surahCounts": {
      "1": 10,
      "2": 5
    }
  }
}
```

## Client Implementation

### Pinia Store

```ts
import { useReaderStatsStore } from '@/stores/reader-stats.pinia'

const readerStats = useReaderStatsStore()

// Record a reading
await readerStats.recordReading(1) // Surah Al-Fatiha

// Fetch stats
await readerStats.fetchStats()

// Fetch analytics
await readerStats.fetchAnalytics()

// Access data
console.log(readerStats.allStats)
console.log(readerStats.analytics)
console.log(readerStats.surasRead)
console.log(readerStats.hasReadSura(1)) // boolean
```

### Component Usage

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useReaderStatsStore } from '@/stores/reader-stats.pinia'
import { useRoute } from 'vue-router'

const route = useRoute()
const readerStats = useReaderStatsStore()

onMounted(async () => {
  // Record that user opened this surah
  const suraId = Number(route.params.id)
  if (suraId >= 1 && suraId <= 114) {
    await readerStats.recordReading(suraId)
  }
})
</script>
```

## Features

### Automatic Tracking

- Records every time an authenticated user opens a surah
- Timestamp automatically captured
- Works only for authenticated users

### Analytics

- Total readings count
- Unique surahs read
- Most frequently read surahs
- Reading counts per surah
- Date range filtering (server-side available)

### Privacy

- Only authenticated users are tracked
- Guest users reading is not tracked
- Users can only access their own stats

## Server Utilities

Available in `apps/nitro-api/server/utils/reader-stats.ts`:

- `recordReaderStat(userId, sura)` - Record a reading event
- `getUserReaderStats(userId)` - Get all stats for a user
- `getSurahReaderStats(sura)` - Get all readings of a specific surah
- `getReaderStatsByDateRange(userId, start, end)` - Get stats within date range
- `getUserReadingAnalytics(userId)` - Get aggregated analytics
- `deleteOldReaderStats(daysOld)` - Cleanup old data (optional)

## Migration

After schema changes:

```bash
cd apps/nitro-api
npx prisma generate
```

If using MongoDB Atlas, the collection will be created automatically on first insert.

## Use Cases

1. **Personal Reading Tracker** - Users can see which surahs they've read
2. **Reading Habits** - Analytics show reading patterns
3. **Completion Tracking** - Check which surahs haven't been read yet
4. **Ramadan Goals** - Track progress during Ramadan
5. **Recommendations** - Suggest less-read surahs

## Next Steps

Consider adding:

- Daily reading streak tracking
- Reading goals and milestones
- Social features (compare with friends)
- Reading time estimation
- Verse-level granularity
- Export reading history
