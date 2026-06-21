import { useEffect, useMemo, useRef, useState } from "react";
import { BrainActivityCounter } from "../components/dashboard/BrainActivityCounter";
import { LocalQueryConsole } from "../components/dashboard/LocalQueryConsole";
import { DashboardShell } from "../components/layout/DashboardShell";
import { Panel } from "../components/ui/Panel";
import { PlaceholderButton } from "../components/ui/PlaceholderButton";
import { StateBlock } from "../components/ui/StateBlock";
import { appStatusSeed } from "../data/seed/appStatus";
import { modelSeeds } from "../data/seed/models";
import { memoryRoutingSteps, routingStatusSeed } from "../data/seed/routing";
import { sourceSeeds } from "../data/seed/sources";
import { loadSyntheticFixtureVault } from "../data/fixtures/fixtureLoader";
import { createRoutingArchitectureSnapshot } from "../lib/routing/memoryRouting";
import { createBrainStats } from "../lib/stats/brainStats";
import {
  addActivity,
  addSourceGraphRecords,
  createDefaultFilters,
  createDemoVaultState,
  createEmptyVaultState,
  createManualSource,
  createSourceFromFile,
  deriveVaultMode,
  hasDuplicateSource,
  parseVaultExport,
  refreshVaultDerivedState,
  removeSourceGraphRecords,
  serializeVaultExport,
  supportedImportExtensions,
} from "../lib/vault/vaultState";
import { createVaultCounters } from "../services/counterService";
import { checkOllamaProvider } from "../services/providers/ollamaAdapter";
import { mergeDiscoveredModels, syncModelGraphRecords } from "../services/providers/modelRegistry";
import { createDefaultProviders, createManualModel } from "../services/providers/providerRegistry";
import { readStoredVault, writeStoredVault } from "../services/storageService";
import { brandAssets } from "../config/brandAssets";
import type { BrainSessionActivity, ModelCapability, ModelType, PrivacyLevel, ProviderType, SourceRecord, SourceType, SyntheticCluster, VaultFilters, VaultState } from "../types";
import type { ConsoleEntry } from "../types";

const routingSnapshot = createRoutingArchitectureSnapshot(routingStatusSeed, modelSeeds, sourceSeeds, memoryRoutingSteps);
const demoFixture = loadSyntheticFixtureVault();
const clusterLabelMap = new Map(demoFixture.clusters.map((cluster) => [cluster.id, cluster.label]));
const sourceTypes: SourceType[] = ["Document", "Markdown", "Text", "JSON", "Code", "Image", "Audio", "Video", "Research", "Manual", "LocalFolder", "Unknown"];
const privacyLevels: PrivacyLevel[] = ["LocalOnly", "CloudAllowed", "Sensitive", "Public", "Unknown"];
const clusterOptions = ["AI Models", "Cybersecurity", "Code Projects", "Research", "Creative Assets", "Personal Knowledge", "Voice Layer", "Import/Export", "Uncategorized"];
const modelTypes: ModelType[] = ["LLM", "Embedding", "Vision", "Audio", "SpeechToText", "TextToSpeech", "Code", "Research", "Unknown"];
const providerTypes: ProviderType[] = ["Ollama", "Local LLM", "OpenAI-Compatible", "Gemini", "Claude", "Manual", "Unknown"];
const modelCapabilities: ModelCapability[] = ["chat", "summarize", "embed", "transcribe", "speak", "analyzeImage", "codeAssist", "retrieve", "route", "unknown"];

function createEmptySessionActivity(): BrainSessionActivity {
  return {
    recordsAddedSession: 0,
    recordsRemovedSession: 0,
    recordsImportedSession: 0,
    recordsIndexedSession: 0,
    modelsDiscoveredSession: 0,
    providersCheckedSession: 0,
    clustersCreatedSession: 0,
    nodesCreatedSession: 0,
    edgesCreatedSession: 0,
  };
}

function restoreInitialVaultState(): VaultState {
  const restored = readStoredVault(createDemoVaultState());
  if (restored?.sources && Array.isArray(restored.sources)) {
    return refreshVaultDerivedState({
      ...createEmptyVaultState(),
      ...restored,
      providers: Array.isArray(restored.providers) ? restored.providers : createDefaultProviders(),
      activeFilters: { ...createDefaultFilters(), ...(restored.activeFilters ?? {}) },
      mode: deriveVaultMode(restored.sources),
    }, false);
  }
  return createDemoVaultState();
}

function getClusterLabel(clusterId: string): string {
  return clusterLabelMap.get(clusterId) ?? clusterId;
}

function getSourceDate(source: SourceRecord): string {
  return source.updatedAt ?? source.lastUpdated ?? source.importedAt ?? source.lastImported ?? new Date().toISOString();
}

function createCounterClusters(vault: VaultState, recordsByCluster: Record<string, number>): SyntheticCluster[] {
  const clusterIds = Array.from(new Set([...Object.keys(recordsByCluster), ...demoFixture.clusters.map((cluster) => cluster.id)]));
  return clusterIds.map((clusterId) => ({
    id: clusterId,
    label: getClusterLabel(clusterId),
    description: clusterLabelMap.has(clusterId) ? (demoFixture.clusters.find((cluster) => cluster.id === clusterId)?.description ?? "Synthetic cluster") : "Imported or manually created registry cluster.",
    category: "Manual",
    sourceType: "Manual",
    recordCount: recordsByCluster[clusterId] ?? 0,
    nodeCount: vault.graphNodes.filter((node) => node.clusterId === clusterId).length,
    edgeCount: vault.graphEdges.filter((edge) => edge.clusterId === clusterId).length,
    status: "Architecture Ready",
  }));
}

function filterSources(sources: SourceRecord[], filters: VaultFilters): SourceRecord[] {
  const search = filters.searchText.trim().toLowerCase();
  return sources.filter((source) => {
    const sourceOrigin = source.sourceOrigin ?? source.origin;
    const haystack = `${source.name} ${source.tags.join(" ")} ${source.notes} ${source.contentPreview ?? ""} ${source.fileName ?? ""}`.toLowerCase();
    return (
      (filters.cluster === "all" || source.clusterId === filters.cluster || source.cluster === filters.cluster) &&
      (filters.sourceType === "all" || source.sourceType === filters.sourceType) &&
      (filters.origin === "all" || sourceOrigin === filters.origin) &&
      (filters.privacyLevel === "all" || source.privacyLevel === filters.privacyLevel) &&
      (filters.enabled === "all" || (filters.enabled === "enabled" ? source.enabled : !source.enabled)) &&
      (filters.indexed === "all" || (filters.indexed === "indexed" ? source.indexed : !source.indexed)) &&
      (filters.synthetic === "all" || (filters.synthetic === "synthetic" ? source.isSynthetic : !source.isSynthetic)) &&
      (!search || haystack.includes(search))
    );
  });
}

export default function Dashboard() {
  const [vaultState, setVaultState] = useState<VaultState>(() => restoreInitialVaultState());
  const [sessionActivity, setSessionActivity] = useState<BrainSessionActivity>(() => createEmptySessionActivity());
  const [manualSource, setManualSource] = useState({ title: "", cluster: "Uncategorized", sourceType: "Manual" as SourceType, privacyLevel: "LocalOnly" as PrivacyLevel, tags: "", notes: "" });
  const [manualModel, setManualModel] = useState({
    displayName: "",
    name: "",
    providerId: "provider-manual",
    providerType: "Manual" as ProviderType,
    modelType: "LLM" as ModelType,
    capabilities: "chat,summarize",
    tags: "",
    contextWindow: "",
    localOnly: true,
    requiresApiKey: false,
    enabled: true,
    notes: "",
  });
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>();
  const [notice, setNotice] = useState("Ready.");
  const [error, setError] = useState("");
  const sourceImportRef = useRef<HTMLInputElement>(null);
  const vaultImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    writeStoredVault(vaultState, "0.6.0");
  }, [vaultState]);

  const brainStats = useMemo(
    () =>
      createBrainStats({
        sources: vaultState.sources,
        models: vaultState.models,
        providers: vaultState.providers,
        records: vaultState.records,
        clusters: vaultState.clusters,
        graphNodes: vaultState.graphNodes,
        graphEdges: vaultState.graphEdges,
        sessionActivity,
      }),
    [sessionActivity, vaultState],
  );

  const counterClusters = useMemo(() => createCounterClusters(vaultState, brainStats.recordsByCluster), [brainStats.recordsByCluster, vaultState]);
  const vaultCounters = useMemo(() => createVaultCounters(vaultState, vaultState.records, vaultState.clusters), [vaultState]);
  const filteredSources = useMemo(() => filterSources(vaultState.sources, vaultState.activeFilters), [vaultState.activeFilters, vaultState.sources]);
  const selectedSource = vaultState.sources.find((source) => source.id === vaultState.selectedSourceId) ?? filteredSources[0];
  const selectedModel = vaultState.models.find((model) => model.id === selectedModelId);
  const selectedProvider = vaultState.providers.find((provider) => provider.id === selectedProviderId);
  const selectedRecord = vaultState.records.find((record) => record.id === vaultState.selectedRecordId);
  const selectedCluster = vaultState.clusters.find((cluster) => cluster.id === vaultState.selectedClusterId);
  const selectedGraphNode = vaultState.graphNodes.find((node) => node.id === vaultState.selectedNodeId);
  const activityItems = vaultState.activityEvents.slice(0, 12);
  const graphClusterNodes = vaultState.clusters.slice(0, 8);

  function commitVault(updater: (draft: VaultState) => void) {
    setVaultState((current) => {
      const draft: VaultState = {
        ...current,
        sources: [...current.sources],
        providers: [...current.providers],
        models: [...current.models],
        graphNodes: [...current.graphNodes],
        graphEdges: [...current.graphEdges],
        activityEvents: [...current.activityEvents],
        activeFilters: { ...current.activeFilters },
      };
      updater(draft);
      draft.mode = deriveVaultMode(draft.sources);
      draft.lastUpdated = new Date().toISOString();
      return refreshVaultDerivedState(draft, false);
    });
  }

  function loadDemoVault() {
    const demo = createDemoVaultState();
    setVaultState(refreshVaultDerivedState(demo, false));
    setSessionActivity((current) => ({
      ...current,
      recordsAddedSession: current.recordsAddedSession + demo.sources.length,
      recordsImportedSession: current.recordsImportedSession + demo.sources.length,
      nodesCreatedSession: current.nodesCreatedSession + demo.graphNodes.length,
      edgesCreatedSession: current.edgesCreatedSession + demo.graphEdges.length,
      clustersCreatedSession: current.clustersCreatedSession + demoFixture.clusters.length,
    }));
    setNotice("Demo Vault loaded.");
    setError("");
  }

  function clearDemoData() {
    const removed = vaultState.sources.filter((source) => source.isSynthetic).length;
    commitVault((draft) => {
      draft.sources = draft.sources.filter((source) => !source.isSynthetic);
      draft.graphNodes = draft.graphNodes.filter((node) => !node.isSynthetic);
      draft.graphEdges = draft.graphEdges.filter((edge) => !edge.isSynthetic);
      draft.activityEvents = draft.activityEvents.filter((event) => !event.isSynthetic);
      addActivity(draft, "Demo data cleared", `${removed} synthetic records removed.`, "warning");
    });
    setSessionActivity((current) => ({ ...current, recordsRemovedSession: current.recordsRemovedSession + removed }));
    setNotice("Synthetic demo data cleared. Imported and manual records were preserved.");
    setError("");
  }

  function clearEntireVault() {
    if (!window.confirm("Clear the entire GhostBrain vault? This removes demo, imported, and manual records from local state.")) return;
    setSessionActivity((current) => ({ ...current, recordsRemovedSession: current.recordsRemovedSession + vaultState.sources.length }));
    setVaultState(refreshVaultDerivedState(createEmptyVaultState(), false));
    setNotice("Entire vault cleared.");
    setError("");
  }

  function replaceDemoWithRealData() {
    clearDemoData();
    setNotice("Demo records removed. Imported/manual records remain as the real vault.");
  }

  async function importSourceFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const result = await createSourceFromFile(file);
      if (result.error || !result.source) {
        setError(result.error ?? "Import failed.");
        continue;
      }
      if (hasDuplicateSource(vaultState.sources, result.source)) {
        commitVault((draft) => addActivity(draft, "Duplicate skipped", `Duplicate detected for ${file.name}. Import skipped.`, "warning"));
        setNotice(`Duplicate detected - ${file.name} skipped.`);
        continue;
      }
      commitVault((draft) => {
        draft.sources.unshift(result.source!);
        addSourceGraphRecords(draft, result.source!);
        addActivity(draft, "File imported", `${file.name} added to the source registry.`, "success", result.source!.id);
        draft.selectedSourceId = result.source!.id;
      });
      setSessionActivity((current) => ({
        ...current,
        recordsAddedSession: current.recordsAddedSession + 1,
        recordsImportedSession: current.recordsImportedSession + 1,
        nodesCreatedSession: current.nodesCreatedSession + 1,
        edgesCreatedSession: current.edgesCreatedSession + 1,
      }));
      setNotice(`${file.name} imported.`);
      setError("");
    }
    if (sourceImportRef.current) sourceImportRef.current.value = "";
  }

  async function importVaultJson(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const result = parseVaultExport(parsed);
      if (result.error || !result.vault) {
        setError(result.error ?? "Invalid GhostBrain vault export. No data was changed.");
        return;
      }
      setVaultState(result.vault);
      setSessionActivity((current) => ({ ...current, recordsImportedSession: current.recordsImportedSession + result.vault!.sources.length }));
      setNotice("Vault restored from JSON export.");
      setError("");
    } catch {
      setError("Invalid JSON import. No data was changed.");
    } finally {
      if (vaultImportRef.current) vaultImportRef.current.value = "";
    }
  }

  function addManualSource() {
    if (!manualSource.title.trim()) {
      setError("Manual source requires a title.");
      return;
    }
    const source = createManualSource({
      title: manualSource.title.trim(),
      cluster: manualSource.cluster,
      sourceType: manualSource.sourceType,
      privacyLevel: manualSource.privacyLevel,
      tags: manualSource.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      notes: manualSource.notes,
    });
    commitVault((draft) => {
      draft.sources.unshift(source);
      addSourceGraphRecords(draft, source);
      addActivity(draft, "Manual source created", `${source.name} added to the source registry.`, "success", source.id);
      draft.selectedSourceId = source.id;
    });
    setSessionActivity((current) => ({ ...current, recordsAddedSession: current.recordsAddedSession + 1, nodesCreatedSession: current.nodesCreatedSession + 1, edgesCreatedSession: current.edgesCreatedSession + 1 }));
    setManualSource({ title: "", cluster: "Uncategorized", sourceType: "Manual", privacyLevel: "LocalOnly", tags: "", notes: "" });
    setNotice("Manual source created.");
    setError("");
  }

  function updateSource(sourceId: string, patch: Partial<SourceRecord>) {
    commitVault((draft) => {
      draft.sources = draft.sources.map((source) => (source.id === sourceId ? { ...source, ...patch, updatedAt: new Date().toISOString(), lastUpdated: new Date().toISOString() } : source));
      addActivity(draft, "Source edited", "Source metadata updated.", "info", sourceId);
      draft.selectedSourceId = sourceId;
    });
  }

  function toggleSource(source: SourceRecord) {
    updateSource(source.id, { enabled: !source.enabled, sourceStatus: source.enabled ? "Disabled" : "Active", status: source.enabled ? "idle" : "ready" });
    setNotice(source.enabled ? "Source disabled." : "Source enabled.");
  }

  function deleteSource(source: SourceRecord) {
    if (!window.confirm(`Delete ${source.name}? This removes its graph node and connected edges.`)) return;
    commitVault((draft) => {
      draft.sources = draft.sources.filter((record) => record.id !== source.id);
      removeSourceGraphRecords(draft, source.id);
      addActivity(draft, "Source deleted", `${source.name} removed from the vault.`, "warning", source.id);
      draft.selectedSourceId = undefined;
    });
    setSessionActivity((current) => ({ ...current, recordsRemovedSession: current.recordsRemovedSession + 1 }));
    setNotice("Source deleted.");
  }

  function exportVault() {
    try {
      const payload = serializeVaultExport(vaultState);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ghostbrain-infinity-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      commitVault((draft) => addActivity(draft, "Vault exported", "Current vault state exported to JSON.", "success"));
      setNotice("Vault export created.");
    } catch {
      setError("Export failure. Vault JSON could not be created.");
    }
  }

  async function checkProvider(providerId: string) {
    const provider = vaultState.providers.find((candidate) => candidate.id === providerId);
    if (!provider) return;
    const result = provider.providerType === "Ollama" ? await checkOllamaProvider(provider) : {
      provider: { ...provider, status: provider.enabled ? "Configuration Required" as const : "Disabled" as const, lastCheckedAt: new Date().toISOString() },
      models: [],
      message: "Provider adapter pending. Manual model entries are supported.",
    };
    const discoveredCount = Math.max(0, mergeDiscoveredModels(vaultState.models, result.models, providerId).length - vaultState.models.length);

    commitVault((draft) => {
      draft.providers = draft.providers.map((candidate) => (candidate.id === providerId ? result.provider : candidate));
      draft.models = mergeDiscoveredModels(draft.models, result.models, providerId);
      syncModelGraphRecords(draft);
      addActivity(draft, "Provider health checked", result.message, result.provider.status === "Online" ? "success" : "warning");
    });
    setSessionActivity((current) => ({
      ...current,
      providersCheckedSession: current.providersCheckedSession + 1,
      modelsDiscoveredSession: current.modelsDiscoveredSession + discoveredCount,
      nodesCreatedSession: current.nodesCreatedSession + discoveredCount + 1,
      edgesCreatedSession: current.edgesCreatedSession + discoveredCount,
    }));
    setNotice(result.message);
    setError(result.provider.status === "Online" ? "" : result.message);
  }

  function toggleProvider(providerId: string) {
    commitVault((draft) => {
      draft.providers = draft.providers.map((provider) =>
        provider.id === providerId
          ? { ...provider, enabled: !provider.enabled, status: provider.enabled ? "Disabled" : "Not Checked" }
          : provider,
      );
      syncModelGraphRecords(draft);
      addActivity(draft, "Provider toggled", "Provider enabled state changed.", "info");
    });
  }

  function addManualModel() {
    if (!manualModel.displayName.trim() || !manualModel.name.trim()) {
      setError("Manual model requires a display name and model name.");
      return;
    }
    const provider = vaultState.providers.find((candidate) => candidate.id === manualModel.providerId) ?? vaultState.providers[0];
    const model = createManualModel({
      displayName: manualModel.displayName.trim(),
      name: manualModel.name.trim(),
      providerId: provider.id,
      provider: provider.name,
      providerType: manualModel.providerType,
      modelType: manualModel.modelType,
      capabilities: manualModel.capabilities.split(",").map((capability) => capability.trim()).filter((capability): capability is ModelCapability => modelCapabilities.includes(capability as ModelCapability)),
      tags: manualModel.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      contextWindow: manualModel.contextWindow ? Number(manualModel.contextWindow) : null,
      localOnly: manualModel.localOnly,
      requiresApiKey: manualModel.requiresApiKey,
      enabled: manualModel.enabled,
      notes: manualModel.notes,
    });
    commitVault((draft) => {
      draft.models.unshift(model);
      syncModelGraphRecords(draft);
      addActivity(draft, "Manual model added", `${model.displayName ?? model.name} added to the model registry.`, "success");
    });
    setSessionActivity((current) => ({ ...current, recordsAddedSession: current.recordsAddedSession + 1, nodesCreatedSession: current.nodesCreatedSession + 1, edgesCreatedSession: current.edgesCreatedSession + 1 }));
    setManualModel({ displayName: "", name: "", providerId: "provider-manual", providerType: "Manual", modelType: "LLM", capabilities: "chat,summarize", tags: "", contextWindow: "", localOnly: true, requiresApiKey: false, enabled: true, notes: "" });
    setNotice("Manual model added.");
    setError("");
  }

  function toggleModel(modelId: string) {
    commitVault((draft) => {
      draft.models = draft.models.map((model) =>
        model.id === modelId
          ? { ...model, enabled: !model.enabled, modelStatus: model.enabled ? "Disabled" : "Available", status: model.enabled ? "idle" : "ready" }
          : model,
      );
      syncModelGraphRecords(draft);
      addActivity(draft, "Model toggled", "Model enabled state changed.", "info");
    });
  }

  function updateFilters(patch: Partial<VaultFilters>) {
    commitVault((draft) => {
      draft.activeFilters = { ...draft.activeFilters, ...patch };
    });
  }

  function logConsoleActivity(entry: ConsoleEntry) {
    if (entry.status === "blocked" || entry.mode === "search" || entry.mode === "test" || entry.mode === "cluster") {
      commitVault((draft) => addActivity(draft, `Local query ${entry.status}`, entry.summary, entry.status === "blocked" ? "warning" : "info"));
    }
  }

  function inspectConsoleRecord(recordId: string) {
    const record = vaultState.records.find((candidate) => candidate.id === recordId);
    if (!record) return;
    commitVault((draft) => {
      draft.selectedRecordId = record.id;
      draft.selectedSourceId = record.sourceId;
      draft.selectedClusterId = record.clusterId;
      draft.selectedNodeId = `node-${record.id}`;
    });
    setSelectedModelId(record.modelId);
    setSelectedProviderId(undefined);
  }

  return (
    <DashboardShell telemetry={<BrainActivityCounter stats={brainStats} clusters={counterClusters} />}>
      <main className="dashboard-grid">
        <section className="dashboard-main" aria-label="Dashboard foundation">
          <Panel className="panel--hero" eyebrow="Vault canvas" title="Vault Graph" description="Clustered graph preview generated from the current centralized vault state.">
            <div className="demo-mode-bar">
              <div>
                <span>{vaultState.mode}</span>
                <strong>{vaultState.mode === "Demo Data Mode" ? demoFixture.manifest.datasetName : "GhostBrain Local Vault"}</strong>
                <p>{vaultState.mode === "Mixed Data Mode" ? "Mixed Data Mode: Demo and imported records are both present." : "Local-first source registry state. Cloud APIs are not required."}</p>
              </div>
              <div className="demo-counts" aria-label="Vault counts">
                <span>{brainStats.totalRecords} records</span>
                <span>{brainStats.totalGraphNodes} nodes</span>
                <span>{brainStats.totalGraphEdges} edges</span>
                <span>{vaultCounters.totalClusters} clusters</span>
              </div>
            </div>
            <div className="graph-placeholder" aria-label="Current graph placeholder">
              <img className="graph-watermark" src={brandAssets.dashboardMark} alt="GhostBrain Infinity dashboard mark" />
              {graphClusterNodes.map((cluster, index) => (
                <button className={`graph-node graph-node--${index}`} key={cluster.id} type="button" onClick={() => { setSelectedModelId(undefined); setSelectedProviderId(undefined); commitVault((draft) => { draft.selectedRecordId = undefined; draft.selectedSourceId = undefined; draft.selectedClusterId = cluster.id; draft.selectedNodeId = `cluster-node-${cluster.id}`; draft.activeFilters.cluster = cluster.id; }); }}>
                  {cluster.name}
                </button>
              ))}
            </div>
            <div className="graph-meta">
              <span>{brainStats.totalGraphNodes} graph nodes</span>
              <span>{brainStats.totalGraphEdges} graph edges</span>
              <span>{brainStats.indexedRecords} indexed records</span>
            </div>
          </Panel>

          <Panel title="Source Import Panel" eyebrow="Workflow" description="Import safe local text files, add manual sources, export or restore vault JSON, and bridge demo data into real vault state.">
            <div className="workflow-status">
              <span>{notice}</span>
              {error ? <strong>{error}</strong> : null}
            </div>
            <div className="source-workflow-grid">
              <label className="form-field">
                <span>Import local source files</span>
                <input className="native-file-input" ref={sourceImportRef} type="file" multiple accept=".txt,.md,.json,.csv,.html,.css,.js,.ts,.tsx,.jsx,.py" onChange={(event) => void importSourceFiles(event.target.files)} />
                <small>Supported: {Array.from(supportedImportExtensions).join(", ")}</small>
              </label>
              <label className="form-field">
                <span>Import Vault JSON</span>
                <input className="native-file-input" ref={vaultImportRef} type="file" accept=".json,application/json" onChange={(event) => void importVaultJson(event.target.files)} />
                <small>Valid GhostBrain export files only.</small>
              </label>
            </div>
            <div className="demo-actions">
              <button className="metal-action-button" type="button" onClick={loadDemoVault}>Load Demo Vault</button>
              <button className="metal-action-button" type="button" onClick={clearDemoData} disabled={!vaultState.sources.some((source) => source.isSynthetic)}>Clear Demo Data</button>
              <button className="metal-action-button" type="button" onClick={replaceDemoWithRealData} disabled={!vaultState.sources.some((source) => source.isSynthetic)}>Replace Demo With Real Data</button>
              <button className="metal-action-button" type="button" onClick={exportVault} disabled={vaultState.sources.length === 0}>Export Vault JSON</button>
              <button className="metal-action-button" type="button" onClick={clearEntireVault} disabled={vaultState.sources.length === 0}>Clear Entire Vault</button>
              <PlaceholderButton>Folder Import Pending</PlaceholderButton>
              <PlaceholderButton>Indexing Pending</PlaceholderButton>
            </div>
            <div className="manual-source-form">
              <label className="form-field">
                <span>Title</span>
                <input value={manualSource.title} onChange={(event) => setManualSource((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Cluster</span>
                <select value={manualSource.cluster} onChange={(event) => setManualSource((current) => ({ ...current, cluster: event.target.value }))}>
                  {clusterOptions.map((cluster) => <option key={cluster}>{cluster}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Source Type</span>
                <select value={manualSource.sourceType} onChange={(event) => setManualSource((current) => ({ ...current, sourceType: event.target.value as SourceType }))}>
                  {sourceTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Privacy</span>
                <select value={manualSource.privacyLevel} onChange={(event) => setManualSource((current) => ({ ...current, privacyLevel: event.target.value as PrivacyLevel }))}>
                  {privacyLevels.map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Tags</span>
                <input value={manualSource.tags} onChange={(event) => setManualSource((current) => ({ ...current, tags: event.target.value }))} placeholder="comma, separated" />
              </label>
              <label className="form-field form-field--wide">
                <span>Notes</span>
                <textarea value={manualSource.notes} onChange={(event) => setManualSource((current) => ({ ...current, notes: event.target.value }))} rows={3} />
              </label>
              <button className="metal-action-button" type="button" onClick={addManualSource}>Add Manual Source</button>
            </div>
          </Panel>

          <div className="panel-row">
            <Panel title="Source Registry" eyebrow="Registry" description="Create, inspect, edit, enable, disable, delete, filter, and replace local-first source records.">
              <div className="registry-stack">
                {filteredSources.length === 0 ? (
                  <StateBlock state="empty" title="No records match the current filters" description="Clear filters or adjust the search." />
                ) : (
                  filteredSources.slice(0, 30).map((source) => (
                    <article className={source.id === selectedSource?.id ? "registry-card registry-card--selected" : "registry-card"} key={source.id}>
                      <button className="registry-card__select" type="button" onClick={() => commitVault((draft) => { draft.selectedSourceId = source.id; draft.selectedRecordId = undefined; draft.selectedClusterId = undefined; draft.selectedNodeId = `node-${source.id}`; })}>
                        <h3>{source.name}</h3>
                        <p>{getClusterLabel(source.clusterId ?? source.cluster ?? "Uncategorized")} / {source.sourceType} / {source.privacyLevel}</p>
                      </button>
                      <div className="badge-row">
                        <span className={source.enabled ? "badge badge--ready" : "badge badge--disabled"}>{source.enabled ? "Enabled" : "Disabled"}</span>
                        <span className={source.indexed ? "badge badge--ready" : "badge badge--pending"}>{source.indexed ? "Indexed" : "Pending Index"}</span>
                        <span className={source.isSynthetic ? "badge badge--cloud" : "badge badge--ready"}>{source.isSynthetic ? "Synthetic Demo Record" : source.sourceOrigin ?? "Real Record"}</span>
                      </div>
                      <div className="button-row">
                        <button className="metal-action-button" type="button" onClick={() => toggleSource(source)}>{source.enabled ? "Disable" : "Enable"}</button>
                        <button className="metal-action-button" type="button" onClick={() => deleteSource(source)}>Delete</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Provider Registry" eyebrow="Local Models" description="Local provider readiness layer. Ollama checks are manual and safe; the dashboard works when providers are offline.">
              <div className="registry-stack">
                {vaultState.providers.map((provider) => (
                  <article className="registry-card" key={provider.id}>
                    <button className="registry-card__select" type="button" onClick={() => { setSelectedProviderId(provider.id); setSelectedModelId(undefined); commitVault((draft) => { draft.selectedRecordId = undefined; draft.selectedClusterId = undefined; draft.selectedNodeId = `node-${provider.id}`; }); }}>
                      <h3>{provider.name}</h3>
                      <p>{provider.providerType} / {provider.baseUrl ?? "No endpoint"}</p>
                    </button>
                    <div className="badge-row">
                      <span className={provider.status === "Online" ? "badge badge--ready" : provider.status === "Disabled" ? "badge badge--disabled" : "badge badge--pending"}>{provider.status}</span>
                      <span className={provider.localOnly ? "badge badge--ready" : "badge badge--cloud"}>{provider.localOnly ? "Local Only" : "Cloud Optional"}</span>
                      <span className={provider.supportsDiscovery ? "badge badge--ready" : "badge badge--disabled"}>{provider.supportsDiscovery ? "Discovery" : "Manual"}</span>
                    </div>
                    <div className="button-row">
                      <button className="metal-action-button" type="button" onClick={() => void checkProvider(provider.id)} disabled={!provider.enabled}>Check Local Provider</button>
                      <button className="metal-action-button" type="button" onClick={() => toggleProvider(provider.id)}>{provider.enabled ? "Disable Provider" : "Enable Provider"}</button>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Model Registry" eyebrow="Registry" description="Local and cloud model entries remain architecture records. No AI calls are executed.">
              <div className="registry-stack">
                {vaultState.models.map((model) => (
                  <article className="registry-card" key={model.id}>
                    <button className="registry-card__select" type="button" onClick={() => { setSelectedModelId(model.id); setSelectedProviderId(undefined); commitVault((draft) => { draft.selectedRecordId = undefined; draft.selectedClusterId = undefined; draft.selectedNodeId = `node-${model.id}`; }); }}>
                      <h3>{model.displayName ?? model.name}</h3>
                      <p>{model.provider} / {model.providerType} / {model.modelType}</p>
                    </button>
                    <div className="badge-row">
                      <span className={model.localOnly ? "badge badge--ready" : "badge badge--cloud"}>{model.localOnly ? "Local Only" : "Cloud Optional"}</span>
                      <span className={model.enabled ? "badge badge--ready" : "badge badge--disabled"}>{model.enabled ? "Enabled" : "Disabled By Default"}</span>
                      <span className={model.modelStatus === "Available" || model.modelStatus === "Discovered" ? "badge badge--ready" : "badge badge--pending"}>{model.modelStatus ?? model.status}</span>
                      {model.requiresApiKey ? <span className="badge badge--pending">API Key Required</span> : null}
                    </div>
                    <div className="capability-grid">{model.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div>
                    <div className="button-row">
                      <button className="metal-action-button" type="button" onClick={() => toggleModel(model.id)}>{model.enabled ? "Disable Model" : "Enable Model"}</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="manual-source-form">
                <label className="form-field"><span>Display Name</span><input value={manualModel.displayName} onChange={(event) => setManualModel((current) => ({ ...current, displayName: event.target.value }))} /></label>
                <label className="form-field"><span>Model Name</span><input value={manualModel.name} onChange={(event) => setManualModel((current) => ({ ...current, name: event.target.value }))} /></label>
                <label className="form-field"><span>Provider</span><select value={manualModel.providerId} onChange={(event) => setManualModel((current) => ({ ...current, providerId: event.target.value }))}>{vaultState.providers.map((provider) => <option value={provider.id} key={provider.id}>{provider.name}</option>)}</select></label>
                <label className="form-field"><span>Provider Type</span><select value={manualModel.providerType} onChange={(event) => setManualModel((current) => ({ ...current, providerType: event.target.value as ProviderType }))}>{providerTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="form-field"><span>Model Type</span><select value={manualModel.modelType} onChange={(event) => setManualModel((current) => ({ ...current, modelType: event.target.value as ModelType }))}>{modelTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="form-field"><span>Capabilities</span><input value={manualModel.capabilities} onChange={(event) => setManualModel((current) => ({ ...current, capabilities: event.target.value }))} /></label>
                <label className="form-field"><span>Tags</span><input value={manualModel.tags} onChange={(event) => setManualModel((current) => ({ ...current, tags: event.target.value }))} /></label>
                <label className="form-field"><span>Context Window</span><input value={manualModel.contextWindow} onChange={(event) => setManualModel((current) => ({ ...current, contextWindow: event.target.value }))} /></label>
                <label className="console-toggle"><input type="checkbox" checked={manualModel.localOnly} onChange={(event) => setManualModel((current) => ({ ...current, localOnly: event.target.checked }))} /> Local Only</label>
                <label className="console-toggle"><input type="checkbox" checked={manualModel.requiresApiKey} onChange={(event) => setManualModel((current) => ({ ...current, requiresApiKey: event.target.checked }))} /> Requires API Key</label>
                <label className="console-toggle"><input type="checkbox" checked={manualModel.enabled} onChange={(event) => setManualModel((current) => ({ ...current, enabled: event.target.checked }))} /> Enabled</label>
                <label className="form-field form-field--wide"><span>Notes</span><textarea value={manualModel.notes} rows={3} onChange={(event) => setManualModel((current) => ({ ...current, notes: event.target.value }))} /></label>
                <button className="metal-action-button" type="button" onClick={addManualModel}>Add Manual Model</button>
              </div>
            </Panel>
          </div>

          <Panel title="Filters" eyebrow="Controls" description="Filters apply to demo, imported, manual, and restored source records.">
            <div className="filter-grid">
              <label className="form-field"><span>Search</span><input value={vaultState.activeFilters.searchText} onChange={(event) => updateFilters({ searchText: event.target.value })} /></label>
              <label className="form-field"><span>Cluster</span><select value={vaultState.activeFilters.cluster} onChange={(event) => updateFilters({ cluster: event.target.value })}><option value="all">All</option>{counterClusters.map((cluster) => <option value={cluster.id} key={cluster.id}>{cluster.label}</option>)}</select></label>
              <label className="form-field"><span>Source Type</span><select value={vaultState.activeFilters.sourceType} onChange={(event) => updateFilters({ sourceType: event.target.value })}><option value="all">All</option>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="form-field"><span>Origin</span><select value={vaultState.activeFilters.origin} onChange={(event) => updateFilters({ origin: event.target.value })}><option value="all">All</option><option>Synthetic Demo</option><option>User Import</option><option>Manual Entry</option><option>Export Restore</option></select></label>
              <label className="form-field"><span>Privacy</span><select value={vaultState.activeFilters.privacyLevel} onChange={(event) => updateFilters({ privacyLevel: event.target.value })}><option value="all">All</option>{privacyLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
              <label className="form-field"><span>Enabled</span><select value={vaultState.activeFilters.enabled} onChange={(event) => updateFilters({ enabled: event.target.value as VaultFilters["enabled"] })}><option value="all">All</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label>
              <label className="form-field"><span>Indexed</span><select value={vaultState.activeFilters.indexed} onChange={(event) => updateFilters({ indexed: event.target.value as VaultFilters["indexed"] })}><option value="all">All</option><option value="indexed">Indexed</option><option value="unindexed">Unindexed</option></select></label>
              <label className="form-field"><span>Demo / Real</span><select value={vaultState.activeFilters.synthetic} onChange={(event) => updateFilters({ synthetic: event.target.value as VaultFilters["synthetic"] })}><option value="all">All</option><option value="synthetic">Synthetic</option><option value="real">Real</option></select></label>
              <button className="metal-action-button" type="button" onClick={() => updateFilters(createDefaultFilters())}>Clear Filters</button>
            </div>
          </Panel>

          <Panel title="Memory Routing Architecture" eyebrow="Routing" description="Future memory flow is represented as typed architecture only: no chatbot, no AI execution, no cloud calls.">
            <div className="routing-summary">
              <div><span>Selected Model</span><strong>{routingSnapshot.selectedModel?.name ?? "None"}</strong></div>
              <div><span>Selected Source</span><strong>{selectedSource?.name ?? "None"}</strong></div>
              <div><span>Routing Mode</span><strong>{routingStatusSeed.routingMode}</strong></div>
              <div><span>Local / Cloud</span><strong>{routingStatusSeed.localCloudMode}</strong></div>
            </div>
            <ol className="routing-steps">{routingSnapshot.steps.map((step) => <li key={step.id}><div><strong>{step.label}</strong><p>{step.description}</p></div><span>{step.status}</span></li>)}</ol>
          </Panel>

          <LocalQueryConsole vaultState={vaultState} onConsoleActivity={logConsoleActivity} onInspectRecord={inspectConsoleRecord} />
        </section>

        <aside className="dashboard-side" aria-label="Inspector and status">
          <Panel title="Inspector" eyebrow="Details" description="Inspect selected source, model, or provider metadata from the current vault state.">
            {selectedRecord ? (
              <div className="inspector-editor">
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedRecord.id}</dd></div>
                  <div><dt>Title</dt><dd>{selectedRecord.title}</dd></div>
                  <div><dt>Type</dt><dd>{selectedRecord.type}</dd></div>
                  <div><dt>Origin</dt><dd>{selectedRecord.origin}</dd></div>
                  <div><dt>Enabled</dt><dd>{selectedRecord.enabled ? "Yes" : "No"}</dd></div>
                  <div><dt>Source</dt><dd>{selectedRecord.sourceId ?? "None"}</dd></div>
                  <div><dt>Model</dt><dd>{selectedRecord.modelId ?? "None"}</dd></div>
                  <div><dt>Cluster</dt><dd>{selectedRecord.clusterId ?? "Unclustered"}</dd></div>
                  <div><dt>Created</dt><dd>{new Date(selectedRecord.createdAt).toLocaleString()}</dd></div>
                  <div><dt>Updated</dt><dd>{new Date(selectedRecord.updatedAt).toLocaleString()}</dd></div>
                  <div><dt>Related Records</dt><dd>{selectedRecord.clusterId ? vaultState.records.filter((record) => record.clusterId === selectedRecord.clusterId).length : 0}</dd></div>
                </dl>
                <label className="form-field"><span>Tags</span><input readOnly value={selectedRecord.tags.join(", ")} /></label>
                <StateBlock state="empty" title="Content Preview" description={selectedRecord.content.slice(0, 360)} />
              </div>
            ) : selectedCluster ? (
              <div className="inspector-editor">
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedCluster.id}</dd></div>
                  <div><dt>Name</dt><dd>{selectedCluster.name}</dd></div>
                  <div><dt>Confidence</dt><dd>{selectedCluster.confidence}</dd></div>
                  <div><dt>Score</dt><dd>{selectedCluster.score}</dd></div>
                  <div><dt>Records</dt><dd>{selectedCluster.recordIds.length}</dd></div>
                  <div><dt>Sources</dt><dd>{selectedCluster.sources.length || "None"}</dd></div>
                  <div><dt>Models</dt><dd>{selectedCluster.models.length || "None"}</dd></div>
                </dl>
                <label className="form-field"><span>Tags</span><input readOnly value={selectedCluster.tags.join(", ")} /></label>
                <StateBlock state="empty" title="Related Sources" description={selectedCluster.sources.join(", ") || "No source relationships."} />
              </div>
            ) : selectedGraphNode ? (
              <div className="inspector-editor">
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedGraphNode.id}</dd></div>
                  <div><dt>Label</dt><dd>{selectedGraphNode.label}</dd></div>
                  <div><dt>Type</dt><dd>{selectedGraphNode.type ?? "unknown"}</dd></div>
                  <div><dt>Category</dt><dd>{selectedGraphNode.category}</dd></div>
                  <div><dt>Status</dt><dd>{selectedGraphNode.status}</dd></div>
                  <div><dt>Source</dt><dd>{selectedGraphNode.sourceId ?? "None"}</dd></div>
                  <div><dt>Model</dt><dd>{selectedGraphNode.modelId ?? "None"}</dd></div>
                  <div><dt>Cluster</dt><dd>{selectedGraphNode.clusterId ?? "None"}</dd></div>
                  <div><dt>Connections</dt><dd>{vaultState.graphEdges.filter((edge) => edge.sourceId === selectedGraphNode.id || edge.targetId === selectedGraphNode.id).length}</dd></div>
                </dl>
              </div>
            ) : selectedProvider ? (
              <div className="inspector-editor">
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedProvider.id}</dd></div>
                  <div><dt>Name</dt><dd>{selectedProvider.name}</dd></div>
                  <div><dt>Type</dt><dd>{selectedProvider.providerType}</dd></div>
                  <div><dt>Status</dt><dd>{selectedProvider.status}</dd></div>
                  <div><dt>Enabled</dt><dd>{selectedProvider.enabled ? "Yes" : "No"}</dd></div>
                  <div><dt>Local Only</dt><dd>{selectedProvider.localOnly ? "Yes" : "No"}</dd></div>
                  <div><dt>Requires API Key</dt><dd>{selectedProvider.requiresApiKey ? "Yes" : "No"}</dd></div>
                  <div><dt>Base URL</dt><dd>{selectedProvider.baseUrl ?? "None"}</dd></div>
                  <div><dt>Last Checked</dt><dd>{selectedProvider.lastCheckedAt ? new Date(selectedProvider.lastCheckedAt).toLocaleString() : "Not Checked"}</dd></div>
                  <div><dt>Last Error</dt><dd>{selectedProvider.lastError ?? "None"}</dd></div>
                </dl>
                <StateBlock state="empty" title="Provider Notes" description={selectedProvider.notes ?? "No provider notes."} />
              </div>
            ) : selectedModel ? (
              <div className="inspector-editor">
                <label className="form-field"><span>Display Name</span><input value={selectedModel.displayName ?? selectedModel.name} onChange={(event) => commitVault((draft) => { draft.models = draft.models.map((model) => model.id === selectedModel.id ? { ...model, displayName: event.target.value } : model); })} /></label>
                <label className="form-field"><span>Model Type</span><select value={selectedModel.modelType} onChange={(event) => commitVault((draft) => { draft.models = draft.models.map((model) => model.id === selectedModel.id ? { ...model, modelType: event.target.value as ModelType } : model); })}>{modelTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedModel.id}</dd></div>
                  <div><dt>Provider</dt><dd>{selectedModel.provider}</dd></div>
                  <div><dt>Provider Type</dt><dd>{selectedModel.providerType}</dd></div>
                  <div><dt>Status</dt><dd>{selectedModel.modelStatus ?? selectedModel.status}</dd></div>
                  <div><dt>Enabled</dt><dd>{selectedModel.enabled ? "Yes" : "No"}</dd></div>
                  <div><dt>Local Only</dt><dd>{selectedModel.localOnly ? "Yes" : "No"}</dd></div>
                  <div><dt>Requires API Key</dt><dd>{selectedModel.requiresApiKey ? "Yes" : "No"}</dd></div>
                  <div><dt>Context</dt><dd>{selectedModel.contextWindow ?? "Unknown"}</dd></div>
                  <div><dt>Last Seen</dt><dd>{selectedModel.lastSeenAt ? new Date(selectedModel.lastSeenAt).toLocaleString() : "Not Seen"}</dd></div>
                  <div><dt>Manual</dt><dd>{selectedModel.manuallyAdded ? "Manual Model" : "Discovered/Synthetic"}</dd></div>
                </dl>
                <label className="form-field"><span>Capabilities</span><input value={selectedModel.capabilities.join(", ")} onChange={(event) => commitVault((draft) => { draft.models = draft.models.map((model) => model.id === selectedModel.id ? { ...model, capabilities: event.target.value.split(",").map((capability) => capability.trim()).filter((capability): capability is ModelCapability => modelCapabilities.includes(capability as ModelCapability)) } : model); })} /></label>
                <label className="form-field"><span>Tags</span><input value={selectedModel.tags.join(", ")} onChange={(event) => commitVault((draft) => { draft.models = draft.models.map((model) => model.id === selectedModel.id ? { ...model, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) } : model); })} /></label>
                <label className="form-field"><span>Notes</span><textarea rows={3} value={selectedModel.notes} onChange={(event) => commitVault((draft) => { draft.models = draft.models.map((model) => model.id === selectedModel.id ? { ...model, notes: event.target.value } : model); })} /></label>
              </div>
            ) : selectedSource ? (
              <div className="inspector-editor">
                <label className="form-field"><span>Title</span><input value={selectedSource.name} onChange={(event) => updateSource(selectedSource.id, { name: event.target.value })} /></label>
                <label className="form-field"><span>Cluster</span><select value={selectedSource.clusterId ?? selectedSource.cluster ?? "Uncategorized"} onChange={(event) => updateSource(selectedSource.id, { clusterId: event.target.value, cluster: event.target.value })}>{clusterOptions.map((cluster) => <option key={cluster}>{cluster}</option>)}</select></label>
                <label className="form-field"><span>Source Type</span><select value={selectedSource.sourceType} onChange={(event) => updateSource(selectedSource.id, { sourceType: event.target.value as SourceType })}>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="form-field"><span>Privacy</span><select value={selectedSource.privacyLevel} onChange={(event) => updateSource(selectedSource.id, { privacyLevel: event.target.value as PrivacyLevel })}>{privacyLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
                <dl className="inspector-list">
                  <div><dt>ID</dt><dd>{selectedSource.id}</dd></div>
                  <div><dt>Origin</dt><dd>{selectedSource.sourceOrigin ?? selectedSource.origin}</dd></div>
                  <div><dt>Status</dt><dd>{selectedSource.sourceStatus ?? selectedSource.status}</dd></div>
                  <div><dt>Enabled</dt><dd>{selectedSource.enabled ? "Yes" : "No"}</dd></div>
                  <div><dt>Imported</dt><dd>{new Date(selectedSource.importedAt ?? getSourceDate(selectedSource)).toLocaleString()}</dd></div>
                  <div><dt>Updated</dt><dd>{new Date(getSourceDate(selectedSource)).toLocaleString()}</dd></div>
                  <div><dt>Indexed</dt><dd>{selectedSource.indexed ? "Indexed" : "Pending Index"}</dd></div>
                  <div><dt>Synthetic</dt><dd>{selectedSource.isSynthetic ? "Synthetic Demo Record" : "Imported/Manual Record"}</dd></div>
                  <div><dt>Safe To Delete</dt><dd>{selectedSource.safeToDelete ? "Yes" : "User controlled"}</dd></div>
                  <div><dt>Connections</dt><dd>{vaultState.graphEdges.filter((edge) => edge.sourceId.includes(selectedSource.id) || edge.targetId.includes(selectedSource.id)).length}</dd></div>
                </dl>
                <label className="form-field"><span>Tags</span><input value={selectedSource.tags.join(", ")} onChange={(event) => updateSource(selectedSource.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label>
                <label className="form-field"><span>Notes</span><textarea rows={3} value={selectedSource.notes} onChange={(event) => updateSource(selectedSource.id, { notes: event.target.value })} /></label>
                <StateBlock state="empty" title="Content Preview" description={selectedSource.contentPreview ?? selectedSource.description} />
              </div>
            ) : (
              <StateBlock state="empty" title="Empty Inspector" description="Select a source, model, or graph node to inspect details." />
            )}
          </Panel>

          <Panel title="Activity Feed" eyebrow="Timeline" description="Every meaningful source workflow action records a local activity event.">
            {activityItems.length ? (
              <ul className="activity-list">{activityItems.map((event) => <li key={event.id}><span>{event.title}</span><p>{event.description}</p></li>)}</ul>
            ) : (
              <StateBlock state="empty" title="No vault activity yet" description="Import a source or load the Demo Vault to begin." />
            )}
          </Panel>

          <Panel title="System Status" eyebrow="Health" description="Compact telemetry from the local vault state.">
            <div className="status-stack">
              <span>localStorage: {appStatusSeed.localStorage}</span>
              <span>Vault mode: {vaultState.mode}</span>
              <span>Records: {vaultCounters.totalRecords}</span>
              <span>Demo / Imported / Manual: {vaultCounters.demoRecords} / {vaultCounters.importedRecords} / {vaultCounters.manualRecords}</span>
              <span>Sources enabled / disabled: {vaultCounters.enabledSources} / {vaultCounters.disabledSources}</span>
              <span>Models enabled / disabled: {vaultCounters.enabledModels} / {vaultCounters.disabledModels}</span>
              <span>Clusters: {vaultCounters.totalClusters} ({vaultCounters.strongClusters} strong)</span>
              <span>Graph nodes: {vaultCounters.graphNodes}</span>
              <span>Graph edges: {vaultCounters.graphEdges}</span>
              <span>Indexed: {brainStats.indexedRecords}</span>
              <span>Unindexed: {brainStats.unindexedRecords}</span>
              <span>Active filters: {Object.values(vaultState.activeFilters).filter((value) => value !== "all" && value !== "").length}</span>
              <span>Retrieval: {routingStatusSeed.retrievalStatus}</span>
              <span>Indexing: {routingStatusSeed.indexingStatus}</span>
              <span>Adapters: {routingStatusSeed.adapterStatus}</span>
            </div>
            <StateBlock state="loading" title="Indexing Pending" description="Parsing, chunking, embeddings, RAG, OCR, PDF parsing, and audio transcription are intentionally not implemented in Phase 6." />
            <StateBlock state="error" title="Cloud disabled by default" description="Optional cloud providers require future explicit configuration and no secrets are stored." />
          </Panel>
        </aside>
      </main>
    </DashboardShell>
  );
}
