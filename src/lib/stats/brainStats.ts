import type { BrainCluster, BrainRecord, BrainSessionActivity, BrainStats, GraphEdge, GraphNode, ModelProvider, ModelRecord, SourceRecord } from "../../types";

const emptySessionActivity: BrainSessionActivity = {
  recordsAddedSession: 0,
  recordsRemovedSession: 0,
  recordsImportedSession: 0,
  recordsIndexedSession: 0,
  modelsDiscoveredSession: 0,
  providersCheckedSession: 0,
  clustersCreatedSession: 0,
  nodesCreatedSession: 0,
  edgesCreatedSession: 0,
};

interface CreateBrainStatsInput {
  sources: SourceRecord[];
  models: ModelRecord[];
  providers?: ModelProvider[];
  records?: BrainRecord[];
  clusters?: BrainCluster[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  sessionActivity?: Partial<BrainSessionActivity>;
}

export function createBrainStats({
  sources,
  models,
  providers = [],
  records,
  clusters = [],
  graphNodes,
  graphEdges,
  sessionActivity = {},
}: CreateBrainStatsInput): BrainStats {
  const activeRecords = records ?? sources.map((source) => ({
    id: source.id,
    title: source.name,
    type: "source" as const,
    sourceId: source.id,
    clusterId: source.clusterId,
    tags: source.tags,
    content: source.description,
    createdAt: source.importedAt ?? source.lastUpdated,
    updatedAt: source.updatedAt ?? source.lastUpdated,
    origin: source.isSynthetic ? "demo" as const : "registry" as const,
    enabled: source.enabled,
  }));
  const indexedRecords = sources.filter((source) => source.indexed).length;
  const mergedSessionActivity = { ...emptySessionActivity, ...sessionActivity };

  return {
    totalRecords: activeRecords.length,
    totalSources: sources.length,
    totalModels: models.length,
    totalProviders: providers.length,
    totalGraphNodes: graphNodes.length,
    totalGraphEdges: graphEdges.length,
    availableModels: models.filter((model) => model.modelStatus === "Available" || model.modelStatus === "Discovered" || model.status === "ready").length,
    enabledModels: models.filter((model) => model.enabled).length,
    disabledModels: models.filter((model) => !model.enabled || model.modelStatus === "Disabled").length,
    onlineProviders: providers.filter((provider) => provider.status === "Online").length,
    offlineProviders: providers.filter((provider) => ["Offline", "Unavailable", "Error"].includes(provider.status)).length,
    indexedRecords,
    unindexedRecords: sources.length - indexedRecords,
    recordsByCluster: countBy(activeRecords, (record) => record.clusterId ?? "unclustered"),
    recordsBySourceType: countBy(sources, (source) => source.sourceType),
    recordsByPrivacyLevel: countBy(sources, (source) => source.privacyLevel),
    modelsByProvider: countBy(models, (model) => model.providerId ?? model.provider),
    modelsByCapability: models.reduce<Record<string, number>>((counts, model) => {
      for (const capability of model.capabilities) {
        counts[capability] = (counts[capability] ?? 0) + 1;
      }
      return counts;
    }, {}),
    totalClusters: clusters.length,
    demoRecords: activeRecords.filter((record) => record.origin === "demo").length,
    importedRecords: activeRecords.filter((record) => record.origin === "imported").length,
    manualRecords: activeRecords.filter((record) => record.origin === "manual").length,
    registryRecords: activeRecords.filter((record) => record.origin === "registry").length,
    systemRecords: activeRecords.filter((record) => record.origin === "system").length,
    enabledSources: sources.filter((source) => source.enabled).length,
    disabledSources: sources.filter((source) => !source.enabled).length,
    strongClusters: clusters.filter((cluster) => cluster.confidence === "Strong").length,
    moderateClusters: clusters.filter((cluster) => cluster.confidence === "Moderate").length,
    weakClusters: clusters.filter((cluster) => cluster.confidence === "Weak").length,
    graphNodesByType: countBy(graphNodes, (node) => node.type ?? "unknown"),
    ...mergedSessionActivity,
  };
}

function countBy<T>(records: T[], getKey: (record: T) => string): Record<string, number> {
  return records.reduce<Record<string, number>>((counts, record) => {
    const key = getKey(record);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
