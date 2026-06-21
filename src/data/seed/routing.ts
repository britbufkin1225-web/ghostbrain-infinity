import type { MemoryRoutingStep, RoutingStatus } from "../../types";

export const routingStatusSeed: RoutingStatus = {
  selectedModelId: "model-qwen-local",
  selectedSourceId: "source-local-notes",
  routingMode: "LocalFirst",
  localCloudMode: "Local Only",
  retrievalStatus: "Architecture Ready",
  indexingStatus: "Index Pending",
  adapterStatus: "Adapter Pending",
  notes: "Routing is represented as architecture only. No AI execution, vector search, or cloud calls are wired.",
};

export const memoryRoutingSteps: MemoryRoutingStep[] = [
  {
    id: "input",
    label: "User/source input",
    description: "Accept manual or imported source references in a later workflow.",
    status: "Architecture Ready",
  },
  {
    id: "normalize",
    label: "Normalize source record",
    description: "Map incoming material into the SourceRecord shape.",
    status: "Architecture Ready",
  },
  {
    id: "metadata",
    label: "Store metadata",
    description: "Persist source/model metadata locally before any optional indexing.",
    status: "Local Stub",
  },
  {
    id: "index",
    label: "Optionally index content",
    description: "Future parsing, chunking, embeddings, and index status tracking.",
    status: "Index Pending",
  },
  {
    id: "retrieve",
    label: "Retrieve relevant records",
    description: "Future retrieval layer for source-linked context.",
    status: "Index Pending",
  },
  {
    id: "route",
    label: "Route to selected model",
    description: "Prefer local model routes unless cloud is explicitly configured.",
    status: "Adapter Pending",
  },
  {
    id: "answer",
    label: "Return linked response",
    description: "Future response output with source context and confidence metadata.",
    status: "Adapter Pending",
  },
];
