import { useEffect, useMemo, useState } from "react";
import { demoBrainRecords } from "../../data/demoBrainRecords";
import { executeConsoleCommand } from "../../lib/console/localQueryConsole";
import { getStoredJson, setStoredJson } from "../../lib/storage/localStorage";
import type { ConsoleEntry, VaultState } from "../../types";

interface LocalQueryConsoleProps {
  vaultState: VaultState;
  onConsoleActivity: (entry: ConsoleEntry) => void;
  onInspectRecord?: (recordId: string) => void;
}

const historyKey = "ghostbrain.console.history";
const scopeKey = "ghostbrain.console.scope";
const demoEnabledKey = "ghostbrain.console.demoDataEnabled";
const scopes = ["All Brain", "Sources", "Models", "Graph Nodes", "Demo Data", "Imported Only", "Enabled Only"];
const commandChips = ["/help", "/search obsidian", "/search tag:security", "/search origin:demo", "/sources", "/models", "/test model:demo-local prompt:\"Summarize current brain records\"", "/cluster security", "/cluster project", "/clear"];

export function LocalQueryConsole({ vaultState, onConsoleActivity, onInspectRecord }: LocalQueryConsoleProps) {
  const [command, setCommand] = useState("");
  const [scope, setScope] = useState(() => getStoredJson(scopeKey, "All Brain"));
  const [demoDataEnabled, setDemoDataEnabled] = useState(() => getStoredJson(demoEnabledKey, true));
  const [history, setHistory] = useState<ConsoleEntry[]>(() => getStoredJson(historyKey, []));

  useEffect(() => {
    setStoredJson(historyKey, history.slice(0, 30));
  }, [history]);

  useEffect(() => {
    setStoredJson(scopeKey, scope);
  }, [scope]);

  useEffect(() => {
    setStoredJson(demoEnabledKey, demoDataEnabled);
  }, [demoDataEnabled]);

  const counterSummary = useMemo(
    () => ({
      totalBrain: vaultState.records.length + (demoDataEnabled ? demoBrainRecords.length : 0),
      activeRecords: vaultState.records.length,
      sources: vaultState.sources.length,
      models: vaultState.models.length,
      demoRecords: demoDataEnabled ? demoBrainRecords.length : 0,
      importedRecords: vaultState.sources.filter((source) => !source.isSynthetic).length,
      enabledSources: vaultState.sources.filter((source) => source.enabled).length,
      disabledSources: vaultState.sources.filter((source) => !source.enabled).length,
    }),
    [demoDataEnabled, vaultState.models.length, vaultState.sources],
  );

  function submit(nextCommand = command) {
    const entry = executeConsoleCommand({ command: nextCommand, scope, demoDataEnabled, vaultState });

    if (entry.command.trim().toLowerCase() === "/clear") {
      setHistory([]);
      setCommand("");
      onConsoleActivity(entry);
      return;
    }

    setHistory((current) => [entry, ...current].slice(0, 30));
    setCommand("");
    if (entry.mode !== "help" || entry.command.trim().toLowerCase() !== "/help") {
      onConsoleActivity(entry);
    }
  }

  return (
    <section className="local-console" aria-label="Local Query Console">
      <div className="local-console__header">
        <div>
          <span className="panel__eyebrow">SAFE MODE / DRY RUN</span>
          <h2>Local Query Console</h2>
          <p>Search local vault state, demo brain records, graph labels, and model registry entries. This is not a terminal.</p>
        </div>
        <div className="console-badge-row" aria-label="Console counters">
      <span title="Total brain records includes normalized records plus enabled demo brain records.">Total Brain: {counterSummary.totalBrain}</span>
      <span title="Normalized records currently derived from the centralized vault state.">Active Records: {counterSummary.activeRecords}</span>
          <span title="Source registry records in current vault state.">Sources: {counterSummary.sources}</span>
          <span title="Model registry records in current vault state.">Models: {counterSummary.models}</span>
          <span title="Removable demo records used only by the console when enabled.">Demo Records: {counterSummary.demoRecords}</span>
          <span title="Imported or manually created source records.">Imported Records: {counterSummary.importedRecords}</span>
          <span title="Enabled source records.">Enabled Sources: {counterSummary.enabledSources}</span>
          <span title="Disabled source records.">Disabled Sources: {counterSummary.disabledSources}</span>
        </div>
      </div>

      <div className="local-console__controls">
        <label className="form-field">
          <span>Console Input</span>
          <input
            value={command}
            placeholder='Try /search tag:security, /cluster project, or /test model:demo-local prompt:"Summarize current brain records"'
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
          />
        </label>
        <label className="form-field">
          <span>Scope</span>
          <select value={scope} onChange={(event) => setScope(event.target.value)}>
            {scopes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="console-toggle">
          <input type="checkbox" checked={demoDataEnabled} onChange={(event) => setDemoDataEnabled(event.target.checked)} />
          Use Demo Brain Data
        </label>
        <button className="metal-action-button" type="button" onClick={() => submit()}>
          Run Safe Query
        </button>
        <button className="metal-action-button" type="button" onClick={() => setHistory([])}>
          Clear History
        </button>
      </div>

      <div className="console-chip-row" aria-label="Console command chips">
        {commandChips.map((chip) => (
          <button className="metal-action-button" type="button" key={chip} onClick={() => submit(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <div className="console-output" aria-live="polite">
        {history.length === 0 ? (
          <div className="console-entry console-entry--empty">
            <strong>No Console History</strong>
            <p>No local queries yet. Run a search, inspect sources, or test a model in safe mode.</p>
          </div>
        ) : (
          history.map((entry) => (
            <article className={`console-entry console-entry--${entry.status}`} key={entry.id}>
              <div>
                <span>{entry.safetyMode}</span>
                <strong>{entry.summary}</strong>
                <p>{entry.command}</p>
              </div>
              <small>{new Date(entry.timestamp).toLocaleTimeString()} / {entry.durationMs ?? 0}ms</small>
              {entry.details ? <ConsoleDetails details={entry.details} onInspectRecord={onInspectRecord} /> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ConsoleDetails({ details, onInspectRecord }: { details: unknown; onInspectRecord?: (recordId: string) => void }) {
  if (isSearchDetails(details)) {
    return (
      <div className="console-result-list">
        {details.results.map((result) => (
          <button className="console-result-card" type="button" key={result.id} onClick={() => onInspectRecord?.(result.id)}>
            <strong>{result.title}</strong>
            <span>{result.origin} / {result.type} / score {result.score}</span>
            <small>{result.reason}</small>
            <small>Fields: {result.matchedFields.join(", ") || "none"}{result.matchedTags.length ? ` / Tags: ${result.matchedTags.join(", ")}` : ""}</small>
          </button>
        ))}
      </div>
    );
  }

  return <pre>{JSON.stringify(details, null, 2)}</pre>;
}

function isSearchDetails(value: unknown): value is { results: Array<{ id: string; title: string; origin: string; type: string; score: number; reason: string; matchedFields: string[]; matchedTags: string[] }> } {
  return Boolean(value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results));
}
