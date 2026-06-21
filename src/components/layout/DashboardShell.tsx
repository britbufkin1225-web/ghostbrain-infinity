import type { ReactNode } from "react";
import { brandAssets } from "../../config/brandAssets";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: ReactNode;
  telemetry?: ReactNode;
}

export function DashboardShell({ children, telemetry }: DashboardShellProps) {
  return (
    <div className="app-shell">
      <AppHeader telemetry={telemetry} />
      <div className="dashboard-frame">
        <Sidebar />
        {children}
      </div>
      <footer className="studio-footer" aria-label="Studio credit">
        <img src={brandAssets.devdevbuildsFooterMark} alt="devdevbuilds studio credit" />
        <span>devdevbuilds studio system / GhostBrain Infinity</span>
      </footer>
    </div>
  );
}
