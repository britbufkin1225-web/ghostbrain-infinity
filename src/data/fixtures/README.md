# Synthetic Test Corpus

This folder contains the GhostBrain Infinity Synthetic Test Corpus for development and portfolio-safe dashboard testing.

The corpus is synthetic fixture data only. It contains no real personal data, credentials, private documents, access tokens, API keys, real security incidents, or private messages.

## Contents

- `synthetic-manifest.json`: dataset metadata, counts, replacement notes, and safety flags
- `synthetic-sources.json`: synthetic source registry records
- `synthetic-models.json`: synthetic model/provider registry records
- `synthetic-graph-nodes.json`: synthetic graph nodes for clustering demos
- `synthetic-graph-edges.json`: synthetic graph relationships
- `synthetic-activity-events.json`: synthetic activity feed events
- `synthetic-clusters.json`: cluster labels and summary counts
- `documents/`: optional markdown samples for future import tests

## Replacement Path

Future real import workflows should replace this folder through the fixture loader boundary, not by rewriting the dashboard shell.

Expected future path:

1. Import real source records.
2. Normalize them into the `SourceRecord` shape.
3. Store metadata locally.
4. Optionally parse, chunk, and index content.
5. Build graph nodes and edges from real relationships.
6. Replace `loadSyntheticFixtureVault()` usage with real vault state.

The synthetic corpus is safe to delete once real import and registry workflows exist.

## Brain File Counter Requirement

The Synthetic Test Corpus feeds the Brain Activity Counter through `loadSyntheticFixtureVault()` and the centralized `createBrainStats()` selector.

Counts are derived from the current vault state, not manually maintained fixture totals. Loading, resetting, or clearing demo data recalculates the visible counter and hover telemetry without a page refresh.

The counter currently uses records rather than filesystem files because the app model is source/model/graph registry data. Future imported files should normalize into records first, then update the same statistics engine.
