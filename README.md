# GhostBrain Infinity

GhostBrain Infinity is a clean-rewrite dashboard app built under the devdevbuilds brand system.

The project is a local-first foundation for future AI source and model records, vault graph logic, Obsidian-style registry concepts, import/export workflows, activity visibility, and a polished dark metallic interface.

## Current Phase

Phase 6 - Vault Data Architecture + Search/Clustering Logic Lock

The repo has completed the clean app foundation, architecture lock, dashboard skeleton, starter brand/UI asset kit, metallic dashboard visual system, AI source/model registry architecture, synthetic clustering demo corpus, local-first source workflow layer, local model provider health layer, safe local query console, and centralized vault data/search/clustering layer.

Phase 1 established repo hygiene, app startup, routing-level structure, dashboard shell layout, seed data, base TypeScript types, placeholder storage utilities, and the initial visual system.

Phase 1.5 locked the component hierarchy, dashboard shell regions, placeholder source/model registry data shape, vault graph data shape, import/export architecture stub, localStorage persistence stub, and empty/loading/error UI states.

Phase 1.75 adds the organized visual asset system needed before the full metallic dashboard styling pass.

Phase 2 applies the approved GhostBrain Infinity dark metallic command-center visual system.

Phase 2.5 adds source/model registry architecture, provider metadata, local/cloud distinctions, retrieval/indexing status, and routing architecture stubs without AI execution.

Phase 2.75 adds a removable Synthetic Test Corpus for demo clustering, graph density, registry visibility, and activity-feed testing.

Phase 3 adds local file import, manual source creation, registry CRUD behavior, vault JSON export/restore, localStorage persistence, filtering, inspector editing, graph updates, and demo-to-real data mode handling.

Phase 4 adds a local model adapter architecture, Ollama health check adapter, provider registry, manual model registration, provider/model graph records, and offline-safe provider status handling.

Phase 5 adds the Local Query Console for safe in-app vault search, source/model inspection, cluster previews, and dry-run model tests.

Phase 6 stabilizes the local-first brain data layer with normalized brain records, deterministic search scoring, deterministic clustering, derived graph relationships, versioned snapshot export data, safer storage helpers, accurate counters, and inspector sync across records, clusters, graph nodes, sources, models, and providers.

Real AI execution, cloud API calls, vector databases, embeddings, PDF parsing, OCR, audio transcription, unrestricted terminal execution, and RAG pipeline are intentionally not implemented yet.

## Brain File Counter Requirement

Phase 2.75 introduced the Brain Activity Counter as dashboard telemetry for the Synthetic Test Corpus. Phase 3 preserves it and now derives the counter from centralized `VaultState`.

The counter is derived from centralized `BrainStats` generation rather than hardcoded numbers. It currently tracks:

- total brain records
- total sources and models
- graph node and edge counts
- indexed and unindexed records
- records by cluster
- records by source type
- records by privacy level
- session records added, removed, and imported
- session graph nodes and edges created

The header counter updates from application state when the Demo Vault is loaded, source files are imported, manual records are created, records are deleted, or demo data is cleared. Hovering or focusing the counter opens a telemetry card with cluster counts and session activity.

The current implementation uses the synthetic fixture vault first and is designed so future real imports can plug into the same statistics engine without rewriting dashboard telemetry.

## Stack

- Vite
- React
- TypeScript
- Plain CSS
- localStorage helper utilities for later phases

## Install

```bash
npm install
```

On Windows, if npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run npm with Node's system CA option:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm install
```

## Run Locally

```bash
npm run dev
```

The dev server will print the local URL. During verification this repo ran successfully at `http://127.0.0.1:5189/` because lower Vite ports were already occupied.

## Build

```bash
npm run build
```

## Current App Status

- Clean React + TypeScript app scaffold
- Dark metallic dashboard shell
- Primary GhostBrain Infinity header with devdevbuilds studio credit
- Sidebar navigation placeholder
- Left control rail with category, filter, and registry-control placeholders
- Main dashboard canvas placeholder
- Right inspector and status column placeholder
- Placeholder panels for Vault Graph, Source Registry, Model Registry, Node Inspector, Activity Feed, System Status, Import / Export, and Filters
- Seed data for source records, model records, and activity events
- Seed data for graph nodes, graph edges, filters, and app status
- Basic extensible TypeScript types
- Safe JSON localStorage helper functions
- Import/export architecture stub with disabled placeholder actions
- Empty, loading, and error state UI blocks
- Brand asset kit for logos, mascot icons, studio marks, UI treatment references, and dashboard styling notes
- AI model/source registry architecture with local/cloud provider metadata
- Memory routing architecture stub with no AI execution
- Synthetic Test Corpus with 128 records, 9 model entries, 40 graph nodes, 72 graph edges, 8 clusters, and 32 activity events
- Demo Data Mode status area with honest disabled placeholders for demo load/reset/clear/export/import replacement
- Live Brain Activity Counter with hover telemetry and centralized derived statistics
- Centralized VaultState with localStorage persistence
- Source import panel for text, markdown, JSON, CSV, and common code files
- Manual source creation and source registry metadata editing
- Vault JSON export/restore with validation
- Demo, real, mixed, and empty vault mode handling
- Local provider registry with manual Ollama health checks
- Manual model registration and model enable/disable controls
- Provider/model graph record synchronization
- Local Query Console with `/help`, `/search`, `/sources`, `/models`, `/test`, `/cluster`, and `/clear`
- Console persistence for history, scope, and demo brain data toggle
- Safe-mode blocking for shell/eval/subprocess/network-style command attempts
- Centralized normalized brain records derived from sources, models, providers, and optional demo brain records
- Deterministic local search service with scores, matched fields, matched tags, and explainable reasons
- Deterministic local cluster service with confidence labels and scores
- Derived graph node and edge service for clusters, records, sources, models, and providers
- Versioned GhostBrain snapshot data included in vault exports
- Phase 6 storage service that reads legacy keys and writes predictable `ghostbrain.vault.*` keys
- Inspector sync for selected records, clusters, graph nodes, sources, models, and providers

## Project Structure

```txt
src/
  assets/
    brand/
    icons/
    images/
    references/
    studio/
    ui/
  components/
    layout/
    ui/
    dashboard/
    graph/
    importExport/
    registry/
    activity/
    status/
  config/
  data/
    fixtures/
    seed/
    schemas/
  hooks/
  lib/
    console/
    storage/
    validation/
    graph/
    registry/
    routing/
  services/
    counterService.ts
    clusterService.ts
    graphService.ts
    providers/
    searchService.ts
    storageService.ts
    vaultState.ts
  pages/
  styles/
  types/
docs/
```

## Brand

GhostBrain Infinity is the primary visual identity. devdevbuilds is the parent studio credit.

Brand rules, palette, asset names, and placement guidance live in [`brand/README.md`](brand/README.md).

Phase 1.75 dashboard asset notes live in [`src/assets/references/dashboard-reference-notes.md`](src/assets/references/dashboard-reference-notes.md).

The asset manifest lives in [`src/assets/references/asset-manifest.md`](src/assets/references/asset-manifest.md).

Synthetic fixture data lives in [`src/data/fixtures/`](src/data/fixtures/). It is safe to delete and replace with real imported data in later phases.

Phase 3 workflow notes live in [`docs/phase-3-source-import-workflows.md`](docs/phase-3-source-import-workflows.md).

Phase 4 provider notes live in [`docs/phase-4-local-model-provider-layer.md`](docs/phase-4-local-model-provider-layer.md).

Phase 5 console notes live in [`docs/phase-5-local-query-console.md`](docs/phase-5-local-query-console.md).

Phase 6 data architecture notes live in [`docs/phase-6-vault-data-architecture.md`](docs/phase-6-vault-data-architecture.md).

## Planned Next Phases

- Phase 7: Full metallic GhostBrain Infinity dashboard redesign
- Phase 8: RAG + Memory Index
- Phase 9: Voice Layer
- Phase 10: Polish pass, accessibility review, portfolio presentation, and production hardening
