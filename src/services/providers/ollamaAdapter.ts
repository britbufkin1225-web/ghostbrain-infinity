import type { ModelProvider, ModelRecord } from "../../types";

interface OllamaTagResponse {
  models?: Array<{
    name?: string;
    model?: string;
    modified_at?: string;
    details?: {
      parameter_size?: string;
      quantization_level?: string;
      family?: string;
    };
  }>;
}

export interface ProviderCheckResult {
  provider: ModelProvider;
  models: ModelRecord[];
  message: string;
}

export async function checkOllamaProvider(provider: ModelProvider): Promise<ProviderCheckResult> {
  const now = new Date().toISOString();

  if (!provider.enabled) {
    return {
      provider: { ...provider, status: "Disabled", lastCheckedAt: now, lastError: undefined },
      models: [],
      message: "Provider is disabled. Health check skipped.",
    };
  }

  try {
    const response = await fetch(`${provider.baseUrl ?? "http://localhost:11434"}/api/tags`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return {
        provider: { ...provider, status: "Unavailable", lastCheckedAt: now, lastError: `HTTP ${response.status}` },
        models: [],
        message: "Local provider unavailable. GhostBrain can still run in dashboard mode.",
      };
    }

    const data = (await response.json()) as OllamaTagResponse;
    const models = (data.models ?? []).map((model) => normalizeOllamaModel(model, provider, now));

    return {
      provider: { ...provider, status: "Online", lastCheckedAt: now, lastError: undefined },
      models,
      message: models.length ? `${models.length} local model(s) discovered.` : "Model discovery returned no models. You can manually add planned models to the registry.",
    };
  } catch (error) {
    return {
      provider: {
        ...provider,
        status: "Offline",
        lastCheckedAt: now,
        lastError: error instanceof Error ? error.message : "Provider check failed",
      },
      models: [],
      message: "Provider check failed. GhostBrain is still running in dashboard mode.",
    };
  }
}

function normalizeOllamaModel(model: NonNullable<OllamaTagResponse["models"]>[number], provider: ModelProvider, now: string): ModelRecord {
  const name = model.name ?? model.model ?? "unknown-local-model";
  const lowerName = name.toLowerCase();
  const isEmbedding = lowerName.includes("embed");
  const isCode = lowerName.includes("code") || lowerName.includes("coder");

  return {
    id: `model-${provider.id}-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    name,
    displayName: name,
    providerId: provider.id,
    provider: provider.name,
    providerType: provider.providerType,
    modelType: isEmbedding ? "Embedding" : isCode ? "Code" : "LLM",
    category: isCode ? "Code" : "LLM",
    description: "Discovered from local Ollama-compatible provider.",
    status: "ready",
    modelStatus: "Discovered",
    enabled: true,
    localOnly: true,
    requiresApiKey: false,
    discovered: true,
    manuallyAdded: false,
    contextWindow: null,
    parameterSize: model.details?.parameter_size,
    quantization: model.details?.quantization_level,
    capabilities: isEmbedding ? ["embed", "retrieve"] : isCode ? ["chat", "codeAssist", "summarize"] : ["chat", "summarize", "retrieve", "route"],
    tags: ["local", "discovered", provider.providerType.toLowerCase()],
    lastSeenAt: now,
    lastUsedAt: undefined,
    lastUsed: null,
    notes: model.details?.family ? `Family: ${model.details.family}` : "Discovered local model.",
    isSynthetic: false,
    safeToDelete: true,
  };
}
