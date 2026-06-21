import type { MemoryRoutingStep, ModelRecord, RoutingStatus, SourceRecord } from "../../types";

export interface RoutingArchitectureSnapshot {
  status: RoutingStatus;
  selectedModel: ModelRecord | null;
  selectedSource: SourceRecord | null;
  steps: MemoryRoutingStep[];
}

export function createRoutingArchitectureSnapshot(
  status: RoutingStatus,
  models: ModelRecord[],
  sources: SourceRecord[],
  steps: MemoryRoutingStep[],
): RoutingArchitectureSnapshot {
  return {
    status,
    selectedModel: models.find((model) => model.id === status.selectedModelId) ?? null,
    selectedSource: sources.find((source) => source.id === status.selectedSourceId) ?? null,
    steps,
  };
}

export function canUseCloudModel(model: ModelRecord): boolean {
  return !model.localOnly && model.enabled && !model.requiresApiKey;
}
