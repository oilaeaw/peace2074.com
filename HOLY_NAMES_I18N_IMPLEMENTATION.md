# Holy Names Multi-Language Support Implementation

## Overview

Added multi-language support for the 99 Holy Names of Allah using vue-i18n. The Arabic names remain constant across all languages, while the transliterations and meanings are now translatable.

## Changes Made

### 1. Updated Component Structure (`src/views/holynames.vue`)

- Changed the `HolyNameI` interface to use translation keys instead of hardcoded strings:

  ```typescript
  interface HolyNameI {
    name: string; // Arabic name (constant)
    text: string; // Latin transliteration (constant)
    transliterationKey: string; // i18n key for translation
    meaningKey: string; // i18n key for meaning
  }
  ```

- Updated all 99 names to reference i18n keys:

  ```typescript
  {
    name: 'الرَّحْمَنُ',
    text: 'Ar-Rahman',
    transliterationKey: 'holyNames.1.transliteration',
    meaningKey: 'holyNames.1.meaning'
  }
  ```

- Updated template to use `$t()` function for translations:
  ```vue
  <span class="transliteration">{{ $t(one.transliterationKey) }}</span>
  <span class="meaning">{{ $t(one.meaningKey) }}</span>
  ```

### 2. Added Translation Keys to All Locale Files

Created and ran a Node script (`scripts/add-holy-names-i18n.cjs`) that:

- Added `holyNames` object to all 5 locale files (en, ar, de, ru, he)
- Populated each with 99 numbered entries containing `transliteration` and `meaning` fields
- Currently all locales have English text (ready for translation)

Example structure in `src/locale/en.json`:

```json
{
  "holyNames": {
    "1": {
      "transliteration": "The Most Merciful",
      "meaning": "The Most Compassionate"
    },
    "2": {
      "transliteration": "The Most Gracious",
      "meaning": "The Bestower of Mercy"
    },
    ...
  }
}
```

### 3. Added Page Title/Subtitle Translations

Added two root-level translation keys to all locale files:

- `"The 99 Holy Names of Allah"` - Page title
- `"Asma' Allah Al-Husna"` - Subtitle

## How It Works

1. When the user selects a language in settings, vue-i18n's `locale` changes
2. The `$t()` function automatically looks up the translation for the current locale
3. Arabic names and Latin transliterations (`name` and `text` fields) remain constant
4. Only the English transliterations and meanings change based on selected language

## Current State

✅ Infrastructure complete - All 99 names are now translatable
✅ English translations added to all fields
⚠️ Arabic, German, Russian, Hebrew locales currently contain English text
⚠️ These files need proper translations for their respective languages

## Next Steps (Translation Needed)

To complete multi-language support:

1. **Arabic (src/locale/ar.json)**: Translate meanings to Arabic
2. **German (src/locale/de.json)**: Translate to German
3. **Russian (src/locale/ru.json)**: Translate to Russian
4. **Hebrew (src/locale/he.json)**: Translate to Hebrew

Each file needs translations for 99 x 2 fields (transliteration + meaning) = 198 strings.

## Files Modified

- `src/views/holynames.vue` - Component refactored for i18n
- `src/locale/en.json` - Added holyNames with English translations
- `src/locale/ar.json` - Added holyNames structure (needs Arabic translation)
- `src/locale/de.json` - Added holyNames structure (needs German translation)
- `src/locale/ru.json` - Added holyNames structure (needs Russian translation)
- `src/locale/he.json` - Added holyNames structure (needs Hebrew translation)
- `scripts/add-holy-names-i18n.cjs` - Script to populate translation files

## Testing

To test the feature:

1. Run `pnpm dev` to start the development server
2. Navigate to `/holynames`
3. Change language in settings
4. Verify the meanings update (currently will show English for all languages)
5. Once translations are added, each language should show appropriate text

## Benefits

- Fully internationalized holy names display
- Easy to add new languages in the future
- Consistent with the app's existing i18n architecture
- Arabic names preserved across all locales
- Maintainable translation structure
