# Phase 3 Source Import Workflows

Phase 3 turns GhostBrain Infinity into a local-first source registry foundation.

## Added

- Centralized `VaultState`
- LocalStorage vault persistence
- Demo, real, mixed, and empty vault modes
- Safe local file import for text-like files
- Manual source creation
- Source registry selection, metadata editing, enable/disable, and delete
- Source filtering by cluster, source type, origin, privacy, enabled state, indexed state, synthetic/real state, and search text
- Graph node and edge generation for new sources
- Brain Activity Counter integration from derived vault stats
- Vault JSON export and restore validation
- Demo clear, full vault clear, and demo-to-real replacement controls

## Supported File Imports

Phase 3 supports browser-based text imports for:

- `.txt`
- `.md`
- `.json`
- `.csv`
- `.html`
- `.css`
- `.js`
- `.ts`
- `.tsx`
- `.jsx`
- `.py`

Unsupported binary files, PDF parsing, OCR, audio transcription, and video parsing are intentionally deferred.

## Modes

- `Demo Data Mode`: only synthetic fixture records are loaded.
- `Real Data Mode`: only imported/manual/restored records are loaded.
- `Mixed Data Mode`: synthetic and imported/manual records are both present.
- `Empty Vault`: no source records are loaded.

## Brain Activity Counter

The counter derives from centralized vault state through `createBrainStats()`. Counts update after demo load, demo clear, manual source creation, file import, source deletion, graph changes, and JSON restore.

## Current Limitations

- No chatbot UI.
- No AI execution.
- No cloud API calls.
- No API keys.
- No vector database.
- No embeddings or RAG indexing.
- No PDF/OCR/audio/video processing.
- Import inference uses simple filename/content keyword rules.
