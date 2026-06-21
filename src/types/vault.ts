import type { BrainCluster } from "./graph";
import type { ModelRegistryEntry, SourceRegistryEntry } from "./registry";

export type BrainRecordType = "note" | "source" | "model" | "code" | "image" | "document" | "import" | "export" | "system" | "unknown";
export type BrainRecordOrigin = "demo" | "imported" | "manual" | "registry" | "system";

export type BrainRecord = {
  id: string;
  title: string;
  type: BrainRecordType;
  sourceId?: string;
  modelId?: string;
  clusterId?: string;
  tags: string[];
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  origin: BrainRecordOrigin;
  enabled: boolean;
};

export type GhostBrainSnapshot = {
  version: string;
  exportedAt: string;
  app: "GhostBrain Infinity";
  records: BrainRecord[];
  sources: SourceRegistryEntry[];
  models: ModelRegistryEntry[];
  graph: {
    nodes: unknown[];
    edges: unknown[];
  };
  clusters: BrainCluster[];
  settings: {
    demoDataEnabled: boolean;
    selectedScope?: string;
  };
  activitySummary?: {
    eventCount: number;
    latestEventAt?: string;
  };
};
