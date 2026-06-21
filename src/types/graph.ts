export type VaultGraphNode = {
  id: string;
  label: string;
  type: "record" | "source" | "model" | "cluster" | "system";
  refId: string;
  tags: string[];
  weight: number;
};

export type VaultGraphEdge = {
  id: string;
  from: string;
  to: string;
  relationship: "source-of" | "model-of" | "tag-match" | "cluster-member" | "imported-from" | "related-to";
  weight: number;
};

export type BrainCluster = {
  id: string;
  name: string;
  recordIds: string[];
  tags: string[];
  sources: string[];
  models: string[];
  confidence: "Strong" | "Moderate" | "Weak";
  score: number;
};

export type VaultCounters = {
  totalRecords: number;
  demoRecords: number;
  importedRecords: number;
  manualRecords: number;
  registryRecords: number;
  systemRecords: number;
  enabledSources: number;
  disabledSources: number;
  totalSources: number;
  totalModels: number;
  enabledModels: number;
  disabledModels: number;
  totalClusters: number;
  strongClusters: number;
  moderateClusters: number;
  weakClusters: number;
  graphNodes: number;
  graphEdges: number;
};
