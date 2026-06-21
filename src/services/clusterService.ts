import type { BrainCluster, BrainRecord, VaultState } from "../types";
import { buildActiveBrainRecords } from "./vaultState";

export function clusterVault(input: { vaultState: VaultState; includeDemoData?: boolean; query?: string }): BrainCluster[] {
  const query = input.query?.trim().toLowerCase() ?? "";
  const records = buildActiveBrainRecords(input.vaultState, { includeDemoConsoleRecords: input.includeDemoData }).filter((record) => {
    if (!query) return true;
    return `${record.title} ${record.tags.join(" ")} ${record.content} ${record.origin} ${record.type}`.toLowerCase().includes(query);
  });

  const groups = new Map<string, BrainRecord[]>();
  for (const record of records) {
    const clusterKey = record.clusterId || record.tags[0] || record.type || "uncategorized";
    const key = normalizeClusterId(clusterKey);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }

  return Array.from(groups.entries())
    .map(([id, group]) => buildCluster(id, group, input.vaultState))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function buildCluster(id: string, records: BrainRecord[], vaultState: VaultState): BrainCluster {
  const tags = countValues(records.flatMap((record) => record.tags));
  const sourceIds = Array.from(new Set(records.map((record) => record.sourceId).filter((value): value is string => Boolean(value))));
  const modelIds = Array.from(new Set(records.map((record) => record.modelId).filter((value): value is string => Boolean(value))));
  const sharedTagScore = tags.filter((tag) => tag.count > 1).length * 12;
  const sourceScore = sourceIds.length ? 18 : 0;
  const modelScore = modelIds.length ? 18 : 0;
  const sizeScore = Math.min(records.length * 8, 48);
  const score = sizeScore + sharedTagScore + sourceScore + modelScore;

  return {
    id,
    name: readableClusterName(id, records),
    recordIds: records.map((record) => record.id),
    tags: tags.slice(0, 8).map((tag) => tag.value),
    sources: sourceIds.map((sourceId) => vaultState.sources.find((source) => source.id === sourceId)?.name ?? sourceId).slice(0, 6),
    models: modelIds.map((modelId) => vaultState.models.find((model) => model.id === modelId)?.displayName ?? vaultState.models.find((model) => model.id === modelId)?.name ?? modelId).slice(0, 6),
    confidence: score >= 72 ? "Strong" : score >= 34 ? "Moderate" : "Weak",
    score,
  };
}

function countValues(values: string[]): Array<{ value: string; count: number }> {
  const counts = values.reduce<Record<string, number>>((accumulator, value) => {
    const key = value.trim().toLowerCase();
    if (!key) return accumulator;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function readableClusterName(id: string, records: BrainRecord[]): string {
  const firstCluster = records.find((record) => record.clusterId)?.clusterId;
  const sourceLabel = firstCluster || id;
  return sourceLabel
    .replace(/^cluster-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeClusterId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "uncategorized";
}
