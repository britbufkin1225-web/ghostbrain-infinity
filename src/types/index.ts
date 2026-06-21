export type RegistryCategory =
  | "LLM"
  | "Code"
  | "Image"
  | "Music"
  | "Video"
  | "Audio"
  | "Research"
  | "Local"
  | "Manual"
  | "Unknown";

export type SystemStatus = "idle" | "ready" | "warning" | "danger";

export type ProviderType =
  | "Ollama"
  | "Local LLM"
  | "OpenAI-Compatible"
  | "Gemini"
  | "Claude"
  | "OpenAI-compatible API"
  | "Manual Source"
  | "Imported File"
  | "Research Source"
  | "Manual"
  | "Unknown";

export type ProviderStatus = "Online" | "Offline" | "Unavailable" | "Not Checked" | "Error" | "Disabled" | "Configuration Required";

export type ModelType =
  | "LLM"
  | "Embedding"
  | "Vision"
  | "Audio"
  | "SpeechToText"
  | "TextToSpeech"
  | "Code"
  | "Research"
  | "Unknown";

export type ModelCapability =
  | "chat"
  | "summarize"
  | "embed"
  | "transcribe"
  | "speak"
  | "analyzeImage"
  | "codeAssist"
  | "retrieve"
  | "route"
  | "unknown";

export type ModelStatus = "Available" | "Unavailable" | "Disabled" | "Discovered" | "Manual" | "Error" | "Pending";

export type SourceType =
  | "Document"
  | "Markdown"
  | "Text"
  | "JSON"
  | "Code"
  | "Image"
  | "Audio"
  | "Video"
  | "Research"
  | "Manual"
  | "LocalFolder"
  | "Unknown";

export type StorageMode = "Local" | "CloudReference" | "Hybrid" | "LocalState" | "LocalStorage" | "ExportedJSON" | "FutureDatabase" | "Unknown";

export type PrivacyLevel = "LocalOnly" | "CloudAllowed" | "Sensitive" | "Public" | "Unknown";

export type VaultMode = "Empty Vault" | "Demo Data Mode" | "Real Data Mode" | "Mixed Data Mode";

export type SourceOrigin = "Synthetic Demo" | "User Import" | "Manual Entry" | "Export Restore" | "Unknown";

export type SourceStatus = "Active" | "Disabled" | "Pending Index" | "Indexed" | "Error" | "Synthetic" | "Imported";

export type RoutingMode = "LocalFirst" | "CloudOptional" | "ManualReview";

export type RetrievalStatus = "Architecture Ready" | "Adapter Pending" | "Index Pending" | "Local Stub" | "Cloud Disabled";

export interface SourceRecord {
  id: string;
  name: string;
  sourceType: SourceType;
  category: RegistryCategory;
  origin: string;
  description: string;
  status: SystemStatus;
  sourceStatus?: SourceStatus;
  enabled: boolean;
  storageMode: StorageMode;
  privacyLevel: PrivacyLevel;
  indexed: boolean;
  cluster?: string;
  sourceOrigin?: SourceOrigin;
  fileName?: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  contentPreview?: string;
  contentHash?: string;
  importedAt?: string;
  updatedAt?: string;
  lastIndexedAt?: string;
  lastImported: string | null;
  lastUpdated: string;
  recordCount: number;
  tags: string[];
  notes: string;
  clusterId?: string;
  fixtureKind?: "Synthetic Test Corpus" | "Development Fixture" | "Seed Data";
  isSynthetic?: boolean;
  safeToDelete?: boolean;
}

export interface ModelRecord {
  id: string;
  name: string;
  displayName?: string;
  providerId?: string;
  provider: string;
  providerType: ProviderType;
  modelType: ModelType;
  category: RegistryCategory;
  description: string;
  status: SystemStatus;
  modelStatus?: ModelStatus;
  enabled: boolean;
  localOnly: boolean;
  requiresApiKey: boolean;
  discovered?: boolean;
  manuallyAdded?: boolean;
  contextWindow: number | null;
  parameterSize?: string;
  quantization?: string;
  capabilities: ModelCapability[];
  tags: string[];
  lastSeenAt?: string;
  lastUsedAt?: string;
  lastUsed: string | null;
  notes: string;
  clusterId?: string;
  fixtureKind?: "Synthetic Test Corpus" | "Development Fixture" | "Seed Data";
  isSynthetic?: boolean;
  safeToDelete?: boolean;
}

export interface ModelProvider {
  id: string;
  name: string;
  providerType: ProviderType;
  baseUrl?: string;
  status: ProviderStatus;
  enabled: boolean;
  localOnly: boolean;
  requiresApiKey: boolean;
  supportsDiscovery: boolean;
  supportsChat: boolean;
  supportsEmbeddings: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  lastCheckedAt?: string;
  lastError?: string;
  notes?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  category: RegistryCategory;
  status: SystemStatus;
  clusterId?: string;
  sourceId?: string;
  modelId?: string;
  type?: "source" | "model" | "cluster" | "system" | "unknown";
  isSynthetic?: boolean;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  clusterId?: string;
  isSynthetic?: boolean;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  status: SystemStatus;
  timestamp: string;
  clusterId?: string;
  sourceId?: string;
  modelId?: string;
  eventType?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";
  relatedSourceId?: string;
  relatedNodeId?: string;
  isSynthetic?: boolean;
}

export interface FilterState {
  categories: RegistryCategory[];
  statuses: SystemStatus[];
  query: string;
}

export interface AppStatus {
  mode: "foundation" | "development" | "review";
  localStorage: SystemStatus;
  registryCount: number;
  graphNodeCount: number;
  activeFilters: number;
}

export interface RoutingStatus {
  selectedModelId: string | null;
  selectedSourceId: string | null;
  routingMode: RoutingMode;
  localCloudMode: "Local Only" | "Cloud Optional" | "Disabled";
  retrievalStatus: RetrievalStatus;
  indexingStatus: RetrievalStatus;
  adapterStatus: RetrievalStatus;
  notes: string;
}

export interface MemoryRoutingStep {
  id: string;
  label: string;
  description: string;
  status: RetrievalStatus;
}

export type DemoDataMode = "Demo Data Mode" | "Real Data Mode" | "Mixed Data Mode" | "Empty Vault";

export interface SyntheticCluster {
  id: string;
  label: string;
  description: string;
  category: RegistryCategory;
  sourceType: SourceType;
  recordCount: number;
  nodeCount: number;
  edgeCount: number;
  status: RetrievalStatus;
}

export interface SyntheticManifest {
  datasetName: string;
  datasetVersion: string;
  recordCount: number;
  modelCount: number;
  nodeCount: number;
  edgeCount: number;
  clusterCount: number;
  activityEventCount: number;
  createdFor: string;
  isSynthetic: boolean;
  safeToDelete: boolean;
  replacementTarget: string;
  notes: string;
}

export interface BrainSessionActivity {
  recordsAddedSession: number;
  recordsRemovedSession: number;
  recordsImportedSession: number;
  recordsIndexedSession: number;
  modelsDiscoveredSession: number;
  providersCheckedSession: number;
  clustersCreatedSession: number;
  nodesCreatedSession: number;
  edgesCreatedSession: number;
}

export interface BrainStats extends BrainSessionActivity {
  totalRecords: number;
  totalSources: number;
  totalModels: number;
  totalProviders: number;
  totalGraphNodes: number;
  totalGraphEdges: number;
  availableModels: number;
  enabledModels: number;
  disabledModels: number;
  onlineProviders: number;
  offlineProviders: number;
  indexedRecords: number;
  unindexedRecords: number;
  recordsByCluster: Record<string, number>;
  recordsBySourceType: Record<string, number>;
  recordsByPrivacyLevel: Record<string, number>;
  modelsByProvider: Record<string, number>;
  modelsByCapability: Record<string, number>;
  totalClusters: number;
  demoRecords: number;
  importedRecords: number;
  manualRecords: number;
  registryRecords: number;
  systemRecords: number;
  enabledSources: number;
  disabledSources: number;
  strongClusters: number;
  moderateClusters: number;
  weakClusters: number;
  graphNodesByType: Record<string, number>;
}

export interface VaultFilters {
  cluster: string;
  sourceType: string;
  origin: string;
  privacyLevel: string;
  enabled: "all" | "enabled" | "disabled";
  indexed: "all" | "indexed" | "unindexed";
  synthetic: "all" | "synthetic" | "real";
  searchText: string;
}

export interface VaultState {
  mode: VaultMode;
  records: BrainRecord[];
  sources: SourceRecord[];
  models: ModelRecord[];
  providers: ModelProvider[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  clusters: BrainCluster[];
  activityEvents: ActivityEvent[];
  selectedSourceId?: string;
  selectedNodeId?: string;
  selectedRecordId?: string;
  selectedClusterId?: string;
  activeFilters: VaultFilters;
  lastUpdated: string;
}

export interface VaultExport {
  schemaVersion: string;
  appName: "GhostBrain Infinity";
  exportedAt: string;
  mode: VaultMode;
  metadata: {
    sourceCount: number;
    modelCount: number;
    providerCount?: number;
    nodeCount: number;
    edgeCount: number;
    eventCount: number;
  };
  vault: VaultState;
  snapshot?: GhostBrainSnapshot;
}

export type ConsoleMode = "search" | "test" | "cluster" | "help" | "system";

export type ConsoleStatus = "success" | "warning" | "blocked" | "error";

export type SafeExecutionMode = "safe-mode" | "dry-run" | "mock-test" | "blocked" | "local-only";

export interface ConsoleEntry {
  id: string;
  timestamp: string;
  command: string;
  mode: ConsoleMode;
  status: ConsoleStatus;
  safetyMode: SafeExecutionMode;
  summary: string;
  details?: unknown;
  durationMs?: number;
}

export interface ModelTestResult {
  id: string;
  modelId: string;
  modelName: string;
  modelType: string;
  prompt: string;
  safetyMode: SafeExecutionMode;
  status: ConsoleStatus;
  requestPreview: Record<string, unknown>;
  mockResponse: string;
  timestamp: string;
  durationMs: number;
}

export interface DemoBrainRecord {
  id: string;
  title: string;
  type: string;
  source: string;
  tags: string[];
  content: string;
  createdAt: string;
}

export type { SearchResult, QueryConsoleSettings } from "./console";
export type { BrainCluster, VaultCounters, VaultGraphEdge, VaultGraphNode } from "./graph";
export type { ModelRegistryEntry, SourceRegistryEntry } from "./registry";
export type { BrainRecord, BrainRecordOrigin, BrainRecordType, GhostBrainSnapshot } from "./vault";
import type { BrainCluster } from "./graph";
import type { BrainRecord, GhostBrainSnapshot } from "./vault";
