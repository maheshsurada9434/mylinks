# Contributing to mylinks

Thanks for helping. mylinks has no dependencies and no framework, so you only need Node 18+ and a browser.

```bash
git clone https://github.com/<you>/mylinks
cd mylinks
node scripts/build.mjs
# open dist/index.html, or serve dist/ to try the editor:
cd dist && python3 -m http.server 8000   # then visit http://localhost:8000/editor/
```

## Where things live

- **`src/render.js`** – the page template, themes and icons. Used by both the build and the editor, so a change shows up in both.
- **`editor/index.html`** – the no-code editor.
- **`scripts/build.mjs`** – writes `dist/`.

## Adding a theme

Add an entry to `THEMES` in `src/render.js`: a Google Font, colour variables and a background. Check it in light and dark surroundings, on a 360px-wide phone, and with a highlighted link. Include a screenshot in your PR.

## Guidelines

- Keep the published page fast: no JavaScript frameworks, no third-party trackers.
- Escape everything that comes from `profile.json` (`esc()` and `safeUrl()` exist for this).
- Icons must be simple generic glyphs, not copies of brand logos.
- Write UI text in plain, friendly sentence case.
- One change per PR, with a screenshot if it changes how something looks.
