# Symbiosis landing page — design record

Records what the page is, where the design came from, what the engineering
pass changed and why, and what is still open. Every number here was measured
in a browser against the built page, not estimated.

---

## 1. Provenance

The design was authored in **Claude Design** and chosen there. This repo
holds the port: the same design, made into a page that can be deployed,
indexed, read by a screen reader, and opened on a phone.

The split is deliberate and worth stating plainly, because it is the reason
the page looks the way it does:

- **Claude Design decided how it looks.** Composition, palette, type scale,
  the hero, the section rhythm, the motion. None of that was re-decided
  here.
- **This pass decided whether it works.** Fonts that carry the weights and
  scripts they claim, contrast that passes, controls a thumb can hit,
  breakpoints that hold, a page that survives JavaScript being off, and a
  transfer size a phone on mobile data will tolerate.

Layout still lives in the 1,376 inline `style` attributes the design shipped
with. Rewriting them into classes would be a redesign wearing a refactor's
clothes, and would put the thing that was approved at risk. They stay.

---

## 2. The design

**Ground** — neutral near-black. `#08080A` at the page level, `#0C0C11` for
panels, `#101016`–`#101018` for lit states. Not navy: the neutral reads
colder and lets the accents carry all of the hue.

**Accents** — a signal palette rather than a single brand colour.

| Token | Use |
|---|---|
| `#A9BCFF` periwinkle | second headline line, active rails, primary emphasis |
| `#8AA6FF` | links, borders on active cards |
| `#5B7BFF` cobalt | the hero glow's core, progress bar start |
| `#7A4DFF` violet | glow secondary, score dial sweep |
| `#FF9B4A` peach | the AI-search track, score dial start |
| `#7DFF9E` mint | positive deltas |

**Text ladder** on `#0C0C11`, with measured contrast:

| Colour | Ratio | Role |
|---|---|---|
| `#F6F6F9` | 18.09 | headings |
| `#C4C4D2` | 11.31 | emphasis body |
| `#A9A9BA` | 8.43 | body |
| `#8F8FA3` | 6.16 | secondary |
| `#88889A` | 5.61 | tertiary |
| `#808092` | 5.04 | quaternary |
| `#7A7A8B` | 4.63 | quiet labels, small print |

The bottom three replaced `#6E6E80` (3.91), `#5C5C6E` (2.98) and `#4D4D5E`
(2.36), which between them appeared 180 times, all of them as `color`. The
ordering of the ladder is preserved, so nothing changed rank.

**Type** — Inter for everything structural, JetBrains Mono for eyebrows,
labels and readouts, Playfair Display italic for exactly one line: the third
line of the `<h1>`, gradient-filled, in both languages.

**Hero** — centred. Three overlapping radial gradients as a light source,
an 88px grid under a radial mask, an eyebrow badge, a three-line headline
at `clamp(2.5rem, 7.2vw, 6.1rem)` with `line-height: .99`, then the lede and
two pill CTAs, then a masked marquee of persona frames.

**23 sections**: hero, Cinema and its run — the vault, the dashboard, the AI
assistant — then AI search, the Cinema audience, the Cinema numbers, why, a
day in your life, transformation, proof, platform, features, everything
else, industries, process, modules, AI models, comparison, FAQ, close.

Cinema leads, which is also the order the navigation lists it in. AI search
sits directly above the "За кого е" audience block.

Moving it there exposed a seam. The audience section was authored to sit
directly under the block above it, so it opens with **zero top padding** and
borrows that block's bottom padding for its breathing room — with a full
section dropped between them, its heading landed hard against the edge. It
has its own top padding now, matching its siblings; the seam itself is
handled the way every other seam on the page is — see §3.8. "A day in your
life" is copy recovered from the deployed page — see §3.11.

**The product is `Symbiosis OS`.** The name appears in full everywhere the
platform is meant: 60 dictionary values across both languages, 47 places in
the markup, and the meta titles in `app.js`. `Symbiosis Cinema` is left
alone — Cinema is a part of the platform, not a second platform, so
"Symbiosis OS Cinema" would be wrong. The rewrite uses a negative lookahead
for exactly that reason, and it never touches `symbiosis.app` or the host
names.

---

## 3. What the pass changed

### 3.1 Fonts

The reference declared Inter at five weights — 300, 400, 500, 600, 700 —
and pointed **all five at the same static Regular file**. Every heading
above 400 was being drawn by the browser's synthetic bold. JetBrains Mono
had the same defect across its two declared weights.

Replaced with real variable faces carrying a genuine `wght` axis, subset to
the 200 characters both dictionaries actually use.

`Instrument Serif`, which the design named for the hero's third line,
**contains zero Cyrillic glyphs** — confirmed with fontTools against the
font binary and again in the browser via `CSS.getPlatformFontsForNode`. Its
`unicode-range` declarations did not even include Cyrillic, so the browser
never attempted it and fell straight through to whatever serif the visitor's
OS happened to ship. On the built page that line now reports **Playfair
Display × 15 glyphs** in Bulgarian and × 13 in English.

Twenty-one characters the design uses as icons — `→ ↗ ≈ ≡ ≤ ≥ ⌘ ▢ ▤ ▲ ▶ ◆
◈ ◉ ◧ ◷ ✎ ✓ ✕ ✦ ✺` — exist in **neither Inter nor JetBrains Mono**. They
were being resolved by the platform, which on iOS and Android turns several
of them into colour emoji. A 21-glyph subset of DejaVu Sans (`SymIcons`,
2,196 bytes) now sits in both font stacks and pins them.

| | Before | After |
|---|---|---|
| Files | 17 | 7 |
| Bytes | 322,272 | 88,204 |
| `@font-face` blocks | 51 | 7 |
| Real weight axes | 0 | 3 |
| Cyrillic in the serif | none | full |

### 3.2 The component runtime

| Removed | Replaced by |
|---|---|
| React 18.3.1 UMD, 142,586 B | — |
| Claude Design runtime, 69,150 B | — |
| 118 `style-hover` attributes | 20 deduplicated CSS rules, each paired with `:focus-visible` |
| 12 `sc-camel-on-click="{{ fn }}"` | `data-act` plus real listeners |
| `sc-camel-view-box` | `viewBox` |
| A `DCLogic` class in a `text/x-dc` script | `app.js`, a plain IIFE |

Behaviour is a straight port: same easing curves, same IntersectionObserver
thresholds and root margins, same durations.

Two things were added rather than ported. `willChange` is now released 1.2s
after each reveal completes — the original set it on all 110 revealed
elements and never cleared it, which keeps 110 compositor layers alive for
the life of the page. And every observer-driven effect now has a
reduced-motion path that paints the final state directly instead of
returning early and leaving the dial reading zero.

### 3.3 Responsive behaviour

The reference had **no CSS media queries at all** — the runtime forbids
stylesheets, so its only breakpoint was a `resize` listener toggling
`display` at 1180px. Two consequences: the header could not collapse until
JavaScript ran, and nothing else adapted except through `clamp()`.

Those toggles are media queries now. Sweeping 24 widths from 320px to 1920px
in both languages then surfaced a real defect:

> **The mobile menu button was off the edge of the screen.** Below about
> 560px the header's right-hand cluster — language tabs, booking button,
> menu button — needs 273px beside a 118px wordmark. At 390px the row ran to
> **425px**, putting the menu button 35px past the viewport. Because `body`
> carries `overflow-x: hidden` there was no scrollbar to reveal it: on a
> phone the entire navigation was simply unreachable.

Fixed by dropping the header's booking button below 560px — the one of the
three that is already repeated inside the menu panel and again in the hero.

That bug is the argument for this pass in one line. It is invisible in a
preview at any single width, invisible in the markup, and invisible to a
check that trusts `scrollWidth`, because the body's overflow guard hides it.
It took an explicit per-element sweep to find. My own first overflow check
missed it too, for exactly that reason — it treated the body guard as
legitimate clipping. The check was wrong before the page was.

Two more came out of review, both from the same root cause — a design that
could not express a breakpoint:

- **The Cinema section held two columns all the way down.** It is the page's
  only grid with a fixed template; every other one uses `auto-fit` and folds
  on its own. At 390px that meant a 148px card beside a 196px one, three
  words to a line. It now collapses below 900px.

- **The sticky slate never stuck, at any width.** `section#cinema` carried
  `overflow: hidden`, which makes it a scroll container, and a scroll
  container is exactly what stops `position: sticky` engaging inside it. The
  card scrolled away with the page and left roughly 500px of empty column
  beside steps 05 and 06. Changed to `overflow: clip`, which clips
  identically without creating a scroll container; `hidden` is still
  declared first so a browser that does not know `clip` keeps the old
  behaviour rather than losing the clip. When the grid stacks, the slate
  drops to `position: static` — pinned in a single column it would sit on
  top of the steps it describes.

Both were present in the reference and inherited by the port. Neither is
visible in a screenshot of a single scroll position.

### 3.4 Accessibility

- **Contrast**: 180 declarations across three grey steps raised to AA.
  Measured **0 failures** at 1440 / 1024 / 768 / 390.
- **Focus**: the reference had **zero** `:focus` rules. There is now a
  visible ring, and all 20 hover states are paired to `:focus-visible` so a
  keyboard reaches what a mouse reaches.
- **Targets**: every control cleared 24×24 (WCAG 2.5.8 AA) already. On
  coarse pointers they now clear 44×44 (2.5.5 AAA). Measured **0 under
  44×44** on a simulated touch device. Citation links are deliberately
  excluded — they are quiet small print, and enlarging them would distort a
  block the design wants recessive.
- **Skip link**: added; it was absent.
- **Translated attributes**: `alt` text and `aria-label`s now swap with the
  language. Previously an English visitor's screen reader still read the
  Bulgarian alt text aloud.
- **Reduced motion**: honoured by the reveal, the parallax glow, the dial,
  the bars and the slate.

### 3.5 Weight

| | Before | After |
|---|---|---|
| Artifact / page | 9,258,485 B | 247,113 B markup |
| Images | 6,265,525 B (4 PNG + 1 JPEG) | 131,982 B (WebP) |
| Fonts | 322,272 B | 88,204 B |
| JS | 296,619 B runtime | 13,750 B + 91,157 B dictionary |
| Transfer, gzipped | — | **≈ 287 KB total, ≈ 158 KB to first paint** |

The 2 MB persona PNGs were 1024×1536 rendering into a 400px card. They are
800px WebP now. The 544×544 logo PNG was being drawn at 28×28.

### 3.6 Markup and indexing

- Bulgarian stays in the markup, so with JavaScript off the page still
  delivers **26,055 characters, 94 headings and all 22 sections**, and
  **nothing is hidden** — the reveal only conceals content when it can prove
  it is able to reveal it again.
- Canonical, `og:*`, `twitter:card`, `theme-color`, and `hreflang`
  alternates for `bg`, `en` and `x-default`, all pointed at
  `symbiosis.sell2inspire.agency`.
- Both scripts deferred, so neither blocks parsing; deferred scripts run in
  document order, so the dictionary is always in place before `app.js` reads
  it.
- `scroll-padding-top: 92px` so anchored sections clear the fixed header.

### 3.7 Ambient drift

Two fixed layers of very soft brand light sit behind the whole page, moving
slowly enough to register as depth rather than as animation. Both live on
`body`, below the content wrapper, so nothing overlays text — the contrast
figures are unchanged. `position: fixed` plus `transform` keeps them on the
compositor: no layout, no cost on scroll. The two durations, 67s and 89s,
are not multiples of each other, so the combined pattern takes about twenty
minutes to repeat.

The wrapper used to paint its own opaque ground, which would have covered
them, and the nine banded sections used to be an opaque `#0b0b0f`. `body`
carries the ground colour now, and the bands are a 1.4% white wash instead —
visually the same value, but the drift shows through.

Measured at 1440×800: **55% of pixels change over nine seconds, average
delta 11/255**. Visible as movement, nowhere near enough to distract.

This turned up a real bug in the reduced-motion block. `*` does not match
pseudo-elements, so `* { animation-duration: .01ms }` left both drift layers
running at full speed for a visitor who had asked for no motion —
`document.getAnimations()` confirmed it. The block now names `*::before` and
`*::after` too, and reports an empty list under `prefers-reduced-motion`.

### 3.8 Section seams

The page announced every section change with a hard edge, usually two:

- **Twenty 1px hairlines.** Nine sections alternated a flat `#0b0b0f` band
  against the `#08080a` ground, each ruled top and bottom. A white rule at
  7% opacity over near-black is a **19/255 step** — against about 2 for the
  fill change on its own, so the rule was doing nearly all the shouting.
- **Four full-bleed washes cut square.** The decorative radial glows live
  inside sections that clip, so a glow still at full strength when it
  reached the section edge was sliced off flat — a hard horizontal line
  exactly where the subject changes.
- **Three 2px accent bars** pinned to a section's top edge: the same hard
  line in a brighter colour.

Now: the bands are gradients that start and end on the ground colour, so the
value rises over the first stretch and falls again over the last; the washes
carry a vertical mask that fades them before they reach an edge; and the
accent bars are 120px glows with no edge of their own.

Measured by sampling the median luminance of every pixel row across the full
page width at each of the 22 section boundaries — a median, so a glyph or a
card cannot masquerade as a seam. **Twenty-one of twenty-two now step by 1/255
or less**, which is the `#08080a → #0b0b0f` ramp resolving in 8-bit and is
not visible. The twenty-second is a card's own bottom edge that happens to
land on a section boundary, and cards are meant to have edges.

### 3.9 Tile rows

Sixteen of the page's tile groups paint their own gap: a 1px gap over a
light background is what draws the hairline between cells. As grids, any
item count that does not divide by the column count leaves painted tracks
over — and a painted empty track looks exactly like an empty tile. Three
statistics in a two-column grid left one; four list items in a three-column
grid left two. At 1440px eleven groups were showing at least one.

They are wrapping flex rows now, `flex: 1 1 var(--fb)` carrying each
group's original minimum width so the wrap points are unchanged. A flex row
has no tracks, so the last row's items grow to fill it and there is nothing
left over to paint. Swept 320px to 1920px: **no painted empty cells at any
width**.

### 3.10 The mark, and the icon set

The logo that shipped in the Claude Design bundle was a **zoomed crop of the
mark's centre**. The outer connector ring — four dots joined by bracket
lines — had been cut away entirely, and what remained ran flush to all four
edges of its 544px canvas with a fraction of a pixel clipped on each side.
It read as a logo photographed too close, because it was.

The complete mark is now the source. It arrives on white, so the derived
assets mask the disc to a circle at centre (538, 538.5) with radius 528 —
three pixels inside the measured edge, which drops the JPEG fringe — and
leave everything outside transparent. A white square behind a round logo is
very visible on a near-black page. Both derivatives sit inside their box
rather than flush to it: `symbiosis-mark.webp` is a 160px box with the disc
at 141px, `favicon-64.png` a 64px box with the disc at 60px.

**29 icons**, drawn as inline SVG rather than typed as emoji. An emoji is a
colour glyph the platform owns: it cannot take a brand colour, and it renders
as a different picture on iOS, Android and Windows. These are hairline
strokes at 1.6px in `currentColor`, each in the accent its own section
already uses — peach in AI search, periwinkle everywhere else — sitting in
the same rounded tile the page uses for its list markers.

| Section | Count |
|---|---|
| The seven changes | 7 |
| AI search features | 6 |
| Industries | 8 |
| Everything else in your account | 8 |
| Cinema, six steps | 6 |
| Cinema audience | 5 |
| Process, six steps | 6 |
| The three AI columns | 3 |
| A day in your life, before / with | 2 designs × 3 moments |

Two of the audience marks are deliberately the same drawings as the
industries grid further down: "Маркетинг агенции" and "Консултанти и
треньори" name the same reader in both places, and a second icon for the
same audience would imply they were two different ones.

Four places were left without one, on purpose:

- **The 28 modules.** Each cell is 240px wide with a 0.94rem title. Twenty-eight
  more marks in that grid stops being a system and becomes noise.
- **The six statistics and the three results cards.** A card anchored by
  `106`, `1 200` or `+34%` at 3.2rem already has its mark. An icon beside it
  competes with the number for the same job.
- **The comparison lists.** They already carry `□` and `✓` per row.
- **The fifteen solution chips and the FAQ.** Too small, and the accordion has
  its own open/closed marker.

### 3.11 Copy

**Recovered from the deployed page.** Its dictionary carries 62 keys the new
design had no home for. Most are labels for a mock dashboard the design
deliberately dropped — `PRODUCT.md` lists fake dashboard charts as an
anti-reference, so they stay dropped. Two things were worth keeping and are
now in the page: the **"Един ден в живота ви"** section, three time-stamped
before/after moments at 08:30, 13:00 and 19:30, which is the strongest
narrative copy the product has; and `cn.flow.title`, a heading the Cinema
steps were missing.

**Typography.** The copy used a spaced hyphen as a dash throughout — 103
Bulgarian entries and 60 English. Bulgarian sets an appositive dash as an en
dash; English convention here is the em dash. All 140 occurrences were
checked first to confirm none is a numeric range or a minus sign.

**One claim was corrected.** `tr.sub` read *"Не обещания – числа. Ето
средните резултати при собственици, въвели Symbiosis в първите 3 месеца"* —
asserting measured averages across real customers. `PRODUCT.md` records that
there are no documented customer success metrics yet, and the English for
the same key already hedged it as "a typical picture". Both languages now
say plainly that the figures are an illustrative scenario. The numbers
themselves are unchanged; only the claim about where they come from.

**Nine other fixes**, each a real defect rather than a preference:

| Key | What was wrong |
|---|---|
| `st.s4.body` | "wins the deal 21× more often" with the baseline missing — 21× more often *than what* |
| `cn.s3.b` | four goals in Bulgarian, five in English; and two consecutive sentences opening "Избирате" |
| `cmp.sub` | English said the section compares "content"; it compares clients |
| `cta.sub` | English dropped the two sentences that answer "what does this cost me" |
| `top.f1.b` | English ended on a generic summary instead of the Bulgarian's actual point |
| `ai.sub` | "инвестиция" standing in for "цена"; English had lost "monthly" |
| `ind.i3.b` | "последванията" is not a Bulgarian word in this sense |
| `pq.sub` | "докато живеете" — "while you are alive" |
| `cn.chat.a1` | "възвръщаемостта от внедряване" missing its definite article |

Plus `as.f2.b` ("0-100" is a range and takes an en dash), `tr.before.5a`
("0 clarity" reading oddly against "Full clarity"), four entries with
trailing whitespace and two straight quotes.

The Bulgarian lives in both the markup and the dictionary, so after every
copy change the markup is re-synced from the dictionary — the two cannot
drift.

**Not reachable.** The live URL is blocked by this environment's egress
proxy, so "the current live site" here means the deployed artifact's own
extracted source and dictionaries, which this repo holds. If the live page
has been edited since, those edits are not visible from here.

---

## 4. Verified

Measured on the built page, served over HTTP, fonts loaded:

| Check | Result |
|---|---|
| Contrast failures at 1440 / 1024 / 768 / 390 | **0** |
| Horizontal overflow, 24 widths × 2 languages | **0 of 48** |
| Menu button reachable, every width below 1180px | **yes** |
| Targets under 44×44, coarse pointer | **0** |
| Fonts resolving | Inter ×517, JetBrains Mono ×142, Playfair Display ×3 |
| Cyrillic serif line | Playfair Display, 15 glyphs |
| Untranslated nodes after EN swap | **0 of 550** |
| Console errors / failed requests | **0** |
| Images with no `alt` | **0** |
| Links with no accessible name | **0** |
| Heading-level skips | **0** |
| Duplicate `id` attributes | **0** |
| `<h1>` count | **1** |
| Targets under 24×24, any pointer | **0** |
| Without JavaScript | 22 sections, 94 headings, 26,055 chars, 0 hidden |
| Cinema slate pins and releases with its grid | **yes**, 900px and up |
| Cinema grid single-column below 900px | **yes** |
| Links with a computed underline | **0** |

---

## 5. Open

Recorded, not fixed. Each is a decision that belongs to the owner rather
than a defect.

1. **The primary CTA is below the fold at 1440×900 in Bulgarian.** The
   headline is `clamp(2.5rem, 7.2vw, 6.1rem)` over three lines, and
   Bulgarian wraps it to four. Faithful to the reference, and the reference
   is what was approved — but it costs the first viewport its action.
   Tightening the clamp ceiling to about `5.2rem` would recover it.

2. **"до −70% на месец"** in the comparison section is a cost claim. It
   compares subscription totals rather than reporting a customer outcome, so
   it does not fall under the no-unverified-results rule in `PRODUCT.md` —
   but a visitor will read it as a promise, and it should have a basis on
   file.

3. **Six sections are equal-tile grids.** Features, industries, modules, AI,
   platform and proof all use `repeat(auto-fit, minmax(…, 1fr))`. It reads
   as consistency at a glance and as sameness by the third one.

4. **The citation block** renders 28px-tall links. Compliant, but it is the
   one place where "quiet by design" and "hard to hit" are the same
   decision.

5. **Layout is still inline.** Deliberate, and recorded here so the next
   person knows it was a decision rather than an oversight. If the design
   ever needs real change rather than correction, extracting a token layer
   is the first move.
