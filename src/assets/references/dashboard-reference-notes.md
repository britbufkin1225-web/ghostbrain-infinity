# Dashboard Reference Notes

## Final Dashboard Mood

GhostBrain Infinity should feel like a dark metallic command center for a local-first AI registry and vault graph system. The tone is premium, technical, focused, and polished.

The interface should suggest black glass, brushed metal, chrome/platinum trim, subtle blue-white reflected highlights, and Obsidian-style graph depth.

## Color Direction

Use the locked Phase 0 palette:

- `#050608` Background Black
- `#0b0d10` Graphite Black
- `#161a20` Gunmetal
- `#242932` Dark Chrome
- `#e8edf2` Platinum White
- `#aeb7c2` Soft Silver
- `#77e6ff` Muted Cyan
- `#8fb8ff` Ghost Blue
- `#8d7cff` Signal Violet
- `#f5b84b` Warning Amber
- `#ff4d5e` Danger Red

Black, gunmetal, platinum, and chrome are the base. Cyan, ghost blue, and violet are active AI/graph/source signals. Amber and red are reserved for warnings, errors, and system danger.

## Metallic Styling Notes

Use restrained bevels, inner shadows, thin chrome borders, and soft reflected highlights. The dashboard should feel dimensional without becoming glossy clutter.

Avoid random neon, rainbow accents, oversized gradients, and low-contrast gray text.

## Panel Treatment Notes

Panels should feel like black glass over a graphite metal base:

- subtle translucent surface
- thin platinum/chrome border
- soft inner highlight along the top edge
- controlled depth shadow
- 8px or smaller border radius unless a component needs a round control shape

Do not place cards inside cards. Use panels for functional dashboard regions only.

## Button Treatment Notes

Buttons should feel raised, metallic, and purposeful:

- chrome edge
- dark gunmetal face
- subtle top highlight
- pressed/disabled states that do not shift layout
- cyan/ghost-blue only for active or primary system actions

Placeholder buttons must remain disabled until behavior exists.

## Logo Placement Rules

GhostBrain Infinity belongs in the primary header area and must visually dominate.

devdevbuilds is the smaller parent studio credit. It should never overpower, replace, or visually compete with GhostBrain Infinity.

The header lockup may include the mascot only if it remains balanced and readable at dashboard-header scale.

## Infinity Crown Usage Rules

The infinity symbol crown is part of the approved GhostBrain Infinity mascot identity.

The crown should remain small, elegant, and aesthetically integrated into the ghost/brain silhouette.

The ghost/brain silhouette must remain clear and readable. The crown reinforces the Infinity identity, but it must not dominate the icon.

The mascot should feel premium, intelligent, and brandable, not silly or overly decorative.

## What Must Not Change

- Project brand name: GhostBrain Infinity
- Parent studio name: devdevbuilds
- GhostBrain Infinity as the primary visual identity
- devdevbuilds as the secondary studio credit
- Dark metallic, black glass, chrome/platinum direction
- Small integrated infinity-symbol crown on crowned mascot variants
- Watermark opacity guidance of `0.04` to `0.12`

## Phase 2 Styling Priorities

1. Apply the asset kit to the existing dashboard shell without changing app architecture.
2. Replace text-only brand placeholders with approved transparent header assets.
3. Use the watermark behind quiet graph areas at low opacity.
4. Refine panel, button, and control styling from the UI reference images.
5. Preserve the Phase 1.5 data model and component hierarchy.
6. Keep graph logic, registry CRUD, and import/export behavior in their planned implementation phases.
