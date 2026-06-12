---
id: 2026-06-11-codex-agentviz-json-export-contract
type: agent-run
provider: codex
model: gpt-5
status: done
project: AgentViz
created: 2026-06-11T18:10:00-04:00
updated: 2026-06-11T19:00:00-04:00
check: null
next_action: No action - completed
human_owner: aufbau1s
source_thread: https://github.com/aufbau1s/AgentViz/pull/25
artifacts:
  - docs/json-export.md
  - docs/decisions/0005-json-export-is-derived-data.md
  - src/export.ts
  - src/export.test.ts
---

# JSON Export Contract

## Objective

Define the machine-readable export shape that downstream UIs and integrations can consume without making JSON the source of truth.

## Prompt

Create the first JSON export contract and align the implementation with the Markdown registry model.

## Current State

The work is merged. `agentviz export --json` emits `agentviz-export-v0` as derived data from the Markdown registry.

## Result / Output

PR #25 merged the JSON export contract, ADR, implementation updates, and focused export tests.

## Next Action

No action - completed.

## Artifacts

- `docs/json-export.md`
- `docs/decisions/0005-json-export-is-derived-data.md`
- `src/export.ts`
- `src/export.test.ts`
- https://github.com/aufbau1s/AgentViz/pull/25

## Timeline

- 2026-06-11T18:10:00-04:00 - Started the JSON export contract pass.
- 2026-06-11T18:45:00-04:00 - Documented export metadata, runs, body sections, findings, and stability rules.
- 2026-06-11T19:00:00-04:00 - Merged PR #25 and marked the run complete.

## Handoff Notes

The local UI should consume this export contract first. JSON remains disposable derived data, and Markdown remains canonical.
