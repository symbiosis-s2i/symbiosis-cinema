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

**22 sections**: hero, AI search, Cinema, why, transformation, proof,
platform, features, industries, process, modules, AI, comparison, FAQ,
close.

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
| Without JavaScript | 22 sections, 94 headings, 26,055 chars, 0 hidden |

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
