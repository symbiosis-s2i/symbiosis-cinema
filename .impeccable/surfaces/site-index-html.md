---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: []
---

## Scope and mode

The Symbiosis OS marketing landing page (`site/index.html`). Persuade. Bulgarian default, English toggle. Replaces the incumbent 22-section page with roughly ten sections.

## Audience, job, action

Owner or decision-maker at a 4–20 person service business — agency, video studio, consultancy, coaching practice, B2B sales team — mostly Bulgaria. Desktop, daylight, evaluating whether one system can replace the ten they run now. Secondary visitors arrive for Cinema and need to see content connect to revenue.

Primary action, one label everywhere: **Заяви достъп / Request access**.

## Proof and constraints

Real: the three approved persona photographs, the sourced third-party statistics (Wyzowl, McKinsey, HBR, Salesforce, Kixie), the product itself.

Forbidden: first-party customer metrics. The "+34% / −€780 / 11 ч." band, the "Анонимизирани резултати" framing, and the invented chat specifics are all cut. Demonstration data is authored at full fidelity and labelled `примерни данни` in-page.

Binding: WCAG 2.1 AA. Bilingual including `<title>`. Pre-rendered HTML with `WebPage`/`FAQPage` JSON-LD and OG tags.

## Chosen direction

**The Edit Suite** — concept-seed roll `b08cf51f`, assigned index 6, user-confirmed. One time axis, many tracks, one playhead; refuses the grid of equal feature tiles. Approved composition: **`.impeccable/mocks/hero-b.html` (Comp B, Editorial Split)**, sidecar `.impeccable/mocks/hero-b.json`.

Memorable moment: the playhead scrub — one client story crossing content → engagement → client → revenue in a single gesture. One authored interaction, replacing 110 identical fade-ups.

## Design system read from the approved comp

- **Corner language:** 4px on panels and buttons, 2px on chips, blocks, and inner controls. Nothing rounder. No pills except the language toggle's container.
- **Line weights:** 1px hairlines only. Two rule tokens — `--rule` at 14% for structural divisions, `--rule-soft` at 7% for divisions inside a panel.
- **Elevation:** none. Depth comes from three surface steps (`--ground` → `--panel` → `--panel-lit`) plus hairlines. No shadows anywhere.
- **Component grammar:** bordered rectangular panels sharing one 1px border, subdivided by internal hairlines rather than gaps. Panels abut their own content; cards never nest.
- **Type ramp:** one face, Geist Variable. Display `clamp(36px, 3.85vw, 62px)` at weight 480, tracking −0.032em. Section heads ~24–38px at 480. Body 15–17px at 400. Interface labels 11–13px, weight 550, tracking +0.1em uppercase for lane and field names only. No face has a second family.
- **Color strategy:** Restrained. Neutral ramp plus one accent. Cobalt `#2B4EE6` for primary action and lit state, `#5B7BFF` for the playhead and hover, `#8FA6FF` for secondary emphasis. Nothing else saturated.
- **Text ramp, verified against `--ground` #0E1420:** `#E8ECF4` 16.1:1 · `#A8B4CC` 8.85:1 · `#7E8CA8` 5.41:1. All clear AA including the smallest step.

## Implementation inventory

| Ingredient | Medium | Note |
|---|---|---|
| Nav, buttons, language toggle | semantic HTML/CSS | Mark-only below 400px; link list collapses below 900px |
| Timeline: ruler, lanes, blocks, playhead | semantic HTML/CSS | Countable elements, flat shapes — code, not raster |
| Playhead scrub | HTML `input[type=range]` + JS | Native control, keyboard-operable by default |
| Scope readouts (3) | authored SVG | Flat line and bar traces, no gradients |
| Live queue rows | semantic HTML/CSS | |
| Persona photographs (Anna, Kaloyan, Katerina) | existing project asset, re-encoded | 1024×1536 PNG → AVIF/WebP at 2× render size. Currently 5.98 MB for ≤371px render |
| Logo mark | authored SVG | Replaces the 544×544 PNG rendered at 28px |
| Section iconography | authored SVG, one stroke weight | No Unicode glyphs standing in for icons |
| Type | self-hosted Geist Variable | SIL OFL v1.7.2, 134 Cyrillic codepoints |

## Unresolved

- **Mobile timeline.** Event labels clip at 390px. The horizontal timeline must become a vertical sequence below ~640px, not a compressed horizontal one. Blocking for the Cinema and hero sections.
- **Right column density.** Comp B's instrument stack must read as one instrument, not three stacked widgets.
- **Booking URL** unconfirmed — currently assumed unchanged from the incumbent.
- **Whether the "10 tools vs 1" comparison stays a table or becomes two contrasted timeline states.** Resolve during the build.
