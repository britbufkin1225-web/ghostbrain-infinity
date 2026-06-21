import type { ModelCapability, ModelProvider, ModelRecord, ModelType, ProviderType } from "../../types";

export function createDefaultProviders(): ModelProvider[] {
  return [
    {
      id: "provider-ollama-local",
      name: "Ollama Local",
      providerType: "Ollama",
      baseUrl: "http://localhost:11434",
      status: "Not Checked",
      enabled: true,
      localOnly: true,
      requiresApiKey: false,
      supportsDiscovery: true,
      supportsChat: true,
      supportsEmbeddings: true,
      supportsVision: false,
      supportsAudio: false,
      notes: "Default local provider placeholder. GhostBrain runs even when this provider is unavailable.",
    },
    {
      id: "provider-manual",
      name: "Manual Model Registry",
      providerType: "Manual",
      status: "Configuration Required",
      enabled: true,
      localOnly: true,
      requiresApiKey: false,
      supportsDiscovery: false,
      supportsChat: true,
      supportsEmbeddings: false,
      supportsVision: false,
      supportsAudio: false,
      notes: "Manual provider bucket for planned or unavailable models.",
    },
  ];
}

export function createManualModel(input: {
  displayName: string;
  name: string;
  providerId: string;
  provider: string;
  providerType: ProviderType;
  modelType: ModelType;
  capabilities: ModelCapability[];
  tags: string[];
  contextWindow: number | null;
  localOnly: boolean;
  requiresApiKey: boolean;
  notes: string;
  enabled: boolean;
}): ModelRecord {
  const now = new Date().toISOString();
  return {
    id: `model-manual-${Date.now()}`,
    name: input.name,
    displayName: input.displayName,
    providerId: input.providerId,
    provider: input.provider,
    providerType: input.providerType,
    modelType: input.modelType,
    category: input.modelType === "Code" ? "Code" : input.modelType === "Vision" ? "Image" : input.modelType === "Audio" || input.modelType === "SpeechToText" || input.modelType === "TextToSpeech" ? "Audio" : "LLM",
    description: input.notes || "Manual model registry entry.",
    status: input.enabled ? "ready" : "idle",
    modelStatus: input.enabled ? "Manual" : "Disabled",
    enabled: input.enabled,
    localOnly: input.localOnly,
    requiresApiKey: input.requiresApiKey,
    discovered: false,
    manuallyAdded: true,
    contextWindow: input.contextWindow,
    capabilities: input.capabilities.length ? input.capabilities : ["unknown"],
    tags: input.tags,
    lastSeenAt: now,
    lastUsedAt: undefined,
    lastUsed: null,
    notes: input.notes,
    isSynthetic: false,
    safeToDelete: false,
  };
}
