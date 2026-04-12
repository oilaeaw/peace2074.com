# Quran Ayah Hover Menu

## Purpose

The Quran detail experience includes an ayah-level action menu that appears near a verse.
This is a deliberate user-facing feature and must be preserved unless it is replaced by an equivalent verse-action interaction.

## Source of truth

- Main implementation: `src/pages/quran/[id].vue`
- State and positioning: `hoverWidgetVisible`, `hoverWidgetVerse`, `hoverWidgetPosition`, `getHoverWidgetStyle()`
- Triggers: `onVerseMouseEnter`, `handleVerseTap`, `handleVerseDoubleClick`

## Current behavior contract

### Reader layout

- Desktop/pointer devices: long hover on an ayah shows the menu.
- Touch/coarse-pointer devices: tapping an ayah opens the menu.
- Double-clicking an ayah also opens the menu and can trigger verse playback behavior.

### Native layout

- Desktop/pointer devices: long hover on an ayah shows the menu.
- Touch/coarse-pointer devices: tapping an ayah opens the menu.
- Double-clicking an ayah also opens the menu and can trigger verse playback behavior.

### Mushaf layout

- Touch/coarse-pointer devices: tapping an ayah opens the menu.
- On small coarse-pointer devices the action card is docked near the bottom using `shouldDockAyahActionCard()`.

## What the menu provides

The menu currently exposes verse-adjacent controls such as:

- play / resume
- pause
- restart from current verse
- bookmark verse
- share verse
- scroll to top
- go home
- close menu

These actions are part of the Quran reading UX and should remain easily reachable from the verse context.

## Change policy

Do **not** remove this menu silently.

If you need to redesign it:

1. preserve equivalent verse-level actions,
2. keep both desktop and touch access paths in mind,
3. update this document,
4. update any related tests/selectors if the DOM structure changes.

## Why this matters

The menu is a fast-access surface for verse interactions while reading. Removing it without replacement would regress discoverability and slow down bookmark/share/play workflows.
