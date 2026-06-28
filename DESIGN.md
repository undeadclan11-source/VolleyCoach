# Design

<!-- impeccable seed: 161 -->

## Register

brand

## Color

Strategy: **Committed** — teal primary carries 30–60% of the surface on hero and key sections. Background is pure white; warmth lives in the primary color, accent, and copy — not the surface.

Anti-reference note: do NOT warm-tint the background. The cream/sand/paper-white band is the AI default. Pure white only.

### Palette

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Primary | `--color-primary` | `oklch(0.52 0.13 188.0)` | CTA buttons, section fills, nav, hero bg panels |
| Accent | `--color-accent` | `oklch(0.72 0.18 48.0)` | Secondary CTAs, badges, highlights, links |
| Background | `--color-bg` | `oklch(1.000 0.000 0)` | Page background. Exactly pure white. No hidden warmth. |
| Surface | `--color-surface` | `oklch(0.97 0.005 188.0)` | Cards, panels, alternating sections |
| Ink | `--color-ink` | `oklch(0.18 0.015 188.0)` | Body text. ≥7:1 on bg. |
| Muted | `--color-muted` | `oklch(0.48 0.010 188.0)` | Secondary text, captions, metadata. ≥3.5:1 on bg. |

### Text on fills

- Text on `--color-primary` fills: white (`oklch(1.000 0.000 0)`) — primary is mid-luminance saturated, HK effect makes dark text read muddy
- Text on `--color-accent` fills: white — same reasoning
- Text on `--color-surface`: `--color-ink`

### Contrast notes

- `--color-ink` on `--color-bg`: well above 7:1 (AAA)
- `--color-muted` on `--color-bg`: ≥3.5:1 (AA large text + secondary)
- `--color-primary` on `--color-bg`: use for decorative elements and filled buttons only, not body text

## Typography

### Fonts

- **Display / Headings**: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) — variable, optical-size aware, warm and approachable without being cutesy; personality at large scale, not on the reflex-reject list, not the editorial-typographic lane
- **Body / UI**: [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) — designed by the Braille Institute for maximum legibility; warm, readable, accessibility-first; a coach squinting at a phone in a bright gym needs this
- Import via Google Fonts: `Bricolage+Grotesque:opsz,wght@12..96,300..800` + `Atkinson+Hyperlegible:wght@400;700`

Pairing axis: personality vs. clarity. Bricolage brings voice to headlines; Atkinson removes friction from body copy. Distinct enough that they're not competing, different enough on purpose.

### Scale (fluid, clamp-based)

```css
--text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm:   clamp(0.875rem, 0.85rem + 0.25vw, 1rem);
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-lg:   clamp(1.125rem, 1.05rem + 0.375vw, 1.375rem);
--text-xl:   clamp(1.375rem, 1.25rem + 0.625vw, 1.75rem);
--text-2xl:  clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
--text-3xl:  clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem);
--text-4xl:  clamp(3rem, 2.25rem + 3.75vw, 5rem);
--text-hero: clamp(3.5rem, 2.5rem + 5vw, 6rem);
```

Hero ceiling is 6rem max (no shouting). Ratio between adjacent steps ≥1.25.

### Rules

- `font-family: 'Bricolage Grotesque', system-ui, sans-serif` on h1–h3
- `font-family: 'Atkinson Hyperlegible', system-ui, sans-serif` on body, labels, UI text
- Body line-length: max 65ch
- `text-wrap: balance` on h1–h3
- `text-wrap: pretty` on long prose
- Display letter-spacing: no tighter than `-0.03em` (floor: `-0.04em` — below that, letters touch)
- Light text on dark bg: `line-height: 1.65` (vs 1.5 on light)

## Spacing & Layout

### Scale

```css
--space-1:  0.25rem;
--space-2:  0.5rem;
--space-3:  0.75rem;
--space-4:  1rem;
--space-6:  1.5rem;
--space-8:  2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;
--space-32: 8rem;
```

### Grid

- Max content width: 1200px, centered with `margin-inline: auto`
- Horizontal padding: `clamp(1rem, 5vw, 4rem)`
- Section vertical padding: `clamp(4rem, 8vw, 8rem)` — varies for rhythm; not all equal
- Responsive grids (no breakpoints): `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`

## Motion

- Entrance motion: purposeful, not reflexive. Not every section gets a scroll-triggered fade. Reserve for the hero and 1–2 high-impact sections.
- Easing: ease-out-quart / quint. No bounce, no elastic.
- Duration: 300–500ms for reveals. 150–200ms for interactions.
- `@media (prefers-reduced-motion: reduce)`: instant or crossfade alternative for every animation — non-negotiable given the accessibility brief.
- Content is visible by default; animations enhance, never gate.

## Z-index scale

```css
--z-dropdown: 100;
--z-sticky:   200;
--z-modal-bg: 300;
--z-modal:    400;
--z-toast:    500;
--z-tooltip:  600;
```

## Border radius

```css
--radius-sm:  4px;   /* inputs, small elements */
--radius-md:  8px;   /* cards, panels */
--radius-lg:  12px;  /* large cards — ceiling for cards */
--radius-xl:  16px;  /* hero panels, large containers */
--radius-pill: 999px; /* tags, badges only */
```

No card radius above 16px.

## Absolute bans (project-specific reminders)

All SKILL.md bans apply. Additionally for VolleyCoach:

- **No warm-tinted background** — pure white only. No `--paper`, `--cream`, `--sand`, etc.
- **No athlete stock photos** — no jumping athletes, diving players, aggressive sports energy. This is a rec league — kids in mismatched knee pads, not Olympians.
- **No sports-app gradient jersey textures** — no ESPN energy.
- **No hero metric cards** ("10,000 coaches · 50,000 games") — the SaaS cliché anti-reference.
- **No eyebrow labels on every section** — no `01 · Features / 02 · Pricing`.
- **No gradient text** — no `background-clip: text`.
- **No glassmorphism** — not the aesthetic.
- **No side-stripe borders** — no colored `border-left` accents.
- **No sketchy SVG illustrations** — if imagery is needed and no real assets exist, a clean SVG diagram or app screenshot; never hand-drawn approximations.

## Anti-references

The following aesthetics are explicitly banned from any VolleyCoach design surface:

1. **SoloStats / Rotate123** — stats-table-dense, dark sidebars, competitive club energy. Wrong audience.
2. **Generic sports apps** — stock athlete photos, gradient jersey textures, aggressive bold-italic fonts, ESPN color palette.
3. **Startup SaaS cliché** — cream backgrounds, hero metric cards, glassmorphism, identical icon grids, numbered section eyebrows.

## Reference

- **Canva / Headliner**: accessible, colorful, not intimidating. Obvious CTAs. Not "designy."
- Specific traits to borrow: clear visual hierarchy, color used joyfully but not chaotically, generous whitespace, CTAs that are obvious without being aggressive.
