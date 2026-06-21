import { loadSyntheticFixtureVault } from "../../data/fixtures/fixtureLoader";
import { clusterVault } from "../../services/clusterService";
import { deriveGraphFromVaultState } from "../../services/graphService";
import { createDefaultProviders } from "../../services/providers/providerRegistry";
import { syncModelGraphRecords } from "../../services/providers/modelRegistry";
import { isGhostBrainSnapshot } from "../../services/storageService";
import { buildActiveBrainRecords, modelToRegistryEntry, normalizeVaultState, sourceToRegistryEntry } from "../../services/vaultState";
import type {
  ActivityEvent,
  BrainCluster,
  GraphEdge,
  GraphNode,
  GhostBrainSnapshot,
  PrivacyLevel,
  SourceRecord,
  SourceOrigin,
  SourceType,
  VaultExport,
  VaultFilters,
  VaultMode,
  VaultState,
} from "../../types";

export const vaultStateStorageKey = "ghostbrain-infinity:vault-state";
export const vaultSchemaVersion = "0.6.0";

export const supportedImportExtensions = new Set(["txt", "md", "json", "csv", "html", "css", "js", "ts", "tsx", "jsx", "py"]);

export function createDefaultFilters(): VaultFilters {
  return {
    cluster: "all",
    sourceType: "all",
    origin: "all",
    privacyLevel: "all",
    enabled: "all",
    indexed: "all",
    synthetic: "all",
    searchText: "",
  };
}

export function createEmptyVaultState(): VaultState {
  return {
    mode: "Empty Vault",
    records: [],
    sources: [],
    providers: createDefaultProviders(),
    models: [],
    graphNodes: [],
    graphEdges: [],
    clusters: [],
    activityEvents: [],
    activeFilters: createDefaultFilters(),
    lastUpdated: new Date().toISOString(),
  };
}

export function createDemoVaultState(): VaultState {
  const fixture = loadSyntheticFixtureVault();
  const state: VaultState = {
    mode: "Demo Data Mode",
    sources: fixture.sources.map((source) => normalizeSourceRecord(source, "Synthetic Demo")),
    providers: createDefaultProviders(),
    models: fixture.models.map((model) => ({
      ...model,
      providerId: model.providerId ?? (model.providerType === "Ollama" || model.providerType === "Local LLM" ? "provider-ollama-local" : "provider-manual"),
      displayName: model.displayName ?? model.name,
      modelStatus: model.modelStatus ?? (model.enabled ? "Manual" : "Disabled"),
      discovered: model.discovered ?? false,
      manuallyAdded: model.manuallyAdded ?? false,
      isSynthetic: model.isSynthetic ?? true,
      safeToDelete: model.safeToDelete ?? true,
    })),
    graphNodes: fixture.graphNodes.map((node) => ({ ...node, type: node.type ?? "source", isSynthetic: true })),
    graphEdges: fixture.graphEdges.map((edge) => ({ ...edge, isSynthetic: true })),
    records: [],
    clusters: [],
    activityEvents: fixture.activityEvents.map((event) => ({ ...event, eventType: event.eventType ?? "synthetic-activity", isSynthetic: true })),
    activeFilters: createDefaultFilters(),
    lastUpdated: new Date().toISOString(),
  };
  return refreshVaultDerivedState(state, true);
}

export function normalizeSourceRecord(source: SourceRecord, origin: SourceOrigin = "Unknown"): SourceRecord {
  const now = new Date().toISOString();
  const isSynthetic = origin === "Synthetic Demo" || source.fixtureKind === "Synthetic Test Corpus" || source.isSynthetic === true;
  return {
    ...source,
    cluster: source.cluster ?? source.clusterId ?? "Uncategorized",
    sourceOrigin: source.sourceOrigin ?? origin,
    sourceStatus: source.sourceStatus ?? (isSynthetic ? "Synthetic" : source.indexed ? "Indexed" : "Pending Index"),
    importedAt: source.importedAt ?? source.lastImported ?? now,
    updatedAt: source.updatedAt ?? source.lastUpdated ?? now,
    contentPreview: source.contentPreview ?? source.description,
    isSynthetic,
    safeToDelete: source.safeToDelete ?? isSynthetic,
  };
}

export function deriveVaultMode(sources: SourceRecord[]): VaultMode {
  if (sources.length === 0) return "Empty Vault";
  const syntheticCount = sources.filter((source) => source.isSynthetic).length;
  if (syntheticCount === sources.length) return "Demo Data Mode";
  if (syntheticCount === 0) return "Real Data Mode";
  return "Mixed Data Mode";
}

export function inferSourceType(fileName: string): SourceType {
  const extension = getFileExtension(fileName);
  if (extension === "md") return "Markdown";
  if (extension === "txt") return "Text";
  if (extension === "json") return "JSON";
  if (extension === "csv") return "Document";
  if (["js", "ts", "tsx", "jsx", "py", "html", "css"].includes(extension)) return "Code";
  return "Unknown";
}

export function inferCluster(text: string): string {
  const value = text.toLowerCase();
  const rules: Array<[string, string[]]> = [
    ["Cybersecurity", ["security", "soc", "firewall", "auth", "scan", "threat"]],
    ["Code Projects", ["component", "api", "route", "backend", "frontend", "function"]],
    ["AI Models", ["model", "ollama", "llm", "qwen", "llama", "embedding"]],
    ["Research", ["research", "source", "citation", "article", "paper"]],
    ["Creative Assets", ["logo", "brand", "asset", "icon", "style", "dashboard"]],
    ["Voice Layer", ["voice", "audio", "transcript", "tts", "stt"]],
    ["Import/Export", ["import", "export", "json", "registry", "backup"]],
  ];
  return rules.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)))?.[0] ?? "Uncategorized";
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

export function createContentPreview(content: string, maxLength = 320): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "Empty file.";
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

export function createContentHash(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(16)}`;
}

export async function createSourceFromFile(file: File): Promise<{ source?: SourceRecord; error?: string }> {
  const extension = getFileExtension(file.name);
  if (!supportedImportExtensions.has(extension)) {
    return { error: "Unsupported file type. This phase supports text, markdown, JSON, CSV, and common code files." };
  }

  const content = await file.text();
  if (!content.trim()) return { error: "Empty file. No source record was created." };

  const now = new Date().toISOString();
  const sourceType = inferSourceType(file.name);
  const cluster = inferCluster(`${file.name} ${content}`);
  const contentPreview = createContentPreview(content);
  const contentHash = createContentHash(`${file.name}:${file.size}:${content}`);

  return {
    source: {
      id: `source-import-${Date.now()}-${contentHash}`,
      name: file.name,
      sourceType,
      category: sourceType === "Code" ? "Code" : sourceType === "Audio" ? "Audio" : sourceType === "Image" ? "Image" : cluster === "Research" ? "Research" : "Manual",
      cluster,
      clusterId: cluster,
      status: "ready",
      sourceStatus: "Imported",
      enabled: true,
      origin: "User Import",
      sourceOrigin: "User Import",
      storageMode: "LocalStorage",
      privacyLevel: "LocalOnly",
      indexed: false,
      lastImported: now,
      lastUpdated: now,
      importedAt: now,
      updatedAt: now,
      recordCount: 1,
      tags: ["imported", extension || "unknown"],
      notes: "Imported local source record. Indexing is pending.",
      description: contentPreview,
      fileName: file.name,
      fileExtension: extension,
      fileSizeBytes: file.size,
      mimeType: file.type || "text/plain",
      contentPreview,
      contentHash,
      isSynthetic: false,
      safeToDelete: false,
    },
  };
}

export function createManualSource(input: { title: string; cluster: string; sourceType: SourceType; privacyLevel: PrivacyLevel; tags: string[]; notes: string }): SourceRecord {
  const now = new Date().toISOString();
  const contentHash = createContentHash(input.title + input.notes);
  return {
    id: `source-manual-${Date.now()}-${contentHash}`,
    name: input.title,
    sourceType: input.sourceType,
    category: input.sourceType === "Code" ? "Code" : input.sourceType === "Audio" ? "Audio" : input.cluster === "Research" ? "Research" : "Manual",
    cluster: input.cluster,
    clusterId: input.cluster,
    status: "ready",
    sourceStatus: "Active",
    enabled: true,
    origin: "Manual Entry",
    sourceOrigin: "Manual Entry",
    storageMode: "LocalStorage",
    privacyLevel: input.privacyLevel,
    indexed: false,
    lastImported: null,
    lastUpdated: now,
    importedAt: now,
    updatedAt: now,
    recordCount: 1,
    tags: input.tags,
    notes: input.notes,
    description: createContentPreview(input.notes || input.title),
    contentPreview: createContentPreview(input.notes || input.title),
    contentHash,
    isSynthetic: false,
    safeToDelete: false,
  };
}

export function hasDuplicateSource(sources: SourceRecord[], source: SourceRecord): boolean {
  return sources.some(
    (existing) =>
      (source.contentHash && existing.contentHash === source.contentHash) ||
      (source.fileName && existing.fileName === source.fileName && existing.fileSizeBytes === source.fileSizeBytes),
  );
}

export function addSourceGraphRecords(state: VaultState, source: SourceRecord): void {
  const clusterId = source.clusterId ?? source.cluster ?? "Uncategorized";
  const clusterNodeId = `cluster-node-${slugify(clusterId)}`;
  const sourceNodeId = `node-${source.id}`;

  if (!state.graphNodes.some((node) => node.id === clusterNodeId)) {
    state.graphNodes.push({ id: clusterNodeId, label: clusterId, category: source.category, status: "ready", clusterId, type: "cluster", isSynthetic: source.isSynthetic });
  }

  state.graphNodes.push({ id: sourceNodeId, label: source.name, category: source.category, status: source.enabled ? "ready" : "idle", clusterId, sourceId: source.id, type: "source", isSynthetic: source.isSynthetic });
  state.graphEdges.push({ id: `edge-${source.id}-cluster`, sourceId: sourceNodeId, targetId: clusterNodeId, relationship: "belongs-to-cluster", clusterId, isSynthetic: source.isSynthetic });
}

export function refreshVaultDerivedState(state: VaultState, includeDemoConsoleRecords = false): VaultState {
  const withRecords = normalizeVaultState(state, { includeDemoConsoleRecords });
  const clusters = clusterVault({ vaultState: withRecords, includeDemoData: includeDemoConsoleRecords });
  const graph = deriveGraphFromVaultState({ ...withRecords, clusters }, withRecords.records, clusters);
  return {
    ...withRecords,
    clusters,
    graphNodes: graph.graphNodes,
    graphEdges: graph.graphEdges,
  };
}

export function removeSourceGraphRecords(state: VaultState, sourceId: string): void {
  const removedNodeIds = new Set(state.graphNodes.filter((node) => node.sourceId === sourceId).map((node) => node.id));
  state.graphNodes = state.graphNodes.filter((node) => node.sourceId !== sourceId);
  state.graphEdges = state.graphEdges.filter((edge) => !removedNodeIds.has(edge.sourceId) && !removedNodeIds.has(edge.targetId));
}

export function addActivity(state: VaultState, title: string, description: string, severity: ActivityEvent["severity"] = "info", sourceId?: string): void {
  const event: ActivityEvent = {
    id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    description,
    message: description,
    eventType: title.toLowerCase().replaceAll(" ", "-"),
    status: severity === "error" ? "danger" : severity === "warning" ? "warning" : "ready",
    severity,
    timestamp: new Date().toISOString(),
    relatedSourceId: sourceId,
    sourceId,
    isSynthetic: false,
  };
  state.activityEvents = [event, ...state.activityEvents].slice(0, 90);
}

export function serializeVaultExport(vault: VaultState): VaultExport {
  const normalizedVault = refreshVaultDerivedState(vault, false);
  const snapshot = serializeGhostBrainSnapshot(normalizedVault);
  return {
    schemaVersion: vaultSchemaVersion,
    appName: "GhostBrain Infinity",
    exportedAt: new Date().toISOString(),
    mode: normalizedVault.mode,
    metadata: {
      sourceCount: normalizedVault.sources.length,
      modelCount: normalizedVault.models.length,
      providerCount: normalizedVault.providers.length,
      nodeCount: normalizedVault.graphNodes.length,
      edgeCount: normalizedVault.graphEdges.length,
      eventCount: normalizedVault.activityEvents.length,
    },
    vault: normalizedVault,
    snapshot,
  };
}

export function parseVaultExport(value: unknown): { vault?: VaultState; error?: string } {
  if (!value || typeof value !== "object") return { error: "Invalid GhostBrain vault export. No data was changed." };
  if (isGhostBrainSnapshot(value)) {
    return parseGhostBrainSnapshot(value);
  }
  const candidate = value as Partial<VaultExport>;
  if (candidate.appName !== "GhostBrain Infinity" || !candidate.vault) return { error: "Invalid GhostBrain vault export. No data was changed." };
  const vault = candidate.vault as Partial<VaultState>;
  if (!Array.isArray(vault.sources) || !Array.isArray(vault.models) || !Array.isArray(vault.graphNodes) || !Array.isArray(vault.graphEdges)) {
    return { error: "Invalid GhostBrain vault export. No data was changed." };
  }
  const sources = vault.sources.map((source) => normalizeSourceRecord(source, source.sourceOrigin ?? "Export Restore"));
  const providers = Array.isArray(vault.providers) ? vault.providers : createDefaultProviders();
  const restoredVault: VaultState = {
    ...createEmptyVaultState(),
    ...vault,
    sources,
    providers,
    records: Array.isArray(vault.records) ? vault.records : [],
    clusters: Array.isArray(vault.clusters) ? vault.clusters : [],
    mode: deriveVaultMode(sources),
    activeFilters: { ...createDefaultFilters(), ...(vault.activeFilters ?? {}) },
    lastUpdated: new Date().toISOString(),
  };
  return {
    vault: refreshVaultDerivedState(restoredVault, false),
  };
}

export function serializeGhostBrainSnapshot(vault: VaultState): GhostBrainSnapshot {
  return {
    version: vaultSchemaVersion,
    exportedAt: new Date().toISOString(),
    app: "GhostBrain Infinity",
    records: buildActiveBrainRecords(vault, { includeDemoConsoleRecords: false }),
    sources: vault.sources.map(sourceToRegistryEntry),
    models: vault.models.map(modelToRegistryEntry),
    graph: {
      nodes: vault.graphNodes,
      edges: vault.graphEdges,
    },
    clusters: vault.clusters,
    settings: {
      demoDataEnabled: vault.mode === "Demo Data Mode" || vault.mode === "Mixed Data Mode",
      selectedScope: vault.activeFilters.searchText ? "Filtered Vault" : "All Brain",
    },
    activitySummary: {
      eventCount: vault.activityEvents.length,
      latestEventAt: vault.activityEvents[0]?.timestamp,
    },
  };
}

function parseGhostBrainSnapshot(snapshot: GhostBrainSnapshot): { vault?: VaultState; error?: string } {
  if (snapshot.app !== "GhostBrain Infinity" || !Array.isArray(snapshot.records)) {
    return { error: "Unknown GhostBrain snapshot format. No data was changed." };
  }

  const now = new Date().toISOString();
  const state = createEmptyVaultState();
  const sources = snapshot.sources.map((source): SourceRecord => normalizeSourceRecord({
    id: source.id,
    name: source.name,
    sourceType: source.type === "Markdown" ? "Markdown" : source.type === "Code" ? "Code" : source.type === "JSON" ? "JSON" : "Document",
    category: source.category === "Code" ? "Code" : source.category === "Research" ? "Research" : "Manual",
    origin: "Export Restore",
    description: source.description ?? source.name,
    status: source.status === "enabled" ? "ready" : source.status === "error" ? "danger" : "idle",
    sourceStatus: source.status === "enabled" ? "Active" : source.status === "error" ? "Error" : "Disabled",
    enabled: source.status === "enabled",
    storageMode: "ExportedJSON",
    privacyLevel: source.privacy === "LocalOnly" ? "LocalOnly" : source.privacy === "External" ? "CloudAllowed" : "Unknown",
    indexed: false,
    sourceOrigin: "Export Restore",
    lastImported: source.createdAt,
    lastUpdated: source.updatedAt,
    importedAt: source.createdAt,
    updatedAt: source.updatedAt,
    recordCount: 1,
    tags: source.tags,
    notes: source.description ?? "",
    contentPreview: source.description,
    safeToDelete: false,
    isSynthetic: false,
  }, "Export Restore"));

  state.sources = sources;
  state.records = snapshot.records.map((record) => ({ ...record, updatedAt: record.updatedAt ?? now }));
  state.clusters = snapshot.clusters as BrainCluster[];
  state.activityEvents = [{
    id: `activity-import-${Date.now()}`,
    title: "Snapshot imported",
    description: `GhostBrain snapshot ${snapshot.version} restored.`,
    status: "ready",
    severity: "success",
    eventType: "snapshot-imported",
    timestamp: now,
  }];
  state.mode = deriveVaultMode(sources);
  return { vault: refreshVaultDerivedState(state, Boolean(snapshot.settings.demoDataEnabled)) };
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "uncategorized";
}
