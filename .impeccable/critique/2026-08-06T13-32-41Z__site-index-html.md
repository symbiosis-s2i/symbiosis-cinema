---
target: site/index.html — Symbiosis OS landing page
total_score: 17
max_score: 32
na_heuristics: 5,9
p0_count: 3
p1_count: 3
timestamp: 2026-08-06T13-32-41Z
slug: site-index-html
---
Method: dual-agent (A: design review · B: detector + browser evidence). Both assessments ran isolated and in parallel; four load-bearing claims were re-verified independently in the parent context before synthesis.

Target: `site/index.html` — Symbiosis OS landing page, Persuade mode, Bulgarian default with EN toggle. 22 sections, 26,363px desktop / 41,677px mobile.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Only "where am I" affordance is the Cinema slate rail, and it is broken (sticky inside `overflow:hidden`). No active-section nav state across 22 sections |
| 2 | Match System / Real World | 4 | Excellent plain Bulgarian, jargon glossed inline. Undercut by 47 Cyrillic strings that never translate in EN mode |
| 3 | User Control and Freedom | 2 | Mobile menu button 8.8px reachable; Escape does not close it and leaves `body{overflow:hidden}`. No back-to-top over 26,363px |
| 4 | Consistency and Standards | 1 | Four different labels for one booking URL. Nine radius values, no scale. Duplicate section eyebrow used twice |
| 5 | Error Prevention | n/a | No forms, inputs, or destructive actions — only anchors, a language toggle, an accordion |
| 6 | Recognition Rather Than Recall | 2 | Compare table holds 10 items against 8 with no shared row keys. 28-module grid with no grouping or search |
| 7 | Flexibility and Efficiency | 2 | BG/EN toggle works well, but nav anchors reach 7 of 22 sections; no skip link |
| 8 | Aesthetic and Minimalist Design | 1 | 15 h2s within 6% of one size, 32 eyebrows, 65 number badges, 72 cards, 228 mono elements, five stat grids. Nothing recedes |
| 9 | Error Recovery | n/a | No error states exist on this surface |
| 10 | Help and Documentation | 3 | FAQ answers eight real objections well; 6-step timeline reassures. Both sit past 24,000px |
| **Total** | | **17/32** | **Poor (53%)** |

Heuristics 5 and 9 scored n/a — this Persuade surface has no forms, validation, or failure paths. Maximum renormalized to 32.

## Design Specificity Verdict

**Category-interchangeable.** Strip the three persona portraits and the Bulgarian copy, and every remaining structural decision belongs to any AI-SaaS template.

**LLM assessment.** The section grammar is one template repeated 22 times: mono-uppercase eyebrow → 3.2rem heading → 1rem sub → grid of tiles. All 15 h2s compute within 6% of each other, so nothing on the page is bigger because it matters more. 72 card containers, 12 of them nested. 65 standalone `01`/`02` badges across six sequences, four of which are unordered sets. 228 elements set in JetBrains Mono — for eyebrows, nav pills, badges, and weekday labels, almost none of it code, data, or measurement.

The single Symbiosis-specific idea — "one organism," content and CRM sharing one mind — never becomes a visual form. It is asserted in the hero, asserted again in the pull quote, and diagrammed once as a logo pill with 15 generic chips under a 1px line. The `content → engagement → lead → proposal → revenue` flow that PRODUCT.md names as the core mechanic exists only as five `<li>`s in a rounded box.

**Deterministic scan.** `detect.mjs` exit 2, 50 findings: 43 `overused-font` (Inter ×38, Instrument Serif ×4), 3 `gradient-text` (lines 577, 796, 1325), 2 `layout-transition` (`transition: padding`, `transition: width`), 1 `codex-grid-background`, 1 `dark-glow` (zero-offset `#5b7bff` halo). Browser measurement adds: **186 WCAG AA contrast failures across 738 text nodes** (93 of them below 3.0:1), all tracing to four gray tokens — `#6e6e80`, `#4d4d5e`, `#5c5c6e`, `#7d7d90` — on near-black. A further 133 nodes sit over gradients; the design review measured the worst of those at **1.07:1** (`#a9ffc4` on green tint) and **1.38:1** (`#ffc79b` on amber tint).

**Two assessment claims I corrected before publishing:**

- **Focus rings are not invisible.** The design review inferred this from `outline-color: rgb(16,16,16)` on a `#08080a` ground. Pixel-diffing focused vs unfocused proved Chromium's `outline: auto` paints a high-contrast ring anyway (max channel delta 705–741 of 765). The real finding is narrower: the page defines **zero** `:focus` or `:focus-visible` rules, so focus visibility is entirely at the user agent's discretion and is unverified outside Chromium.
- **No element genuinely overflows the viewport** at any of 9 widths — `scrollWidth === clientWidth` everywhere, and all 103 out-of-viewport elements at 390px sit inside `overflow-x:hidden` ancestors. But the detector's "clipped, therefore fine" classification hid a severe defect: one of those clipped elements is the mobile menu button. See P0 below.

## Overall Impression

The page is competent and it is not lazy — the copy is genuinely good Bulgarian, the third-party statistics are all sourced and linked, and it refused to fabricate testimonials when the category expects them. That editorial restraint is real and rare.

But the brief was specific and the page inverted it. Geist Sans was named; Inter — the one face named as an anti-reference — is the computed font for every heading, paragraph, chip, and button on the page. One accent was named; five ship. The purple-blue gradient hero was named as an anti-reference; it is there, twice, plus a gradient headline.

The single biggest opportunity: **the page argues against its own positioning.** "Zero chaos" is demonstrated across 50 mobile screens ending in a flat grid of 28 undifferentiated modules. Cutting this to ten sections with three real typographic tiers would do more than any restyle.

## What's Working

1. **The Instrument Serif discipline is exemplary** — and it is the one place the pinned brief is followed precisely. Three uses only, each ≥35px at every breakpoint, each at a real emotional beat: the hero's resolving third line, the chapter number, the pull quote. Never a subhead, never a label, never decorative. It works because an italic serif reads as a human voice interrupting an otherwise mechanical sans, which is exactly the "living organism, not a pile of features" idea. The typographic idea is right; it has the wrong sans next to it.

2. **The persona photography is treated as product, not decoration.** Anna, Kaloyan and Katerina appear in the hero marquee and again as a character vault with role, voice description, and language chips. That second treatment does real persuasive work — it proves the "same face, same voice, every video" claim by showing the same three faces in two contexts. It satisfies PRODUCT.md's brand-asset requirement and the no-stock-AI-imagery anti-reference at once, and it is the only element a competitor could not clone.

3. **Evidence discipline under a strict evidence constraint.** Every third-party statistic carries a named, linked source — Wyzowl, McKinsey, HBR, Salesforce, Kixie. The page had every incentive to invent customer logos and did not.

## Priority Issues

### [P0] The mobile menu button is 8.8px wide in practice — and it is the only navigation on mobile

**What.** At 390px the hamburger computes to `left: 381.17px, right: 423.17px`. The viewport is 390px, so **8.83px of a nominal 42×42 target is inside the screen**; `body{overflow-x:hidden}` clips the rest. Cause verified: `applyResponsive()` hides `[data-mob="hide"]` items but never reflows what remains, so the Sell 2 Inspire pill still runs `152 → 423`, 33px past the viewport edge. Hit-testing confirms the sliver is still tappable — this is a precision trap, not a dead control.

**Why it matters.** Every nav link, the login link, and a second CTA live behind that button, and it is the only route into the information architecture across 41,677px of scroll. An 8.8px strip flush against the screen edge sits in the thumb-reach dead zone.

**Fix.** In `applyResponsive()`, when `narrow`: hide the header CTA (it repeats five more times down-page) and reduce the logo lockup to mark-only. Assert no header child's `getBoundingClientRect().right` exceeds `clientWidth`.

**Suggested command:** `/impeccable adapt`

### [P0] The Cinema section never restacks on mobile; every step renders twice, unreadably

**What.** The grid hardcodes `minmax(0,0.86fr) minmax(0,1.14fr)` with no media query and no JS restack. At 390px this computes to **`140.172px 185.828px`** — two columns on a phone. The 140px column is the sticky slate, which mirrors the active step's title and body, so the reader gets each step's text at 140px *and* at 186px back to back. Step 5's `<h4>` measures 109×84px: a four-line title.

**Why it matters.** Cinema is the flagship of the secondary-visitor job in PRODUCT.md, and mobile is where a distracted owner meets it. Duplicated content in two unreadable columns is worse than no section.

**Fix.** Below ~900px set the grid to `1fr` and remove the sticky column entirely — its content is already fully present in the step cards. Zero information lost.

**Suggested command:** `/impeccable adapt`

### [P0] Inter is the entire type system; Geist Sans is absent

**What.** `index.html:480` sets `font-family: Inter, system-ui`. The `@font-face` block bundles exactly three families — Instrument Serif, Inter, JetBrains Mono. Geist is not bundled, not referenced, not fallback-chained. Live computed styles across every element return only those three.

**Why it matters.** This is the most explicit, least ambiguous instruction in the brief: a named face to use and a named face to avoid. The page does the opposite of both in one stroke, and every other typographic decision inherits it.

**Fix.** Self-host Geist Sans 400/500/600, swap the body stack, delete the ~38 Inter `@font-face` blocks. Then re-examine whether 228 elements still need JetBrains Mono once the sans has actual character.

**Suggested command:** `/impeccable typeset`

### [P1] The page renders nothing without JavaScript — on a page whose thesis is AI-search discoverability

**What.** With JS disabled: **0 headings, 0 sections, 0 links.** Rendered text is the single string "This page requires JavaScript to display." The whole surface is a client-rendered `<x-dc>` component.

**Why it matters.** The `#aisearch` section sells "be the company AI recommends," lists Schema.org structured data and canonical/OG tags as audit criteria, and scores itself 94/100 for AI-search readiness. The page ships zero crawlable HTML, no JSON-LD, and no OG preview. Any LLM crawler, link unfurler, or non-JS fetch sees one sentence. **The page fails its own audit** — a credibility problem before it is a technical one.

**Fix.** Pre-render at build; the page is entirely static apart from the language swap and scroll effects. Add the `WebPage`/`FAQPage` JSON-LD the page itself recommends.

**Suggested command:** `/impeccable harden`

### [P1] `overflow:hidden` kills the page's only authored interaction

**What.** `section#cinema` sets `overflow:hidden`, so the child's `position:sticky; top:96px` never pins. Measured across a scroll: the slate's viewport top runs 2778 → 2004 → 1572 → 899 and keeps going, never settling at 96. The slate-updating code keeps driving a card that has left the screen, and the left column becomes a ~1,400px black void that reads as a rendering bug.

**Why it matters.** This scroll-linked slate is the one moment on the page that isn't a static grid — the only thing answering Linear's "restrained, authored motion." It is dead.

**Fix.** Replace `overflow:hidden` with `overflow-x:clip`, which does not create a sticky-breaking scroll container, or move the clip to the inner glow element that actually needs it.

**Suggested command:** `/impeccable polish`

### [P1] Contrast fails the brief's own binding accessibility floor, concentrated on the exact anti-reference

**What.** 186 AA failures across 738 nodes, 93 below 3.0:1. The failing tier is almost entirely 9.6–13.8px type. The worst sit precisely on the pinned "gray text on colored backgrounds" anti-reference: `#a9ffc4` on green tint at 1.07:1, `#ffc79b` on amber tint at 1.38:1, `#a9bcff` on cobalt tint at 1.98:1 across ~40 chips. Separately, **21 of 26 interactive elements are under 44×44 at 390px** — all 21 fail on height; the BG/EN toggle is 37×28.

**Why it matters.** PRODUCT.md makes WCAG 2.1 AA binding. The craft floor names the exact remedy and the page does the inverse of it.

**Fix.** Lighten every on-tint foreground toward its own hue rather than toward gray (`#a9bcff` → `#d4dcff` clears the cobalt chips). Raise minimum interactive height to 44px. Add a global `:focus-visible` rule so focus is not left to the user agent.

**Suggested command:** `/impeccable audit`

### [P2] 22 sections, 26,363px, no hierarchy — and the 28-module grid argues against the product

**What.** 15 h2s at one size, 32 eyebrows, five separate big-number grids, a flat 28-tile module grid, two audience sections ~8,000px apart sharing an identical eyebrow, two third-party statistics sections separated by one CTA.

**Why it matters.** The positioning is "More clients. Less cost. **Zero chaos.**" A page requiring 50 mobile screens and presenting 28 undifferentiated boxes demonstrates chaos while claiming to remove it. The form contradicts the message.

**Fix.** Cut to ~10 sections. Merge the duplicate audience and statistics sections. Collapse 28 modules into 5 named groups behind the accordion pattern the page already has. Delete all 32 eyebrows and re-scale the h2s into three real tiers so size means something.

**Suggested command:** `/impeccable distill`

### [P2] Four CTA labels for one destination, plus visible copy defects

**What.** One booking URL, four labels: "Заяви достъп", "Виж готовата оферта →", "Разгледай Symbiosis Cinema →", "Отвори Symbiosis →" — the last sitting directly under body copy that says *request access*. Separately: 47 Cyrillic strings never translate in EN mode (the hero film-strip persona cards and the entire feature marquee have no `data-i` attributes), `<title>` never swaps language, and the hero's fourth trust stat reads "100+ / 100+ модела, един достъп" because it reuses another section's i18n key.

**Why it matters.** "Разгледай Cinema" promises a product tour and opens a booking calendar — a bait-and-switch at peak intent. And an English visitor, named in PRODUCT.md as primary, meets Bulgarian in the first two screens.

**Fix.** One label everywhere: "Заяви достъп." Add `data-i` keys to the film strip and marquee, and a `hero.trust4` key. Swap `<title>` on language change.

**Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Jordan (confused first-timer).** The hero paragraph is a 330-character, five-clause sentence at a 153ch measure that defines a studio, a platform, attribution, 100+ models, and prospecting simultaneously — there is no scannable one-line answer to "what is this." The first two nav items are "Cinema" and "AI Търсене," internal feature names, colour-badged as the most important links, before Jordan knows what Symbiosis is. Three products are presented as co-equal; the "Решението" section that would orient him sits ~14,000px down. No pricing anywhere — "до −70% на месец" is a discount off an unstated baseline, formatted in the slot where a price belongs. 65 `01`/`02` badges across six unrelated sequences give repeated false "you are here" signals.

**Casey (distracted mobile).** 41,677px — about 50 screens. The menu button is 8.8px reachable. The Cinema section renders every step twice at 140px and 186px. 21 tap targets under 44px, including the language toggle at 28px tall and eight source links at 28px. Between the hero CTA and the next conversion action there are roughly 14,000px with no way to convert — and the header CTA is the element crowding the menu button off-screen.

**Riley (stress tester).** JS off → the entire site is one sentence. Tabbing works and Chromium's default ring paints, but the page defines no focus styling at all, so this is luck rather than design. No `scroll-padding-top` anywhere despite a 63px fixed header and `scroll-behavior:smooth`, so deep links land ~215px off target. `will-change: opacity, transform, filter` is set on all 110 reveal elements and never cleared — 110 permanently promoted compositor layers after a full scroll. Resizing across the 1180px breakpoint swaps navs via an undebounced `resize` handler, and the Cinema grid never changes regardless.

## Minor Observations

- `role="tablist"`/`role="tab"` on the BG/EN toggle without tabpanels or `aria-controls` is an incorrect ARIA pattern; these are buttons in a group.
- Escape does not close the mobile menu, and `body{overflow:hidden}` persists — keyboard users are stuck until they find the button again. No `aria-expanded`.
- The scroll progress bar sits at `z-index:120` above the nav's `100`, drawing a 2px gradient line across the top of the header instead of under it.
- The AI chat mock invents a named customer ("Стоян от Велур ООД"), a score (87/100), and a statistic ("73% от клиенти с подобно поведение подписват") — fabricated specifics presented as product output, sitting uneasily beside the page's otherwise careful sourcing.
- Page weight is **9.27 MB uncompressed**, 5.98 MB of it oversized raster: three 1024×1536 persona PNGs rendered at most 371×337 (2.76–4.14× oversampled), and a 544×544 logo PNG rendered at 28px (18×). Served with no compression. LCP 1,236ms, CLS 0.049, 5 long tasks totalling 895ms.
- 60 distinct font sizes are in use; 133 elements are under 12px.
- The `accent` prop exposes four palette presets including green/teal and red/purple — the committed cobalt world is one config value away from being overwritten.
- `role="img"` on the SVG chart gives a screen reader the label but none of the seven values.

## Questions to Consider

1. The brief named one accent colour and one sans. The page ships five accents and the one sans it forbade. What overrode a written client instruction — and if nothing did, what in the process let a binding constraint pass unread?
2. Symbiosis's whole claim is that ten disconnected things become one connected organism. Where on this page does a reader *see* connection? If the core mechanic can't be drawn, is it the drawing that's missing or the mechanic?
3. Twenty-eight modules in one flat grid, on a page selling "Zero chaos." If a reader's honest reaction is "this looks like a lot to learn," has the page sold the product or sold the objection?
4. You built exactly one authored interaction and one CSS property three lines above it silently disables it. Nobody caught it because nobody scrolled the built page on a real viewport. What does that say about the other 21 sections?
5. The page scores itself 94/100 for AI-search readiness and ships zero crawlable HTML. If a prospect runs your own audit against this page, what do they conclude about the product's audit?
