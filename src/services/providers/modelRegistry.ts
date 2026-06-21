import type { GraphEdge, GraphNode, ModelRecord, VaultState } from "../../types";

export function mergeDiscoveredModels(existingModels: ModelRecord[], discoveredModels: ModelRecord[], providerId: string): ModelRecord[] {
  const discoveredIds = new Set(discoveredModels.map((model) => model.id));
  const updatedExisting = existingModels.map((model) => {
    if (model.providerId !== providerId || model.manuallyAdded) {
      return model;
    }

    if (!discoveredIds.has(model.id)) {
      return { ...model, modelStatus: "Unavailable" as const, status: "warning" as const, enabled: false };
    }

    const discovered = discoveredModels.find((candidate) => candidate.id === model.id);
    return discovered ? { ...model, ...discovered, notes: model.notes || discovered.notes, tags: Array.from(new Set([...model.tags, ...discovered.tags])) } : model;
  });

  const existingIds = new Set(updatedExisting.map((model) => model.id));
  return [...updatedExisting, ...discoveredModels.filter((model) => !existingIds.has(model.id))];
}

export function syncModelGraphRecords(state: VaultState): void {
  const modelNodeIds = new Set(state.models.map((model) => `node-${model.id}`));
  const providerNodeIds = new Set(state.providers.map((provider) => `node-${provider.id}`));

  state.graphNodes = state.graphNodes.filter((node) => node.type !== "model" && node.type !== "system");
  state.graphEdges = state.graphEdges.filter((edge) => !edge.relationship.includes("provider") && !edge.relationship.includes("model"));

  const providerNodes: GraphNode[] = state.providers.map((provider) => ({
    id: `node-${provider.id}`,
    label: provider.name,
    category: "LLM",
    status: provider.status === "Online" ? "ready" : provider.status === "Error" ? "danger" : provider.status === "Disabled" ? "idle" : "warning",
    type: "system",
    isSynthetic: false,
  }));

  const modelNodes: GraphNode[] = state.models.map((model) => ({
    id: `node-${model.id}`,
    label: model.displayName ?? model.name,
    category: model.category,
    status: model.enabled ? "ready" : "idle",
    modelId: model.id,
    type: "model",
    isSynthetic: model.isSynthetic,
  }));

  const edges: GraphEdge[] = state.models
    .filter((model) => model.providerId && providerNodeIds.has(`node-${model.providerId}`) && modelNodeIds.has(`node-${model.id}`))
    .map((model) => ({
      id: `edge-${model.providerId}-${model.id}`,
      sourceId: `node-${model.providerId}`,
      targetId: `node-${model.id}`,
      relationship: "provides-model",
      isSynthetic: model.isSynthetic,
    }));

  state.graphNodes.push(...providerNodes, ...modelNodes);
  state.graphEdges.push(...edges);
}
