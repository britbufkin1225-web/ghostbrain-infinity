import headerLockupTransparent from "../assets/brand/ghostbrain-infinity-header-lockup-transparent.png";
import primaryLogo from "../assets/brand/ghostbrain-infinity-logo-primary-transparent.png";
import compactLogo from "../assets/brand/ghostbrain-infinity-logo-compact.png";
import dashboardMark from "../assets/icons/ghostbrain-icon-watermark.png";
import ghostIcon from "../assets/icons/ghostbrain-icon-primary.png";
import studioCredit from "../assets/studio/devdevbuilds-small-transparent.png";
import studioFooterMark from "../assets/studio/devdevbuilds-footer-mark.png";
import blackGlassReference from "../assets/ui/ui-black-glass-panel-reference.png";
import dashboardSurfaceReference from "../assets/ui/ui-dashboard-surface-reference.png";
import embossedControlReference from "../assets/ui/ui-embossed-control-reference.png";
import metalButtonReference from "../assets/ui/ui-metal-button-reference.png";

export const brandAssets = {
  primaryLogo,
  primaryHeaderLockup: headerLockupTransparent,
  compactLogo,
  ghostIcon,
  dashboardMark,
  watermark: dashboardMark,
  devdevbuildsLogo: studioCredit,
  devdevbuildsFooterMark: studioFooterMark,
  uiReferences: {
    blackGlassPanel: blackGlassReference,
    dashboardSurface: dashboardSurfaceReference,
    embossedControl: embossedControlReference,
    metalButton: metalButtonReference,
  },
} as const;
