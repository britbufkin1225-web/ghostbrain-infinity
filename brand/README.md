# GhostBrain Infinity Brand Identity

## Project Name

GhostBrain Infinity

## Parent Brand Relationship

devdevbuilds is the parent studio and build brand.

GhostBrain Infinity is the primary product and project brand. It must visually dominate the app. devdevbuilds should appear only as a smaller studio credit and should never compete with the GhostBrain Infinity mark, wordmark, header presence, or dashboard identity.

## Brand Direction

GhostBrain Infinity should feel premium, dark metallic, futuristic, local-first, graph-driven, AI-system oriented, Obsidian-inspired, serious, and polished.

The baseline visual language is chrome and platinum over black glass, with restrained signal colors for active AI, graph, and source states.

Avoid childish mascot styling, flat generic SaaS styling, random neon colors, cluttered logos, oversized distracting brand art, and any visual treatment that appears copied from an earlier dashboard.

## Approved Color Palette

| Token | Hex | Usage |
| --- | --- | --- |
| Background Black | `#050608` | Primary app background and deepest surfaces |
| Graphite Black | `#0b0d10` | Secondary backgrounds and quiet panels |
| Gunmetal | `#161a20` | Elevated surfaces, separators, dark UI blocks |
| Dark Chrome | `#242932` | Borders, chrome surfaces, inactive controls |
| Platinum White | `#e8edf2` | Primary text and high-contrast brand highlights |
| Soft Silver | `#aeb7c2` | Secondary text, metadata, subdued labels |
| Muted Cyan | `#77e6ff` | Active AI, graph, source, and connection states |
| Ghost Blue | `#8fb8ff` | Linked nodes, selected graph states, focus accents |
| Signal Violet | `#8d7cff` | Model intelligence, system emphasis, rare highlights |
| Warning Amber | `#f5b84b` | Warnings and caution states only |
| Danger Red | `#ff4d5e` | Errors, destructive actions, and system danger only |

### Palette Rules

Black, gunmetal, platinum, and chrome form the base identity.

Cyan, ghost blue, and violet are reserved for active AI, graph, source, focus, and selected states.

Amber and red are reserved for warnings, errors, destructive actions, and system danger.

Avoid rainbow styling, decorative neon scatter, and low-contrast gray text.

## Typography Direction

Primary UI typography should use Inter, Geist, or a system sans-serif stack.

Technical labels, IDs, timestamps, registry codes, and compact metadata should use JetBrains Mono or IBM Plex Mono.

Logo typography should use a futuristic metallic sans-serif or refined chrome wordmark treatment. The logo should feel precise and serious rather than playful or mascot-driven.

## Asset Filename List

The following brand source assets are expected in `/brand/`:

- `ghostbrain-infinity-logo.png`
- `ghostbrain-infinity-logo-transparent.png`
- `ghostbrain-infinity-wordmark.png`
- `ghostbrain-infinity-icon.png`
- `ghostbrain-infinity-favicon.png`

The following parent studio assets are expected in `/brand/devdevbuilds/`:

- `devdevbuilds-wordmark.png`
- `devdevbuilds-studio-credit.png`

The following app-ready dashboard assets are expected in `/public/assets/brand/`:

- `ghostbrain-infinity-dashboard-logo.png`
- `ghostbrain-infinity-dashboard-icon.png`
- `ghostbrain-infinity-bg-mark.png`
- `devdevbuilds-credit.png`

## Current Asset Status

The required brand PNG assets have been created and staged in the expected Phase 0 filenames.

The expanded Phase 1.75 app asset kit lives under `/src/assets/` and includes logo variants, crowned ghost/brain icon variants, devdevbuilds studio marks, UI treatment references, an asset manifest, and dashboard reference notes.

Do not rename assets without updating this README, `/src/assets/references/asset-manifest.md`, and any consuming app references.

## Asset Usage Rules

GhostBrain Infinity is the primary visual identity across the product.

Use the full GhostBrain Infinity logo or wordmark for primary brand placement. Use the icon only where space is limited or where a compact dashboard mark is needed.

Use devdevbuilds only as a small studio credit. It should appear quieter than GhostBrain Infinity in size, contrast, and placement.

Do not use brand imagery as decorative clutter. Every mark should clarify product identity or support orientation within the dashboard.

Do not introduce alternate palettes, rainbow gradients, novelty mascots, or unapproved logo variants.

## Dashboard Logo Placement Rules

The GhostBrain Infinity logo should appear in the primary header area.

The devdevbuilds studio credit should appear smaller than the primary product logo, preferably in a secondary header position, footer area, about surface, or subdued studio-credit location.

The ghost/brain icon may be used as a subtle background mark, but it must not compete with dashboard content.

Brand imagery must never block graph nodes, controls, inspectors, registry panels, dashboard text, or source/model status content.

The brand should support dashboard logic, not overpower it.

## Background Mark Opacity Guidance

The GhostBrain Infinity background mark should stay between `0.04` and `0.12` opacity.

Use the lower end of the range for dense graph, inspector, source, or registry surfaces.

Use the higher end only on quiet empty states or non-interactive surfaces where legibility is not at risk.

## Phase Boundary

Phase 0 is branding and project structure only.

Do not implement graph rendering, vault logic, source/model registry, import/export, localStorage persistence, filters, inspector panels, activity feed, status modules, or dashboard interactivity in this phase.

Phase 1 may begin from this identity foundation without migrating old dashboard logic or recreating prior broken behavior.
