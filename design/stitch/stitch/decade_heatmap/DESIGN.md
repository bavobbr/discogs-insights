# Design System: Deep Groove Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: The Analog Archivist**
This design system rejects the clinical flatness of modern SaaS in favor of a "Modern Analog" experience. It is inspired by the tactile ritual of handling vinyl—the weight of the sleeve, the grain of the paper liner, and the precise geometry of a turntable’s tonearm. 

The system moves beyond the "template" look through **Intentional Asymmetry** and **Rhythmic Depth**. We do not align everything to a rigid center; instead, we use high-contrast typography scales and overlapping "inner-sleeve" layers to create a sense of physical stacking. The interface should feel like a premium editorial magazine that happens to be interactive.

---

## 2. Colors: The "Deep Groove" Palette
The palette is anchored in high-contrast neutrals with high-chroma "industrial" accents.

### Surface Hierarchy & Nesting
To achieve a premium feel, we follow the **Surface Tiering** model. Never use a single flat background.
*   **Base Layer:** `surface` (#131313) for the main application canvas.
*   **The Inset:** Use `surface_container_lowest` (#0E0E0E) for "groove" areas (data visualizations or record slots).
*   **The Lift:** Use `surface_container_high` (#2A2A2A) for floating cards and interactive elements.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** Boundaries between sections must be defined solely through:
1.  **Tonal Shifts:** Placing a `surface_container_low` section against a `surface` background.
2.  **Soft Transitions:** Subtle 10-15% opacity gradients between surface tiers.

### The Glass & Gradient Rule
To simulate the semi-transparent "inner-sleeve" look, use **Glassmorphism**. Floating overlays (like player controls or expanded tracklists) should use `surface_container` at 80% opacity with a `20px` backdrop-blur. 
*   **Soulful Gradients:** For primary CTAs, do not use flat `primary`. Transition from `primary` (#FFB59E) to `primary_container` (#FF5717) at a 45-degree angle to mimic the sheen of lacquered vinyl.

---

## 3. Typography: Swiss Precision meets Liner Note Soul
The hierarchy is a dialogue between the "Architectural" (Technical Data) and the "Editorial" (Musical Storytelling).

*   **The Architect (Inter):** Used for `display`, `headline`, and `label`. This is high-contrast, bold, and strictly uppercase for labels. It represents the turntable’s hardware and metadata.
    *   *Display-LG:* 3.5rem. Tight letter spacing (-0.02em). Use for album titles.
*   **The Storyteller (Newsreader):** Used for `title` and `body`. This "sleeve-liner" serif provides a sophisticated, human touch.
    *   *Body-LG:* 1rem. Increased line-height (1.6) to ensure the "bookish" quality of long-form reviews or credits.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to scream "I am a button." We use light and material logic.

*   **The Layering Principle:** Stack surfaces to create hierarchy. A tracklist (`surface_container_low`) sits "inside" the album view (`surface`). 
*   **Ambient Shadows:** If an element must float (e.g., a playing record), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0,0,0,0.4)`. The shadow should be tinted with `on_surface` to feel like natural ambient light.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., input fields), use `outline_variant` at **15% opacity**. A solid, 100% opaque border is a failure of the aesthetic.
*   **Tactile Texture:** Apply a global `0.03` opacity noise/paper grain texture overlay to the entire UI to kill "digital flatness."

---

## 5. Components

### Navigation: The Sticky Groove
*   **Bottom Nav:** Since there is no top nav, the sticky bottom bar is the anchor. Use `surface_container_highest` with a backdrop blur. Icons use `secondary` (#76D6D5) for the active state.
*   **Rhythmic Spacing:** Use the `8` (2.75rem) or `12` (4rem) spacing tokens to create "breathing room" between major content blocks.

### Buttons: Industrial Touchpoints
*   **Primary:** Rectangular, `roundness-sm` (0.125rem). Background is `primary_fixed`, text is `on_primary_fixed`.
*   **Tertiary/Text:** All caps `label-md` (Inter). Use `primary` color. No background.

### Cards & Lists: The No-Divider Rule
*   **Cards:** Forbid the use of divider lines. Separate items using `surface_container_low` cards with `3` (1rem) vertical spacing.
*   **Collection Lists:** Use asymmetrical "staggered" grids to mimic a crate-digger’s view.

### Data Visualization: High-Contrast Pulse
*   **The Groove Visualizer:** Use `primary` (International Orange) and `tertiary` (Mustard Yellow) for wave-forms and frequency bars against a `surface_container_lowest` background. High contrast is mandatory.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme scale. Pair a `display-lg` headline with a `label-sm` technical detail immediately below it.
*   **Do** use `surface_bright` to highlight active states instead of adding a border.
*   **Do** embrace negative space. If a screen feels "full," use the `16` (5.5rem) spacing token to push elements apart.

### Don't
*   **Don't** use pure white (#FFFFFF). Always use `on_surface` (#E5E2E1) or `primary_fixed` to maintain the "Paper Off-White" warmth.
*   **Don't** use standard Material Design "Floating Action Buttons." All actions should feel integrated into the "sleeve" of the page.
*   **Don't** use rounded corners larger than `lg` (0.5rem) for main containers. The aesthetic is architectural and crisp, not bubbly. For buttons and small inputs, stick to `sm` (0.125rem).