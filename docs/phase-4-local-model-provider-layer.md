# Phase 4 Local Model Provider Layer

Phase 4 adds the provider and model registry foundation for GhostBrain Infinity without introducing required AI execution.

## Scope

- Local provider registry seeded with Ollama Local and Manual Model Registry entries.
- Manual health check flow for Ollama through `/api/tags`.
- Graceful offline status handling when Ollama is not running.
- Manual model registration for local, cloud, OpenAI-compatible, and manual entries.
- Provider and model enable/disable controls.
- Provider/model graph record synchronization.
- Activity feed events for provider checks, toggles, and model changes.

## Safety Rules

- No provider is checked on app startup.
- Ollama checks only run when the user clicks the health check control.
- Offline providers do not block the dashboard.
- No cloud provider calls are made.
- API key handling is intentionally not implemented in this phase.
- Discovered models are registry metadata only until a later execution layer is designed.

## Files

- `src/services/providers/providerRegistry.ts`
- `src/services/providers/ollamaAdapter.ts`
- `src/services/providers/modelRegistry.ts`
- `src/pages/Dashboard.tsx`
- `src/types/index.ts`

## Phase Status

The app is ready for later real model execution work because provider identity, provider status, discovered models, manual models, and registry graph records now have stable shapes.
