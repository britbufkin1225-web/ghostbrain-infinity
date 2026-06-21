import { clusterVault } from "../../services/clusterService";
import { searchVault } from "../../services/searchService";
import type { ConsoleEntry, ConsoleMode, ConsoleStatus, ModelRecord, ModelTestResult, SafeExecutionMode, SearchResult, VaultState } from "../../types";

interface ExecuteConsoleCommandInput {
  command: string;
  scope: string;
  demoDataEnabled: boolean;
  vaultState: VaultState;
}

const blockedPatterns = ["shell", "cmd", "powershell", "bash", "eval", "new function", "javascript:", "fetch http", "curl", "subprocess", "exec", "<script"];

export function executeConsoleCommand({ command, scope, demoDataEnabled, vaultState }: ExecuteConsoleCommandInput): ConsoleEntry {
  const started = performance.now();
  const trimmed = command.trim();

  if (!trimmed) {
    return createEntry(command, "system", "warning", "safe-mode", "Enter a local query or safe console command.", started);
  }

  const lower = trimmed.toLowerCase();
  if (blockedPatterns.some((pattern) => lower.includes(pattern))) {
    return createEntry(trimmed, "system", "blocked", "blocked", "Execution blocked by GhostBrain Safe Mode. Only local registry queries and mock tests are allowed.", started);
  }

  if (lower === "/clear") {
    return createEntry(trimmed, "system", "success", "safe-mode", "Console history cleared.", started);
  }

  if (lower === "/help") {
    return createEntry(trimmed, "help", "success", "safe-mode", "Commands: /help, /search <term>, /sources, /models, /cluster <term>, /test model:<id> prompt:\"...\", /clear", started, {
      examples: ["/search obsidian", "/sources", "/models", "/cluster security", "/test model:synthetic-qwen-local prompt:\"Summarize this brain cluster\""],
    });
  }

  if (lower === "/sources") {
    return createEntry(trimmed, "search", "success", "safe-mode", `${vaultState.sources.length} source record(s) registered.`, started, {
      sources: vaultState.sources.slice(0, 12).map((source) => ({ id: source.id, name: source.name, sourceType: source.sourceType, origin: source.sourceOrigin ?? source.origin, tags: source.tags, status: source.enabled ? "enabled" : "disabled" })),
    });
  }

  if (lower === "/models") {
    return createEntry(trimmed, "search", "success", "safe-mode", `${vaultState.models.length} model record(s) registered.`, started, {
      models: vaultState.models.slice(0, 12).map((model) => ({ id: model.id, name: model.displayName ?? model.name, provider: model.provider, status: model.modelStatus ?? model.status, localOnly: model.localOnly, tags: model.tags })),
    });
  }

  if (lower.startsWith("/test")) {
    return runMockModelTest(trimmed, vaultState.models, started);
  }

  if (lower.startsWith("/cluster")) {
    const query = trimmed.replace(/^\/cluster/i, "").trim();
    return runClusterPreview(trimmed, query, demoDataEnabled, vaultState, started);
  }

  const query = lower.startsWith("/search") ? trimmed.replace(/^\/search/i, "").trim() : trimmed;
  return runLocalSearch(trimmed, query, scope, demoDataEnabled, vaultState, started);
}

function runLocalSearch(command: string, query: string, scope: string, demoDataEnabled: boolean, vaultState: VaultState, started: number): ConsoleEntry {
  const scopedQuery = scopeToQuery(scope, query);
  const results = searchVault({ query: scopedQuery, vaultState, includeDemoData: demoDataEnabled, enabledOnly: scope === "Enabled Only" });
  const scopedResults = results.filter((result) => {
    if (scope === "Sources") return Boolean(result.record.sourceId);
    if (scope === "Models") return Boolean(result.record.modelId) || result.record.type === "model";
    if (scope === "Demo Data") return result.record.origin === "demo";
    if (scope === "Imported Only") return result.record.origin === "imported";
    return true;
  });

  return createEntry(command, "search", scopedResults.length ? "success" : "warning", "safe-mode", scopedResults.length ? `${scopedResults.length} local result(s) matched "${query}".` : "No matching local records found. Try a broader query or enable demo brain data.", started, {
    results: scopedResults.slice(0, 10).map(toConsoleSearchResult),
  });
}

function runClusterPreview(command: string, query: string, demoDataEnabled: boolean, vaultState: VaultState, started: number): ConsoleEntry {
  const clusters = clusterVault({ vaultState, includeDemoData: demoDataEnabled, query }).slice(0, 8).map((cluster) => ({
    id: cluster.id,
    name: cluster.name,
    records: cluster.recordIds.length,
    tags: cluster.tags,
    relatedSources: cluster.sources,
    relatedModels: cluster.models,
    confidence: cluster.confidence,
    score: cluster.score,
  }));

  return createEntry(command, "cluster", clusters.length ? "success" : "warning", "safe-mode", clusters.length ? `${clusters.length} cluster preview(s) generated.` : "No cluster preview available for that query.", started, { clusters });
}

function runMockModelTest(command: string, models: ModelRecord[], started: number): ConsoleEntry {
  const rawModelId = command.match(/model:([^\s]+)/i)?.[1];
  const modelId = rawModelId === "demo-local" ? "synthetic-qwen-local" : rawModelId;
  const prompt = command.match(/prompt:"([^"]+)"/i)?.[1] ?? "No prompt provided.";
  const model = models.find((candidate) => candidate.id === modelId || candidate.name === modelId || candidate.displayName === modelId);

  if (rawModelId && /external|cloud|http|https|api-key|credential/i.test(rawModelId)) {
    return createEntry(command, "test", "blocked", "blocked", "Blocked by Safe Execution Policy. Model tests are mock-only and may not target external/cloud endpoints.", started);
  }

  if (!model) {
    return createEntry(command, "test", "error", "dry-run", "Unknown model ID. No model call was made.", started);
  }

  if (!model.localOnly) {
    return createEntry(command, "test", "blocked", "blocked", "Blocked by Safe Execution Policy. Non-local model targets are not testable in this phase.", started);
  }

  const result: ModelTestResult = {
    id: `model-test-${Date.now()}`,
    modelId: model.id,
    modelName: model.displayName ?? model.name,
    modelType: model.modelType,
    prompt,
    safetyMode: "mock-test",
    status: "success",
    requestPreview: {
      provider: model.provider,
      model: model.name,
      mode: "dry-run",
      promptPreview: prompt.slice(0, 160),
      localOnly: model.localOnly,
    },
    mockResponse: "Mock response generated from local test harness. No external model was called.",
    timestamp: new Date().toISOString(),
    durationMs: Math.round(performance.now() - started),
  };

  return createEntry(command, "test", "success", "mock-test", `Model Test: ${result.modelName} completed in dry-run mode.`, started, result);
}

function toConsoleSearchResult(result: SearchResult) {
  return {
    id: result.record.id,
    title: result.record.title,
    type: result.record.type,
    origin: result.record.origin,
    score: result.score,
    matchedFields: result.matchedFields,
    matchedTags: result.matchedTags,
    reason: result.reason,
    sourceId: result.record.sourceId,
    modelId: result.record.modelId,
    clusterId: result.record.clusterId,
  };
}

function scopeToQuery(scope: string, query: string): string {
  if (scope === "Demo Data" && !query.includes("origin:")) return `${query} origin:demo`;
  if (scope === "Imported Only" && !query.includes("origin:")) return `${query} origin:imported`;
  return query;
}

function createEntry(command: string, mode: ConsoleMode, status: ConsoleStatus, safetyMode: SafeExecutionMode, summary: string, started: number, details?: unknown): ConsoleEntry {
  return {
    id: `console-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    command,
    mode,
    status,
    safetyMode,
    summary,
    details,
    durationMs: Math.round(performance.now() - started),
  };
}
