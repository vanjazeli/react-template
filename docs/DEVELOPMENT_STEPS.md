# Steps

## Claude Design workflow

Before generating any screens or features with Claude Design, first create a **Design System** canvas. Nothing else gets designed until this exists.

### 1. Design System (create this first)

- Do **not** include shadcn/ui components in the design system canvas — there are already a lot of them, and they should stay as-is. Use them at their defaults (style `vega`, `neutral` base color, no modifications). "No modifications" refers to their out-of-the-box styles/structure only — the actual color values are completely free to change via the color palette defined in the design system below.
- Instead, the design system should define the reusable foundations that components and screens will pull from:
  - **Typography** — the type scale (headings, body, captions, etc.) with defined variants that can be reused out of the box everywhere.
  - **Colors** — the color palette/tokens (including states like hover/disabled, semantic colors like success/error/warning).
  - **Spacing** — the spacing scale used across layouts and components.
  - Anything else that belongs at the foundation level, e.g. border radii, shadows/elevation, breakpoints, icon sizes.

### 2. Feature/screen designs (after the design system exists)

- When prompting Claude Design for any feature or screen, always reference the design system created in step 1 so typography, colors, and spacing stay consistent.
- Components used in these designs should remain default shadcn/ui components (per components.json) — their out-of-the-box styles/structure shouldn't get one-off modifications, but they should pull their colors from the design system's color palette (which is ours to customize freely).
