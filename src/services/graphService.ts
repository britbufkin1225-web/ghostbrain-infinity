import type { BrainCluster, BrainRecord, GraphEdge, GraphNode, VaultState } from "../types";

export function deriveGraphFromVaultState(vault: VaultState, records: BrainRecord[], clusters: BrainCluster[]): Pick<VaultState, "graphNodes" | "graphEdges"> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const cluster of clusters) {
    nodes.push({
      id: `cluster-node-${cluster.id}`,
      label: cluster.name,
      category: "Manual",
      status: cluster.confidence === "Strong" ? "ready" : cluster.confidence === "Moderate" ? "warning" : "idle",
      clusterId: cluster.id,
      type: "cluster",
      isSynthetic: cluster.recordIds.some((recordId) => records.find((record) => record.id === recordId)?.origin === "demo"),
    });
  }

  for (const source of vault.sources) {
    nodes.push({
      id: `node-${source.id}`,
      label: source.name,
      category: source.category,
      status: source.enabled ? "ready" : "idle",
      clusterId: source.clusterId ?? source.cluster,
      sourceId: source.id,
      type: "source",
      isSynthetic: source.isSynthetic,
    });
  }

  for (const provider of vault.providers) {
    nodes.push({
      id: `node-${provider.id}`,
      label: provider.name,
      category: "LLM",
      status: provider.status === "Online" ? "ready" : provider.status === "Disabled" ? "idle" : "warning",
      type: "system",
      isSynthetic: false,
    });
  }

  for (const model of vault.models) {
    nodes.push({
      id: `node-${model.id}`,
      label: model.displayName ?? model.name,
      category: model.category,
      status: model.enabled ? "ready" : "idle",
      modelId: model.id,
      clusterId: model.clusterId,
      type: "model",
      isSynthetic: model.isSynthetic,
    });
  }

  const importantRecords = records.filter((record) => record.origin !== "registry").slice(0, 36);
  for (const record of importantRecords) {
    nodes.push({
      id: `node-${record.id}`,
      label: record.title,
      category: record.type === "code" ? "Code" : record.type === "model" ? "LLM" : "Manual",
      status: record.enabled ? "ready" : "idle",
      clusterId: record.clusterId,
      sourceId: record.sourceId,
      modelId: record.modelId,
      type: "unknown",
      isSynthetic: record.origin === "demo",
    });
  }

  for (const record of records) {
    const recordNodeId = `node-${record.id}`;
    if (record.clusterId) {
      edges.push(edge(`edge-${record.id}-cluster`, recordNodeId, `cluster-node-${normalizeClusterId(record.clusterId)}`, "cluster-member", record.clusterId, record.origin === "demo"));
    }
    if (record.sourceId) {
      edges.push(edge(`edge-${record.id}-source`, recordNodeId, `node-${record.sourceId}`, "source-of", record.clusterId, record.origin === "demo"));
    }
    if (record.modelId) {
      edges.push(edge(`edge-${record.id}-model`, recordNodeId, `node-${record.modelId}`, "model-of", record.clusterId, record.origin === "demo"));
    }
  }

  for (const model of vault.models) {
    if (model.providerId) {
      edges.push(edge(`edge-${model.providerId}-${model.id}`, `node-${model.providerId}`, `node-${model.id}`, "model-of", model.clusterId, model.isSynthetic));
    }
  }

  return {
    graphNodes: dedupeNodes(nodes),
    graphEdges: dedupeEdges(edges).filter((candidate) => nodes.some((node) => node.id === candidate.sourceId) && nodes.some((node) => node.id === candidate.targetId)),
  };
}

function edge(id: string, sourceId: string, targetId: string, relationship: string, clusterId?: string, isSynthetic?: boolean): GraphEdge {
  return { id, sourceId, targetId, relationship, clusterId, isSynthetic };
}

function dedupeNodes(nodes: GraphNode[]): GraphNode[] {
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values());
}

function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  return Array.from(new Map(edges.map((edgeValue) => [edgeValue.id, edgeValue])).values());
}

function normalizeClusterId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "uncategorized";
}
