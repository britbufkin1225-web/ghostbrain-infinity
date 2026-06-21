import type { BrainRecord, SearchResult, VaultState } from "../types";
import { buildActiveBrainRecords } from "./vaultState";

type QueryToken = {
  field?: "source" | "model" | "tag" | "type" | "origin" | "enabled";
  value: string;
};

export function searchVault(input: { query: string; vaultState: VaultState; includeDemoData?: boolean; enabledOnly?: boolean }): SearchResult[] {
  const query = input.query.trim();
  if (!query) return [];
  const tokens = parseQuery(query);
  const records = buildActiveBrainRecords(input.vaultState, { includeDemoConsoleRecords: input.includeDemoData });

  return records
    .filter((record) => !input.enabledOnly || record.enabled)
    .map((record) => scoreRecord(record, tokens, input.vaultState))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .slice(0, 24);
}

export function parseQuery(query: string): QueryToken[] {
  return query
    .toLowerCase()
    .replace(/[?]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part): QueryToken => {
      const match = part.match(/^(source|model|tag|type|origin|enabled):(.+)$/);
      return match ? { field: match[1] as QueryToken["field"], value: match[2] } : { value: part };
    });
}

function scoreRecord(record: BrainRecord, tokens: QueryToken[], vaultState: VaultState): SearchResult {
  let score = 0;
  const matchedFields = new Set<string>();
  const matchedTags = new Set<string>();
  const title = record.title.toLowerCase();
  const content = record.content.toLowerCase();
  const tags = record.tags.map((tag) => tag.toLowerCase());
  const source = record.sourceId ? vaultState.sources.find((candidate) => candidate.id === record.sourceId) : undefined;
  const model = record.modelId ? vaultState.models.find((candidate) => candidate.id === record.modelId) : undefined;
  const sourceText = `${source?.name ?? ""} ${source?.sourceType ?? ""} ${source?.sourceOrigin ?? ""}`.toLowerCase();
  const modelText = `${model?.displayName ?? ""} ${model?.name ?? ""} ${model?.provider ?? ""} ${model?.modelType ?? ""}`.toLowerCase();

  for (const token of tokens) {
    const value = token.value;
    if (token.field === "enabled") {
      const enabledValue = value === "true" || value === "yes" || value === "enabled";
      if (record.enabled === enabledValue) {
        score += 16;
        matchedFields.add("enabled");
      }
      continue;
    }

    if (token.field === "tag") {
      if (tags.includes(value)) {
        score += 42;
        matchedFields.add("tags");
        matchedTags.add(value);
      }
      continue;
    }

    if (token.field === "type") {
      if (record.type === value || String(source?.sourceType ?? model?.modelType ?? "").toLowerCase().includes(value)) {
        score += 28;
        matchedFields.add("type");
      }
      continue;
    }

    if (token.field === "origin") {
      if (record.origin === value) {
        score += 28;
        matchedFields.add("origin");
      }
      continue;
    }

    if (token.field === "source") {
      if (sourceText.includes(value) || record.sourceId?.toLowerCase().includes(value)) {
        score += 34;
        matchedFields.add("source");
      }
      continue;
    }

    if (token.field === "model") {
      if (modelText.includes(value) || record.modelId?.toLowerCase().includes(value)) {
        score += 34;
        matchedFields.add("model");
      }
      continue;
    }

    if (title === value) {
      score += 50;
      matchedFields.add("title");
    } else if (title.includes(value)) {
      score += 36;
      matchedFields.add("title");
    }

    if (tags.includes(value)) {
      score += 42;
      matchedFields.add("tags");
      matchedTags.add(value);
    } else if (tags.some((tag) => tag.includes(value))) {
      score += 24;
      matchedFields.add("tags");
      tags.filter((tag) => tag.includes(value)).forEach((tag) => matchedTags.add(tag));
    }

    if (sourceText.includes(value)) {
      score += 30;
      matchedFields.add("source");
    }

    if (modelText.includes(value)) {
      score += 30;
      matchedFields.add("model");
    }

    if (content.includes(value)) {
      score += 20;
      matchedFields.add("content");
    }
  }

  return {
    record,
    score,
    matchedFields: Array.from(matchedFields),
    matchedTags: Array.from(matchedTags),
    reason: createReason(score, matchedFields),
  };
}

function createReason(score: number, matchedFields: Set<string>): string {
  if (score >= 70) return `Strong local match via ${Array.from(matchedFields).join(", ")}.`;
  if (score >= 34) return `Relevant local match via ${Array.from(matchedFields).join(", ")}.`;
  return `Weak keyword overlap via ${Array.from(matchedFields).join(", ")}.`;
}
