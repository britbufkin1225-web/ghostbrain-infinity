import type { ActivityEvent } from "../../types";

export const activitySeeds: ActivityEvent[] = [
  {
    id: "activity-phase-1",
    title: "Phase 1 foundation initialized",
    description: "Dashboard shell, seed data, type foundations, and storage helpers are staged.",
    status: "ready",
    timestamp: "2026-06-20T00:00:00.000Z",
  },
  {
    id: "activity-next",
    title: "Future graph and registry wiring",
    description: "Graph rendering, persistence, import/export, and registry CRUD remain intentionally unbuilt.",
    status: "idle",
    timestamp: "2026-06-20T00:00:00.000Z",
  },
];
