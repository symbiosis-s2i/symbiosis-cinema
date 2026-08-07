# Hero comps — The Edit Suite

Three compositions for the Symbiosis OS landing page hero, built as real
HTML/CSS rather than rendered images (Recraft V4.1 needs a paid Higgsfield
plan; the remaining models cannot draw interface layouts).

Direction locked by concept-seed roll `b08cf51f`, assigned index 6, confirmed
by the user. Composition is the variable across A/B/C; `comp.css` holds the
palette, type, and timeline primitives fixed so the comparison stays about
layout.

| File | Composition |
|---|---|
| `hero-a.html` | Playhead Dominant — the timeline owns the fold |
| `hero-b.html` | Editorial Split — type leads left, instruments right |
| `hero-c.html` | Program Monitor — the client record leads, timeline supports |

## Running them

```
npx http-server . -p 8903 -d false
# then open /.impeccable/mocks/hero-a.html
```

Served from the repo root, not from this directory — the comps load Geist
from `site/assets/fonts/geist/`.

## Notes

- All copy is real, from PRODUCT.md and the incumbent page. No invented
  metrics, customers, prices, or claims. Demonstration data is labelled
  `примерни данни` in-page.
- Text ramp verified against the ground: 16.1:1, 8.85:1, 5.41:1 — all clear
  WCAG AA.
- `Geist-Variable.woff2` is SIL OFL, v1.7.2, and carries 134 Cyrillic
  codepoints covering Bulgarian.
