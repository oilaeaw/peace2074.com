# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.2.4 (2026-02-21)

### Features

- add Turkish (`tr`) locale as a first-class language with UI selector support
- add complete `src/locale/tr.json` translations and register locale across i18n wiring

### Bug Fixes

- sync missing locale keys in `ar`, `de`, `ru`, and `he` so `pnpm check:locales` passes

### Chores

- bump project patch version from `0.2.3` to `0.2.4` in root and Nitro API package manifests

## 1.1.0 (2025-12-05)

### Features

- add automated versioning with standard-version and GitHub Actions ([4620a34](https://github.com/peace2074/peace2074.com/commit/4620a3479866ef839909ee669e481472434b9c60))

### Bug Fixes

- correct changelog extraction pattern and use pnpm lock file ([e68b021](https://github.com/peace2074/peace2074.com/commit/e68b021707b459de756e0c99af2fcbf29655e034))

### Documentation

- improve release workflow and add versioning guide ([2e0c41f](https://github.com/peace2074/peace2074.com/commit/2e0c41ff90204f9580d23495ddd389d39baeed56))
