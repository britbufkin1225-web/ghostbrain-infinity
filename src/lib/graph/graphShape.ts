import type { GraphEdge, GraphNode } from "../../types";

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
