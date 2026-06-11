# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 3.3.0 (2026-06-11)

### Features

- add a cursor diamond trail that spawns falling, shimmering diamonds at the pointer with a "God bless my mom" blessing label
- render the cursor trail globally across every layout, including the plain Quran reader pages
- support touch devices so the diamond trail follows finger movement on mobile and tablet

### Chores

- bump root and Nitro API package versions to `3.3.0`

## 3.2.0 (2026-05-06)

### Features

- add `/social` page with TikTok video embeds, artist credit, copyright notices
- complete i18n for `/social` across all 8 locales
- remove Chat from drawer, merged under Support
- remove Preferences from drawer navigation

### Chores

- bump root and Nitro API package versions to `3.2.0`
- bump nav localStorage key to `v3` to reset cached nav for all users

## 3.2.0 (2026-05-06)

### Features

- add `/social` page with TikTok video embeds, artist credit, copyright notices
- complete i18n for `/social` across all 8 locales
- remove Chat from drawer, merged under Support
- remove Preferences from drawer navigation

### Chores

- bump root and Nitro API package versions to `3.2.0`
- bump nav localStorage key to `v3` to reset cached nav for all users

## 3.1.3 (2026-04-26)

### Chores

- bump root, Nitro API, and NativeScript mobile package versions to `3.1.3`
- align iOS and Android native build metadata with the `3.1.3` release batch
- update `CHANGELOG.md` so `/deploys` reflects the current `3.1.3` release

## 3.1.2 (2026-04-20)

### Features

- add a public `/about` page that introduces PEACE2074, its mission, and the core reading and reflection experience
- include the new About page in public discovery metadata used by the sitemap and AI-facing content index

### Bug Fixes

- update the GitHub releases `/repos` fetch in the admin view to use the current `Islam2074/peace2074.com` repository owner

### Chores

- bump root and Nitro API package versions to `3.1.2`
- align iOS marketing/build versions with the `3.1.2` release batch before native sync

## 3.1.1 (2026-04-18)

### Features

- add locale-prefixed public document URLs so privacy, support, and storefront links resolve per supported language
- refresh localized App Store metadata and release notes for the latest iOS submission-readiness batch

### Bug Fixes

- mark the iOS app as using only exempt encryption for the current standard-crypto configuration

### Chores

- bump root and Nitro API package versions to `3.1.1`
- align iOS marketing/build versions with the current release batch and native sync

## 3.1.0 (2026-04-12)

### Features

- activate the public `/chat` route so community messaging is directly reachable
- update chat route metadata and locale copy to reflect that live chat, rooms, and history are active

### Documentation

- document the Quran ayah hover/tap action menu as a supported interaction contract

### Chores

- bump root and Nitro API package versions to `3.1.0`

## 3.0.0 (2026-04-03)

### Features

- merge mobile branding and icon updates across iOS and Android assets
- add Fastlane metadata and iOS release automation files

### Bug Fixes

- resolve branch merge conflicts for mobile branding sync and iOS project files

### Chores

- bump iOS app `MARKETING_VERSION` to `3.0` for Debug and Release builds

## 0.2.9 (2026-03-16)

### Features

- add blog likes system with heart icons and like counts for all blog posts
- add ReaderStats database schema to track Quran reading analytics per user
- add bilingual (Arabic/English) inspirational blog post: "Light in Darkness: Finding Strength in Difficult Times"
- add Quran list 2-column grid layout with even height cards
- add daily rotating banner messages (7 messages, one for each day of week)
- expand inspirational verses collection to 114 (one verse per surah for complete coverage)
- add reader stats API endpoints for recording and fetching reading analytics
- add Pinia store for managing reader statistics and analytics
- add blog likes API endpoints (`GET /api/blog/likes` and `POST /api/blog/likes`)
- add like toggle functionality requiring authentication with login prompt

### Bug Fixes

- fix Dialog plugin not registered in Quasar configuration
- fix i18n translation key for blog delete button (use `pages.blog.editor.delete`)
- fix corrupted verses.json and restore clean data from backup
- fix verses.json missing from src/app/data/ directory

### Chores

- generate Prisma client for new BlogLike and ReaderStats models
- create server utilities for reader stats operations and analytics
- add service functions for blog likes and reader stats API calls
- create comprehensive reader stats documentation

## 0.2.8 (2026-03-07)

### Features

- add auto-continue feature for Quran recitation - automatically progress through all 114 suras
- add UI toggle switch in playback controls to enable/disable auto-continue
- add localStorage persistence for auto-continue preference (`quran-auto-continue`)
- add automatic sura completion marking when recitation finishes
- add notification "Starting Sura X..." before auto-navigation to next sura
- add full i18n support for auto-continue across all 6 languages (en, ar, he, de, ru, tr)
- add 1-second delay between suras for smooth transitions

### Chores

- bump project version to `0.2.8` in root and Nitro API package manifests

## 0.2.7 (2026-03-03)

### Features

- add prominent Sign Up button to header navigation menu (visible when not authenticated)
- improve user registration discoverability - signup now accessible from main header, not just login page

### Chores

- bump project version to `0.2.7` in root and Nitro API package manifests

## 0.2.6 (2026-03-01)

### Features

- add Ramadan campaign home banner with daily prompts and analytics tracking (`ramadan_banner_view`, `ramadan_cta_click`, `ramadan_daily_prompt_apply`)
- add push notification campaign preset support (`campaign: "ramadan"`) in `/api/push/send`

### Chores

- bump project version to `0.2.6` in root and Nitro API package manifests

## 0.2.4 (2026-02-21)

### Features

- add Turkish (`tr`) locale as a first-class language with UI selector support
- add complete `src/locale/tr.json` translations and register locale across i18n wiring
- add Quran verse deep-link route support in `/quran/{sura}:{ayah}` format (example: `/quran/2:255`)
- add bookmark share/copy action for Quran verse links
- add Bismillah intro clip before user-initiated Quran recitation starts (same reciter source)

### Bug Fixes

- sync missing locale keys in `ar`, `de`, `ru`, and `he` so `pnpm check:locales` passes
- improve bookmark durability by syncing guest bookmarks into authenticated bookmark collections (deduplicated)

### Chores

- bump project patch version from `0.2.3` to `0.2.4` in root and Nitro API package manifests

## 1.1.0 (2025-12-05)

### Features

- add automated versioning with standard-version and GitHub Actions ([4620a34](https://github.com/peace2074/peace2074.com/commit/4620a3479866ef839909ee669e481472434b9c60))

### Bug Fixes

- correct changelog extraction pattern and use pnpm lock file ([e68b021](https://github.com/peace2074/peace2074.com/commit/e68b021707b459de756e0c99af2fcbf29655e034))

### Documentation

- improve release workflow and add versioning guide ([2e0c41f](https://github.com/peace2074/peace2074.com/commit/2e0c41ff90204f9580d23495ddd389d39baeed56))
