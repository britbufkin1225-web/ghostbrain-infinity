import type { GraphEdge, GraphNode } from "../../types";

export const graphNodeSeeds: GraphNode[] = [
  {
    id: "node-core",
    label: "GhostBrain Core",
    category: "Local",
    status: "ready",
  },
  {
    id: "node-source",
    label: "Source Registry",
    category: "Manual",
    status: "idle",
  },
  {
    id: "node-model",
    label: "Model Registry",
    category: "LLM",
    status: "idle",
  },
];

export const graphEdgeSeeds: GraphEdge[] = [
  {
    id: "edge-core-source",
    sourceId: "node-core",
    targetId: "node-source",
    relationship: "indexes",
  },
  {
    id: "edge-core-model",
    sourceId: "node-core",
    targetId: "node-model",
    relationship: "routes",
  },
];
