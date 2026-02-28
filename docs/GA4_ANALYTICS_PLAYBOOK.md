# GA4 Analytics Playbook (PEACE2074)

This playbook maps the custom analytics events emitted by the app and provides quick recipes to analyze user behavior and 5xx failures.

## 1) Custom events emitted

The app sends these GA4 events:

- `page_view`
  - Router-level for normal pages
  - Component-level (richer) for Quran detail pages
- `quran_detail_view`
  - Fired for `/quran/:id` with surah-specific fields
- `api_5xx`
  - Fired when monitored APIs return HTTP status >= 500

## 2) Event parameters used

### `page_view`

- `page_title`
- `page_location`
- `page_path`
- `source` (`router_ready`, `router_after_each`, `quran_detail`)
- `content_group` (e.g. `quran` on detail pages)
- `sura_id` (Quran detail)
- `sura_name_en` (Quran detail)

### `quran_detail_view`

- `sura_id`
- `sura_name_en`
- `sura_name_ar`
- `verses_count`
- `page_path`
- `locale`

### `api_5xx`

- `source` (e.g. `quran_api`, `quran_com_verses`, `alquran_cloud_fallback`)
- `status`
- `endpoint`
- `page_path`
- `sura_id` (when available)

## 3) GA4 custom definitions checklist

In GA4 Admin → Custom definitions, create these **event-scoped custom dimensions**:

1. `source` (parameter: `source`)
2. `content_group` (parameter: `content_group`)
3. `sura_id` (parameter: `sura_id`)
4. `sura_name_en` (parameter: `sura_name_en`)
5. `sura_name_ar` (parameter: `sura_name_ar`)
6. `verses_count` (parameter: `verses_count`)
7. `endpoint` (parameter: `endpoint`)
8. `status` (parameter: `status`)
9. `locale` (parameter: `locale`)
10. `page_path` (parameter: `page_path`) — optional if default Page path is enough

Optional **custom metrics** (event-scoped):

- `sura_id` (if you want numeric filters/charts)
- `status` (for API status trend charts)

## 4) Exploration recipes

### A) Top failing endpoints (5xx)

Use Free Form exploration:

- Filter: `event_name = api_5xx`
- Rows: `endpoint`, `status`, `source`
- Values: `Event count`, `Total users`
- Optional breakdown: `page_path`

Outcome: quickly see which backend or third-party endpoint fails most.

### B) Surah behavior and drop-off hints

Use Free Form exploration:

- Filter: `event_name = quran_detail_view`
- Rows: `sura_id`, `sura_name_en`
- Values: `Event count`, `Users`
- Breakdown: `locale`

Then compare with Page path report for exit patterns:

- Report: Engagement → Pages and screens
- Filter page path contains `/quran/`
- Add metrics: `Views`, `Users`, `Average engagement time`, `Views per user`

Heuristic: high views + low engagement time on specific surahs can indicate UX/content friction.

### C) 5xx impact by surah

Use Free Form exploration:

- Filter: `event_name = api_5xx`
- Rows: `sura_id`, `sura_name_en`, `endpoint`
- Values: `Event count`

Outcome: identify if failures cluster around certain surahs/workflows.

## 5) Data quality notes

- Router page views are deduplicated.
- Quran detail pages emit richer events and deduplicated page views separately.
- `api_5xx` events are deduplicated per `(source, status, endpoint)` over a short window (15s) to reduce burst noise.
- If consent is denied, events won’t be sent (expected behavior).

## 6) Recommended alerting

In GA4 Custom Insights, create alerts for:

1. `api_5xx` event count spike day-over-day
2. Sudden drop in `quran_detail_view` counts
3. Significant increase in 5xx for a single endpoint
