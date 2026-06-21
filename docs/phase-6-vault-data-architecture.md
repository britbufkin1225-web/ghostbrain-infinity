# Phase 6 Vault Data Architecture

Phase 6 locks the local-first data layer before the future dashboard visual overhaul.

## Boundary

This phase does not redesign the dashboard shell. Phase 7 can replace the visual UI while keeping the services and types introduced here.

## Data Layer

- `src/types/vault.ts` defines normalized brain records and versioned snapshot shape.
- `src/types/registry.ts` defines source/model registry export shapes.
- `src/types/graph.ts` defines cluster, counter, and graph contract types.
- `src/types/console.ts` defines scored search result output.

## Services

- `src/services/vaultState.ts` derives normalized brain records from sources, models, providers, and optional demo brain records.
- `src/services/searchService.ts` performs deterministic local search with scores, matched fields, tags, and reasons.
- `src/services/clusterService.ts` performs deterministic local clustering by tags, source/model relationships, type, and cluster metadata.
- `src/services/graphService.ts` derives graph nodes and edges from current vault state.
- `src/services/counterService.ts` derives Phase 6 counters from normalized state.
- `src/services/storageService.ts` reads legacy vault state safely and writes predictable Phase 6 storage keys.

## Safety

- No real AI execution.
- No cloud model calls.
- No credential storage.
- No shell access.
- No arbitrary script execution.
- Model tests remain mock/dry-run only.
- External/cloud-style model test targets are blocked by safe execution policy.

## Console

The Local Query Console now routes search and cluster commands through the Phase 6 services.

Supported examples:

- `/search obsidian`
- `/search source:obsidian`
- `/search model:qwen`
- `/search tag:security`
- `/search type:document`
- `/search origin:demo`
- `/cluster security`
- `/cluster project`
- `/test model:demo-local prompt:"Summarize current brain records"`

Search results include score, matched fields, matched tags, reason, source/model references when present, timestamp, duration, and safe-mode status.

## Snapshot

Vault exports keep the existing export wrapper and include a versioned `snapshot` payload with:

- normalized records
- source registry entries
- model registry entries
- graph nodes and edges
- clusters
- console-safe settings
- activity summary
- export timestamp

Imports validate shape before applying state and preserve existing vault data when JSON or format validation fails.

## Phase 7 Handoff

Phase 7 may redesign the dashboard around these services without rewriting the data layer.
