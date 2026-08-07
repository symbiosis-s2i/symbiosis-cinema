# Design

<!-- impeccable:design-schema 1 -->

Recorded from the built surface at `site/`, not from intention. Every value
below was measured in the rendered page at 1440px unless stated otherwise.

**World:** The Edit Suite. Direction seed `b08cf51f`, candidate 6, approved
composition `.impeccable/mocks/hero-b.html`.

**Thesis:** One time axis, many tracks, one playhead — a service business read
as a timeline. It refuses the grid of equal feature tiles this category ships,
so hierarchy comes from the form rather than being applied on top of it.

## Colors

Three surface steps carry all depth. There are no shadows anywhere in the
built page — `box-shadow` computes to `none` on every element.

| Token | Value | Role |
|---|---|---|
| `--ground` | `#0E1420` | Page ground. Deep navy, deliberately not neutral near-black |
| `--panel` | `#141B2A` | Panels, cards, timeline bodies |
| `--panel-lit` | `#1A2233` | Rulers, scrub bars, hover, the "as it is now" column |
| `--cobalt` | `#2B4EE6` | Primary action only |
| `--cobalt-lit` | `#5B7BFF` | Playhead, lit block, joints, focus ring, hover |
| `--periwinkle` | `#8FA6FF` | Secondary emphasis, headline second clause, links |
| `--text` | `#E8ECF4` | Headings and primary text — 16.1:1 on ground |
| `--text-2` | `#A8B4CC` | Body — 8.85:1 |
| `--text-3` | `#7E8CA8` | Labels, captions, quiet states — 5.41:1 |
| `--rule` | `rgba(201,211,232,0.14)` | Structural divisions between panels |
| `--rule-soft` | `rgba(201,211,232,0.07)` | Divisions inside a panel |

**Colour strategy: Restrained.** A neutral ramp plus exactly one accent. The
cobalt is taken from the Symbiosis logo mark. Nothing else on the page is
saturated. Every text step clears WCAG AA against every surface it sits on:
**0 failures across 210 visible text nodes** at 1440px, each foreground
composited over the first fully opaque ancestor background.

Dark was chosen from the use scene, not the category: the visitor is a service
owner evaluating software mid-afternoon, and the instrument-panel world is
legible under office light without the glare a light ground would give a page
this dense with rules.

## Typography

**One face: Geist Variable**, self-hosted, SIL OFL v1.7.2, weights 100–900 in a
single 68 KB file. It carries 134 Cyrillic codepoints and covers Bulgarian
completely — the reason it displaced Instrument Serif, which carries zero.

There is no second family. No monospace, no serif. Measured at 1440px:

| Role | Size | Weight | Tracking |
|---|---|---|---|
| h1 | 55.44px (`clamp(34px, 3.85vw, 62px)`) | 480 | −0.032em |
| h2 | 41.76px (`clamp(27px, 2.9vw, 44px)`) | 480 | −0.028em |
| h3 | 19.44px (`clamp(18px, 1.35vw, 21px)`) | 520 | −0.018em |
| Body / lede | 15.84px | 400 | −0.008em |
| Button | 13.5px | 530 | −0.005em |
| Label | 11px | 550 | **+0.1em**, uppercase |

Three tiers, deliberately: display, section head, and interface. The uppercase
label is the only positive-tracked style and is reserved for lane names, field
names and timeline day markers — never for a kicker above a heading.

**Weights are non-integer on purpose.** 480 and 520 and 530 sit between Geist's
named cuts and are only reachable because the variable font is used as a
variable font. Rounding them to 400/500/600 changes the page's voice.

### Corner and line language

| | Value |
|---|---|
| Panels, buttons | `4px` |
| Chips, blocks, inner controls, timeline events | `2px` |
| Lane dots, queue dots | `50%` |
| Borders | **`1px` only** — no other width exists in the built page |
| Shadows | **none** |

Panels subdivide with internal hairlines rather than gaps. Cards never nest —
a panel's children are separated by `--rule-soft`, not wrapped in their own
borders.

## Components

### Timeline primitives

The load-bearing components. Everything else on the page defers to them.

- **`.tl`** — the timeline shell. Declares `--lane-gutter: 132px`, the fixed
  width of the lane-name column. This must stay declared: consumers in
  markup and JS previously fell back to `0px` while CSS fell back to `132px`,
  which put the playhead inside the label column at every scrub value.
- **`.tl__ruler`** — 30px, `--panel-lit`, hairline ticks, major ticks at
  double height carrying timecode labels.
- **`.tl__lane`** — a grid of `var(--lane-gutter) 1fr`. Minimum 48px.
- **`.tl__block`** — 24px tall, absolutely positioned by percentage of the
  track. **Sized to its own copy**: blocks are checked for clipping at 390 and
  1440 in both languages, because Bulgarian runs ~10–15% longer than English.
- **`.tl__head`** — the playhead. 1px, `--cobalt-lit`, square 9px head on the
  ruler. Travel is `calc(gutter + (100% − gutter) × v)` — the percentage is of
  the *track*, not the lane, or it runs past the right edge at 100.
- **`.joint`** — a 1px drop with a 6px terminal dot, marking one event handing
  off to the next. This is the connection argument made visible, so the dot is
  not optional decoration. **In `.tl--stack` the joint must be
  `position: relative`, never `static`:** it has to stay in the flex flow *and*
  remain a containing block, or the `::after` dot resolves against
  `.tl__lanes` and all of them land on one point outside the panel. A rule
  that merely exists for the stacked case is not the same as one that
  resolves — that error passed every automated check twice.
- **`.tl--plan`** — the six-lane variant used by `#process`. Lane gutter drops
  to 46px (it carries only a step number), blocks grow to hold a heading and a
  paragraph, and each block's `left` encodes its place in the sequence with
  deliberate overlap, the way a real plan reads. The axis carries no time
  units, because none are documented in PRODUCT.md; its two ruler labels name
  the ends of the sequence, not durations.
  **Its blocks are `position: relative`, and `.tl--plan` sets no `--lane-h`.**
  Block height is content-driven and varies with viewport width and language,
  so a fixed lane height is a guess no set of breakpoints can track: the first
  build of this variant pinned 92px/116px and the blocks occluded each other
  from 641–1220px while card 06 was clipped by `.tl { overflow: hidden }` at
  every desktop width including 1440. Relative positioning keeps the block in
  flow so the lane grows to meet it, while `left` still does the horizontal
  work. Measuring x-positions alone will not catch this — measure vertical
  fit across the range, in both languages.
- **`.tl--stack`** — below 640px every timeline becomes a vertical sequence.
  A horizontal timeline squeezed onto a phone clips its labels; this is not
  optional and applies to **every** `.tl`, not just the hero's.

**Exactly one block is lit at a time** — the one under the playhead. Lighting
every passed block floods the instrument and loses the image of the head
landing on a single event.

## Spacing

`--section-y: clamp(64px, 8vw, 128px)`, computing to 115.2px at 1440. Measured
section padding-tops in the built page: `115.2px`, `129.6px`, `79.2px`, `0px`.

**Known weakness, recorded rather than hidden:** six of nine sections share the
same 115.2px and every section background is `transparent`. The page has one
rhythm token where it should have a range. The finish reviewer ruled this
non-blocking but flagged that it compounds with the tile-grid problem below.

## Motion

Four durations exist: `0.12s` (playhead travel), `0.2s` (hover, colour),
`0.3s` (block state), `0.25s` (disclosure markers). Easing is
`cubic-bezier(0.16, 1, 0.3, 1)` — exponential ease-out from an already-visible
default.

**One authored moment: the playhead scrub.** A native `input[type=range]`, so
it is keyboard-operable without custom handling — `Home`, `End` and arrows all
work. There are no scroll-reveal animations on this page; nothing is hidden
waiting to appear.

`prefers-reduced-motion: reduce` collapses every duration to 0.01ms.

## Accessibility

Binding at WCAG 2.1 AA, and met — measured at 1440px and 390px, in both
languages: 0 contrast failures across 210 visible text nodes; 0 of 37
interactive elements under 44×44; one `h1`; no skipped heading levels; no
images without `alt`; no horizontal overflow.

Both numbers above were wrong in the first draft of this file — it claimed
738 text nodes (the count from the page this replaced) and a clean target
sweep that had actually been measured against a laxer width threshold, while
three controls sat under 44px wide. A wrong number here is worse than a
visual defect, because later passes cite this section as clearance. Re-measure
rather than copying these forward.

- **Focus is defined, not inherited.** `:focus-visible` draws a 2px
  `--cobalt-lit` outline at 3px offset. Never rely on the user agent.
- **`scroll-padding-top: 76px`** so deep links clear the sticky header.
- **The mobile menu closes on Escape** and returns focus to its trigger;
  `aria-expanded` and `aria-controls` are both set.
- **Bilingual includes the accessibility layer.** `data-i` swaps text;
  `data-ia="attr:key"` swaps `aria-label` and `alt`. A page whose visible copy
  translates but whose screen-reader layer does not is monolingual.

## Content and claims

- **No first-party performance metrics.** `PRODUCT.md` records that none are
  documented. Third-party statistics carry a named, linked source.
- **Demonstration data is labelled** `примерни данни — не са резултати на
  клиент` in-page, in the same viewport as the data it describes.
- **Capabilities listed must appear in PRODUCT.md's confirmed set.** Roadmap
  items and unbacked quantitative claims do not ship.

## Known open work

Recorded so the next pass starts from truth rather than rediscovery:

1. **The thesis governs 3 of 9 sections.** The hero, `#compare` and
   `#process` all position items against a shared axis, so a block's `left`
   means something because another block sits elsewhere on the same measure.
   `#process` earned this: it was a card grid with a marker in each corner,
   which failed the test *remove the markers and the layout is unchanged*.
   It is now a six-lane plan whose blocks step right monotonically from
   "Начало" to "Първи резултати". The remaining six sections (`.cols`,
   `.cites`, `.people`, two accordions, the close) are still equal-tile grids
   or plain type — that is the honest remaining gap.
2. **Section rhythm is a single token** — see Spacing above.
3. **Dead CSS:** `.panel`, `.panel__head`, `.chip` and `.split` are defined
   and used zero times. (The `.step` / `.steps` / `.track` card-grid rules the
   plan timeline replaced were deleted rather than left commented out.)
4. **Booking is wired.** All three primary CTAs point directly at
   `https://portal.sell2inspire.agency/book/free-consultation`, confirmed by
   the client. No in-page `#request` anchors remain: one label, one
   destination, one behaviour.
