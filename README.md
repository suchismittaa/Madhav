# Madhav


## Redesign notes
- Design tokens (Teal `#004C56`, Gold `#C5A15B`, Amethyst `#48204F`, Ivory `#F3EBDD`) live at the top of `src/index.css` and in `tailwind.config.js`.
- Shared UI (toasts, in-app confirm dialog, reading toggle, decorative images): `src/ui.jsx`. Asset map: `src/assets.js`.
- Content provenance: `src/content/provenance.js`. Review log: `CONTENT_CHANGES.md`. Assets: `ASSETS.md`.
- Reminders (4 optional, quiet hours): `src/jaapTools.jsx`.
- Tests (with `npm run build` and `npx vite preview --port 4173` running): `python tests/e2e_library.py`, `python tests/e2e_jaap.py`, `python tests/e2e_redesign.py`.
