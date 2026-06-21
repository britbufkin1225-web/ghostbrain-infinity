# GhostBrain Infinity Asset Manifest

Current cleanup state: fake / legacy GhostBrain image assets have been removed.

## Runtime Source of Truth

The live app loads browser-served assets from:

```txt
public/assets/

Approved source assets currently live in:

src/assets/studio/
src/assets/ui/
Current Approved Assets
AssetPurposeRuntime Path
src/assets/studio/devdevbuilds-footer-mark.pngFooter studio credit/assets/studio/devdevbuilds-footer-mark.png
src/assets/studio/devdevbuilds-secondary-mark.pngHeader/studio secondary mark/assets/studio/devdevbuilds-secondary-mark.png
src/assets/studio/devdevbuilds-small-transparent.pngCompact studio credit/assets/studio/devdevbuilds-small-transparent.png
src/assets/ui/ui-black-glass-panel-reference.pngUI reference only/assets/ui/ui-black-glass-panel-reference.png
src/assets/ui/ui-dashboard-surface-reference.pngUI reference only/assets/ui/ui-dashboard-surface-reference.png
src/assets/ui/ui-embossed-control-reference.pngUI reference only/assets/ui/ui-embossed-control-reference.png
src/assets/ui/ui-metal-button-reference.pngUI reference only/assets/ui/ui-metal-button-reference.png
Removed / Rejected Asset Families

These were removed because they were legacy, generated, fake, or visually inconsistent with the approved chrome/embossed system:

ghostbrain-infinity-*.png
ghostbrain-icon-*.png
devdevbuilds-credit.png
devdevbuilds-logo-transparent.png
devdevbuilds-icon-circle.png
brand/
docs/assets/
docs/asset-archive/legacy-ghostbrain/
Current GhostBrain Logo Status

No GhostBrain image mark is approved in the runtime asset system right now.

Until the correct chrome/embossed GhostBrain Infinity mark is added, the app must use text fallback for:

GhostBrain Infinity

Do not reintroduce blue ghost, cartoon ghost, placeholder logo, old Codex logo, or root-level brand/ image assets.
