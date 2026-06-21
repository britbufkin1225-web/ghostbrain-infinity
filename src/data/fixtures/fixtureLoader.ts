import type {
  ActivityEvent,
  DemoDataMode,
  GraphEdge,
  GraphNode,
  ModelRecord,
  SourceRecord,
  SyntheticCluster,
  SyntheticManifest,
} from "../../types";
import activityEvents from "./synthetic-activity-events.json";
import clusters from "./synthetic-clusters.json";
import graphEdges from "./synthetic-graph-edges.json";
import graphNodes from "./synthetic-graph-nodes.json";
import manifest from "./synthetic-manifest.json";
import models from "./synthetic-models.json";
import sources from "./synthetic-sources.json";

export interface SyntheticFixtureVault {
  mode: DemoDataMode;
  manifest: SyntheticManifest;
  sources: SourceRecord[];
  models: ModelRecord[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  activityEvents: ActivityEvent[];
  clusters: SyntheticCluster[];
}

export function loadSyntheticFixtureVault(): SyntheticFixtureVault {
  return {
    mode: "Demo Data Mode",
    manifest: manifest as SyntheticManifest,
    sources: sources as SourceRecord[],
    models: models as ModelRecord[],
    graphNodes: graphNodes as GraphNode[],
    graphEdges: graphEdges as GraphEdge[],
    activityEvents: activityEvents as ActivityEvent[],
    clusters: clusters as SyntheticCluster[],
  };
}
