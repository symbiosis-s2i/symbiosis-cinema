# Brand source assets

Full-resolution originals, kept out of `site/` so the deploy root contains
only what the page actually loads.

| File | Origin | Used by |
|---|---|---|
| `symbiosis-logo-source-1080.jpg` (1080×1080) | supplied by the owner | the master - everything below derives from it |
| `symbiosis-logo-1080.png` (1080×1080) | derived | transparent master, disc masked out of the JPEG |
| `persona-anna.png` (1536×1024) | Claude Design bundle | `site/assets/img/persona-anna.webp`, 800px wide |
| `persona-kaloyan.png` (1024×1536) | Claude Design bundle | `site/assets/img/persona-kaloyan.webp`, 800px wide |
| `persona-katerina.png` (1024×1536) | Claude Design bundle | `site/assets/img/persona-katerina.webp`, 800px wide |
| `sell2inspire-mark-96.jpg` (96×96) | Claude Design bundle | `site/assets/img/sell2inspire-mark.webp`, 64px |

## The logo

The version that shipped in the Claude Design bundle (`symbiosis-logo-544.png`,
now deleted) was a zoomed crop of the mark's centre: the outer connector ring -
four dots joined by bracket lines - had been cut away entirely, and the central
swirl ran edge to edge with a fraction of a pixel clipped on all four sides. It
read as a logo photographed too close.

`symbiosis-logo-source-1080.jpg` is the complete mark. It arrives on a white
ground, so the derived assets mask the disc to a circle at centre (538, 538.5)
with radius 528 - three pixels inside the measured edge, which drops the JPEG
fringe - and leave everything outside it transparent. A white square behind a
round logo is very visible on a near-black page.

Derived, both with room around the disc rather than flush to the box:

- `site/assets/img/symbiosis-mark.webp` - 160px box, disc at 141px
- `site/assets/img/favicon-64.png` - 64px box, disc at 60px

## Notes

The three persona portraits are approved brand assets and the page's only
image-native content. Re-encode from these rather than from the WebP if the
render size ever changes; the WebP is already at 2× its largest render and has
no headroom left.

Conversion uses Chromium's encoders (no `sharp`, no Pillow, and the bundled
ffmpeg has no PNG decoder). WebP quality 82 for the portraits, 95 for the mark.
