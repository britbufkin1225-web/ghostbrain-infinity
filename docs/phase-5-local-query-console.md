# Phase 5 Local Query Console

Phase 5 adds a safe in-app Local Query Console for inspecting GhostBrain Infinity vault state.

The console is a local registry query surface, not a terminal, code evaluator, network client, or chatbot.

## Commands

- `/help` lists supported commands.
- `/search <term>` searches sources, models, graph nodes, and optional demo brain records.
- `/sources` lists registered source records.
- `/models` lists registered model records.
- `/test model:<id> prompt:"..."` runs a dry-run model test and returns a mock response.
- `/cluster <term>` creates a local cluster preview from matching records.
- `/clear` clears console history.

Plain text input is treated as a local search query.

## Persistence

The console uses these localStorage keys:

- `ghostbrain.console.history`
- `ghostbrain.console.scope`
- `ghostbrain.console.demoDataEnabled`

## Demo Brain Data

The console includes a removable demo brain data toggle. When enabled, synthetic demo records are included in search and cluster previews. When disabled, results come only from the active vault state.

## Safety Rules

- No shell execution.
- No JavaScript evaluation.
- No subprocess execution.
- No unrestricted network requests.
- No credential handling.
- No cloud model calls.
- `/test` is dry-run only and returns a mock response.
- Blocked command attempts are recorded as safe-mode activity warnings.

## Files

- `src/components/dashboard/LocalQueryConsole.tsx`
- `src/lib/console/localQueryConsole.ts`
- `src/data/demoBrainRecords.ts`
- `src/pages/Dashboard.tsx`
- `src/styles/globals.css`
- `src/types/index.ts`

## Phase Status

Phase 5 is complete when the console can query local records, show counters, persist history and scope, run dry-run tests, block unsafe command shapes, and update the activity feed without adding real execution behavior.
