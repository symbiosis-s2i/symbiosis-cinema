# Brand source assets

Full-resolution originals, kept out of `site/` so the deploy root contains
only what the page actually loads.

| File | Origin | Used by |
|---|---|---|
| `persona-anna.png` (1536×1024) | Claude Design bundle | `site/assets/img/persona-anna.webp`, 742px wide |
| `persona-kaloyan.png` (1024×1536) | Claude Design bundle | `site/assets/img/persona-kaloyan.webp`, 742px wide |
| `persona-katerina.png` (1024×1536) | Claude Design bundle | `site/assets/img/persona-katerina.webp`, 742px wide |
| `symbiosis-logo-544.png` (544×544) | Claude Design bundle | nothing — the page draws the mark as inline SVG |
| `sell2inspire-mark-96.jpg` (96×96) | Claude Design bundle | nothing |

The three persona portraits are approved brand assets and the page's only
image-native content. Re-encode from these rather than from the WebP if the
render size ever changes; the WebP is already at 2× its largest render and
has no headroom left.

Conversion used Chromium's WebP encoder at quality 82 (no `sharp`, no
Pillow, and the bundled ffmpeg has no PNG decoder).
