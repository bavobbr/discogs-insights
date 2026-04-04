# Claude Instructions

## Design Guidelines

All UI work must strictly follow the **Deep Groove Aesthetic** design system (source: `design/stitch/stitch/*/DESIGN.md`).

### Aesthetic North Star
"Modern Analog" — inspired by vinyl. Feels like a premium editorial magazine. Use intentional asymmetry, rhythmic depth, and overlapping surface layers. Reject flat/clinical SaaS aesthetics.

### Colors — "Deep Groove" Palette
- **Surface tiering** (never a single flat background):
  - Base canvas: `surface` `#131313`
  - Groove/inset areas (data viz, record slots): `surface_container_lowest` `#0E0E0E`
  - Floating cards & interactive elements: `surface_container_high` `#2A2A2A`
- **No-Line Rule**: 1px borders are strictly prohibited. Use tonal shifts or 10–15% opacity gradients to define section boundaries.
- **Glassmorphism**: Floating overlays use `surface_container` at 80% opacity + `backdrop-blur: 20px`.
- **Primary CTAs**: gradient from `primary` `#FFB59E` → `primary_container` `#FF5717` at 45°. Never flat `primary`.
- **Never use pure white** (`#FFFFFF`). Use `on_surface` `#E5E2E1` or `primary_fixed` for off-white text.

### Typography
- **Inter** (`display`, `headline`, `label`) — high-contrast, bold, strictly uppercase for labels. Display-LG: 3.5rem, letter-spacing -0.02em.
- **Newsreader** (`title`, `body`) — serif for editorial/storytelling text. Body-LG: 1rem, line-height 1.6.
- Use extreme scale: pair `display-lg` headline with `label-sm` detail immediately beneath it.

### Elevation & Depth
- Stack surface tiers for hierarchy — no drop shadows to denote interactivity.
- Floating elements: `box-shadow: 0 20px 40px rgba(0,0,0,0.4)`.
- Accessibility strokes (inputs): `outline_variant` at 15% opacity only. Full-opacity borders are forbidden.
- Apply a global `0.03` opacity noise/grain texture overlay to avoid digital flatness.

### Components
- **Navigation**: Sticky bottom bar (`surface_container_highest` + backdrop-blur). Active icons: `secondary` `#76D6D5`. No top nav.
- **Buttons — Primary**: Rectangular, `border-radius: 0.125rem` (`roundness-sm`). Background: `primary_fixed`, text: `on_primary_fixed`.
- **Buttons — Tertiary/Text**: All-caps `label-md` (Inter), `primary` color, no background.
- **Cards**: No divider lines. Use `surface_container_low` cards with 1rem vertical spacing.
- **Lists**: Asymmetrical staggered grids (crate-digger's view).
- **Data viz**: `primary` (orange) + `tertiary` (mustard yellow) on `surface_container_lowest`. High contrast mandatory.
- **Spacing**: Use 2.75rem (`8`) or 4rem (`12`) tokens for breathing room. Use 5.5rem (`16`) when a screen feels crowded.

### Hard Rules
- No rounded corners larger than `border-radius: 0.5rem` (`lg`) on containers. Buttons/inputs: `0.125rem` (`sm`).
- No Material Design Floating Action Buttons. All actions must feel embedded in the page "sleeve".
- No divider lines between list items or cards.
- Highlight active states with `surface_bright`, not borders.
