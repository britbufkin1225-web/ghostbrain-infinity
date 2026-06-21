import { demoBrainRecords } from "../data/demoBrainRecords";
import type {
  BrainRecord,
  BrainRecordOrigin,
  BrainRecordType,
  DemoBrainRecord,
  ModelRecord,
  ModelRegistryEntry,
  SourceRecord,
  SourceRegistryEntry,
  VaultState,
} from "../types";

export function normalizeVaultState(vault: VaultState, options: { includeDemoConsoleRecords?: boolean } = {}): VaultState {
  const records = buildActiveBrainRecords(vault, options);
  return {
    ...vault,
    records,
  };
}

export function buildActiveBrainRecords(vault: VaultState, options: { includeDemoConsoleRecords?: boolean } = {}): BrainRecord[] {
  const sourceRecords = vault.sources.map(sourceToBrainRecord);
  const modelRecords = vault.models.map(modelToBrainRecord);
  const providerRecords = vault.providers.map((provider): BrainRecord => ({
    id: `record-provider-${provider.id}`,
    title: provider.name,
    type: "system",
    tags: [provider.providerType, provider.status, provider.localOnly ? "local" : "external"].filter(Boolean),
    content: provider.notes ?? `${provider.name} provider registry entry.`,
    metadata: {
      providerId: provider.id,
      providerType: provider.providerType,
      status: provider.status,
      baseUrl: provider.baseUrl,
    },
    createdAt: provider.lastCheckedAt ?? vault.lastUpdated,
    updatedAt: provider.lastCheckedAt ?? vault.lastUpdated,
    origin: "registry",
    enabled: provider.enabled,
  }));
  const consoleDemoRecords = options.includeDemoConsoleRecords ? demoBrainRecords.map(demoToBrainRecord) : [];
  return [...sourceRecords, ...modelRecords, ...providerRecords, ...consoleDemoRecords];
}

export function sourceToBrainRecord(source: SourceRecord): BrainRecord {
  const origin = sourceOriginToRecordOrigin(source);
  return {
    id: `record-source-${source.id}`,
    title: source.name,
    type: sourceTypeToBrainRecordType(source.sourceType),
    sourceId: source.id,
    clusterId: source.clusterId ?? source.cluster,
    tags: source.tags,
    content: source.contentPreview ?? source.description ?? source.notes,
    metadata: {
      sourceType: source.sourceType,
      category: source.category,
      privacyLevel: source.privacyLevel,
      indexed: source.indexed,
      fileName: source.fileName,
      sourceOrigin: source.sourceOrigin ?? source.origin,
    },
    createdAt: source.importedAt ?? source.lastImported ?? source.lastUpdated,
    updatedAt: source.updatedAt ?? source.lastUpdated,
    origin,
    enabled: source.enabled,
  };
}

export function modelToBrainRecord(model: ModelRecord): BrainRecord {
  return {
    id: `record-model-${model.id}`,
    title: model.displayName ?? model.name,
    type: "model",
    modelId: model.id,
    clusterId: model.clusterId,
    tags: [...model.tags, ...model.capabilities],
    content: model.description || model.notes || `${model.name} model registry entry.`,
    metadata: {
      providerId: model.providerId,
      provider: model.provider,
      providerType: model.providerType,
      modelType: model.modelType,
      localOnly: model.localOnly,
      modelStatus: model.modelStatus ?? model.status,
    },
    createdAt: model.lastSeenAt ?? model.lastUsed ?? new Date().toISOString(),
    updatedAt: model.lastSeenAt ?? model.lastUsed ?? new Date().toISOString(),
    origin: "registry",
    enabled: model.enabled,
  };
}

export function demoToBrainRecord(record: DemoBrainRecord): BrainRecord {
  return {
    id: `record-demo-${record.id}`,
    title: record.title,
    type: demoTypeToBrainRecordType(record.type),
    tags: record.tags,
    content: record.content,
    metadata: {
      demoRecordId: record.id,
      demoType: record.type,
      source: record.source,
    },
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
    origin: "demo",
    enabled: true,
  };
}

export function sourceToRegistryEntry(source: SourceRecord): SourceRegistryEntry {
  return {
    id: source.id,
    name: source.name,
    category: source.category,
    type: source.sourceType,
    status: source.enabled ? "enabled" : "disabled",
    privacy: source.privacyLevel === "LocalOnly" ? "LocalOnly" : source.privacyLevel === "Unknown" ? "Unknown" : "External",
    tags: source.tags,
    description: source.description,
    createdAt: source.importedAt ?? source.lastImported ?? source.lastUpdated,
    updatedAt: source.updatedAt ?? source.lastUpdated,
  };
}

export function modelToRegistryEntry(model: ModelRecord): ModelRegistryEntry {
  return {
    id: model.id,
    name: model.displayName ?? model.name,
    provider: model.provider,
    category: model.modelType,
    status: model.enabled ? model.manuallyAdded || model.isSynthetic ? "mock" : "enabled" : "disabled",
    localOnly: model.localOnly,
    endpoint: model.providerId,
    tags: [...model.tags, ...model.capabilities],
    description: model.description,
    createdAt: model.lastSeenAt ?? model.lastUsed ?? new Date().toISOString(),
    updatedAt: model.lastSeenAt ?? model.lastUsed ?? new Date().toISOString(),
  };
}

function sourceOriginToRecordOrigin(source: SourceRecord): BrainRecordOrigin {
  if (source.isSynthetic || source.sourceOrigin === "Synthetic Demo") return "demo";
  if (source.sourceOrigin === "User Import") return "imported";
  if (source.sourceOrigin === "Manual Entry") return "manual";
  return "registry";
}

function sourceTypeToBrainRecordType(sourceType: SourceRecord["sourceType"]): BrainRecordType {
  if (sourceType === "Code") return "code";
  if (sourceType === "Image") return "image";
  if (["Document", "Markdown", "Text", "JSON", "Research", "Manual", "LocalFolder"].includes(sourceType)) return "document";
  return "unknown";
}

function demoTypeToBrainRecordType(type: string): BrainRecordType {
  const value = type.toLowerCase();
  if (value.includes("model")) return "model";
  if (value.includes("source")) return "source";
  if (value.includes("code")) return "code";
  if (value.includes("image")) return "image";
  if (value.includes("import")) return "import";
  if (value.includes("system")) return "system";
  return "note";
}
