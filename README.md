# peace2074.com

A Nuxt 3 website to share faith-driven knowledge: Qur'an, Allah’s Beautiful Names, remembrance (tasbeeh), and peaceful guidance.

## Why this website exists

To spread authentic, peace-centered religious knowledge online — easy to access, multilingual, fast, and ad‑free.

## What you’ll find here

- Qur'an reader and chapters
- Allah’s Beautiful Names (Asma’ul Husna)
- Tasbeeh counter for daily remembrance
- Miracles and reflections
- Multilingual UI (English, Arabic, German, Russian)
- Installable PWA with offline support
- Privacy and Terms pages

## Principles

- Accuracy and respect for the tradition
- Accessibility and clarity for all audiences
- No ads, tracking kept to a minimum
- Open to community feedback and improvement

## Tech stack (brief)

- Nuxt 3 + Vite (SSR, file-based routes)
- Nitro server with file-based APIs under `server/api/*`
- Pinia for state (persisted)
- UnoCSS + Quasar UI
- i18n and PWA
- Shared data under `shared/data/*` (usable on client and server)

See `.github/copilot-instructions.md` for architecture and developer workflow details.

## Getting started (local)

1) Install dependencies
	- `pnpm install`
2) Start the dev server
	- `pnpm dev`

Environment tips:
- Set `SITE_BASE_URL` for correct canonical links and PWA behavior.
- For auth-related endpoints (optional), see envs in the docs and `server/plugins/passport.ts`.

## Contributing

Issues and pull requests are welcome. Please keep changes respectful, focused, and aligned with the project’s purpose: sharing peaceful, authentic knowledge.

## Acknowledgements

Created by peace2074. Assisted by GitHub Copilot.

## License

MIT — see `LICENSE`.
