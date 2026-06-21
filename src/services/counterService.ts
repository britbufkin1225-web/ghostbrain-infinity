import type { BrainCluster, BrainRecord, VaultCounters, VaultState } from "../types";

export function createVaultCounters(vault: VaultState, records: BrainRecord[], clusters: BrainCluster[]): VaultCounters {
  return {
    totalRecords: records.length,
    demoRecords: records.filter((record) => record.origin === "demo").length,
    importedRecords: records.filter((record) => record.origin === "imported").length,
    manualRecords: records.filter((record) => record.origin === "manual").length,
    registryRecords: records.filter((record) => record.origin === "registry").length,
    systemRecords: records.filter((record) => record.origin === "system").length,
    enabledSources: vault.sources.filter((source) => source.enabled).length,
    disabledSources: vault.sources.filter((source) => !source.enabled).length,
    totalSources: vault.sources.length,
    totalModels: vault.models.length,
    enabledModels: vault.models.filter((model) => model.enabled).length,
    disabledModels: vault.models.filter((model) => !model.enabled).length,
    totalClusters: clusters.length,
    strongClusters: clusters.filter((cluster) => cluster.confidence === "Strong").length,
    moderateClusters: clusters.filter((cluster) => cluster.confidence === "Moderate").length,
    weakClusters: clusters.filter((cluster) => cluster.confidence === "Weak").length,
    graphNodes: vault.graphNodes.length,
    graphEdges: vault.graphEdges.length,
  };
}
