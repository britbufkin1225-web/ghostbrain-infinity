import type { GhostBrainSnapshot, VaultState } from "../types";
import { getStoredJson, setStoredJson } from "../lib/storage/localStorage";

export const phase6StorageKeys = {
  legacyVault: "ghostbrain-infinity:vault-state",
  records: "ghostbrain.vault.records",
  sources: "ghostbrain.vault.sources",
  models: "ghostbrain.vault.models",
  graph: "ghostbrain.vault.graph",
  clusters: "ghostbrain.vault.clusters",
  activity: "ghostbrain.activity.feed",
  snapshotVersion: "ghostbrain.snapshot.version",
  consoleHistory: "ghostbrain.console.history",
  consoleScope: "ghostbrain.console.scope",
  consoleDemoDataEnabled: "ghostbrain.console.demoDataEnabled",
} as const;

export function readStoredVault(fallback: VaultState): VaultState {
  const legacyVault = getStoredJson<VaultState | null>(phase6StorageKeys.legacyVault, null);
  if (legacyVault?.sources && Array.isArray(legacyVault.sources)) {
    return legacyVault;
  }

  return {
    ...fallback,
    records: getStoredJson(phase6StorageKeys.records, fallback.records),
    sources: getStoredJson(phase6StorageKeys.sources, fallback.sources),
    models: getStoredJson(phase6StorageKeys.models, fallback.models),
    clusters: getStoredJson(phase6StorageKeys.clusters, fallback.clusters),
    activityEvents: getStoredJson(phase6StorageKeys.activity, fallback.activityEvents),
    graphNodes: getStoredJson<{ nodes: VaultState["graphNodes"]; edges: VaultState["graphEdges"] }>(phase6StorageKeys.graph, {
      nodes: fallback.graphNodes,
      edges: fallback.graphEdges,
    }).nodes,
    graphEdges: getStoredJson<{ nodes: VaultState["graphNodes"]; edges: VaultState["graphEdges"] }>(phase6StorageKeys.graph, {
      nodes: fallback.graphNodes,
      edges: fallback.graphEdges,
    }).edges,
  };
}

export function writeStoredVault(vault: VaultState, snapshotVersion: string): void {
  setStoredJson(phase6StorageKeys.legacyVault, vault);
  setStoredJson(phase6StorageKeys.records, vault.records);
  setStoredJson(phase6StorageKeys.sources, vault.sources);
  setStoredJson(phase6StorageKeys.models, vault.models);
  setStoredJson(phase6StorageKeys.graph, { nodes: vault.graphNodes, edges: vault.graphEdges });
  setStoredJson(phase6StorageKeys.clusters, vault.clusters);
  setStoredJson(phase6StorageKeys.activity, vault.activityEvents);
  setStoredJson(phase6StorageKeys.snapshotVersion, snapshotVersion);
}

export function isGhostBrainSnapshot(value: unknown): value is GhostBrainSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GhostBrainSnapshot>;
  return candidate.app === "GhostBrain Infinity" && typeof candidate.version === "string" && Array.isArray(candidate.records) && Array.isArray(candidate.sources) && Array.isArray(candidate.models) && Array.isArray(candidate.clusters);
}
