# Symbiosis OS landing page — extracted source

This is the Claude Design artifact `Symbiosis_OS_standalone.html` unpacked into
editable files. It is the **incumbent** page, imported as-is so it can be put
under version control, measured, and diffed. It is not the redesign.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page template (markup, inline CSS, and the `text/x-dc` component script holding all interaction logic) |
| `assets/img/` | 4 PNG + 1 JPEG. The three persona photographs are approved brand assets |
| `assets/fonts/` | 17 woff2 files backing 51 `@font-face` blocks: Inter, JetBrains Mono, Instrument Serif |
| `assets/js/i18n-*.js` | BG/EN dictionaries, 601 keys each, merged at runtime into `window.I18N` |
| `assets/js/dc-runtime.js` | Claude Design component runtime |
| `assets/js/react*.js` | React 18.3.1 UMD |

## Running it

```
npx http-server site -p 8901
```

## Changes made during extraction

Only what was needed to make the bundle run from the filesystem:

1. Asset UUID references in the template rewritten to relative `./assets/...` paths.
2. `dc-runtime.js` React URLs repointed from `unpkg.com` to the local copies.

No markup, style, copy, or logic was altered. Verified byte-for-byte equivalent
in behaviour: `scrollHeight` 26,363px at 1440px and 16/16 images resolving,
matching the original bundle exactly.

One `unpkg.com` reference remains in `dc-runtime.js` for `@babel/standalone`.
It is never fetched — the page ships no `text/babel` scripts.
