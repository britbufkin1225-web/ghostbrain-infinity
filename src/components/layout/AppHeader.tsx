import { appConfig } from "../../config/appConfig";
import { brandAssets } from "../../config/brandAssets";
import { appStatusSeed } from "../../data/seed/appStatus";
import { importExportActions } from "../../lib/importExport/importExportStub";
import { PlaceholderButton } from "../ui/PlaceholderButton";
import type { ReactNode } from "react";

interface AppHeaderProps {
  telemetry?: ReactNode;
}

const releaseVersion = "v0.1.0";

export function AppHeader({ telemetry }: AppHeaderProps) {
  const phaseLabel = appConfig.phase.split(" — ")[0] ?? appConfig.phase;

  return (
    <header className="app-header">
      <div
        className="app-header__brand"
        aria-label={`${appConfig.projectName} by ${appConfig.parentBrand}`}
      >
        <img
          className="app-header__lockup"
          src={brandAssets.primaryHeaderLockup}
          alt="GhostBrain Infinity"
        />

        <h1 className="sr-only">{appConfig.projectName}</h1>

        <span className="app-header__subtitle">
          local-first AI memory vault
        </span>
      </div>

      <div
        className="app-header__controls"
        aria-label="System status and project controls"
      >
        <div className="app-header__chips">
          <span className="status-chip status-chip--environment">
            <span aria-hidden="true" />
            {appStatusSeed.mode}
          </span>

          <span className="status-chip status-chip--version">
            {releaseVersion}
          </span>

          {telemetry}

          <span className="status-chip">
            {phaseLabel}
          </span>
        </div>

        <div className="app-header__actions">
          {importExportActions.map((action) => (
            <PlaceholderButton key={action.id}>
              {action.label}
            </PlaceholderButton>
          ))}
        </div>

        <div className="app-header__studio">
          <span>by</span>
          <img
            className="app-header__studio-logo"
            src={brandAssets.devdevbuildsLogo}
            alt="devdevbuilds"
          />
        </div>
      </div>
    </header>
  );
}
