# Schema Contract

This document sketches the planned V0 registry contract. The final user-facing LLM contract will live in generated workspaces as `agents/schema.md`.

## Run Frontmatter

Each run note should begin with YAML frontmatter:

```yaml
---
id: 2026-05-24-codex-agentviz-foundation
type: agent-run
provider: codex
model: gpt-5
status: running
project: AgentViz
created: 2026-05-24T16:00:00-04:00
updated: 2026-05-24T16:15:00-04:00
check: 2026-05-24T17:00:00-04:00
next_action: Draft foundation docs and issue templates
human_owner: aufbau1s
source_thread: https://example.com/thread-or-local-reference
artifacts:
  - README.md
  - docs/architecture.md
---
```

## Required Fields

- `id`: stable unique run id.
- `type`: must be `agent-run`.
- `provider`: provider or workflow origin.
- `model`: model or tool identifier when known.
- `status`: current run status.
- `project`: project or workspace name.
- `created`: ISO 8601 timestamp.
- `updated`: ISO 8601 timestamp.
- `check`: next expected check time, if active.
- `next_action`: next concrete action.
- `human_owner`: person responsible for review or direction.
- `source_thread`: link or reference to the originating thread.
- `artifacts`: list of produced or relevant artifacts.

## Provider Values

V0 treats providers as lightweight string values. Planned examples:

- `codex`
- `claude-code`
- `chatgpt`
- `cursor`
- `manus`
- `manual`

Unknown providers should lint as warnings, not hard errors, until the provider registry is finalized.

## Status Values

- `queued`: captured but not started.
- `running`: actively in progress.
- `needs-review`: waiting for human review.
- `needs-redirect`: needs a new prompt, changed scope, or strategic decision.
- `blocked`: cannot proceed without external input or dependency.
- `parked`: intentionally paused.
- `done`: completed.

## Required Headings

Each run note should contain these headings in this order:

```md
## Objective

## Prompt

## Current State

## Result / Output

## Next Action

## Artifacts

## Timeline

## Handoff Notes
```

## Lint Rules

V0 linting should catch:

- missing required frontmatter,
- invalid `type`,
- invalid or unknown `status`,
- missing required headings,
- stale `updated` timestamps,
- active runs without `check`,
- active runs without `next_action`,
- malformed `artifacts`,
- duplicate run ids,
- run files not linked from `agents/index.md`.

## Active Statuses

For warning purposes, these statuses are active:

- `queued`
- `running`
- `needs-review`
- `needs-redirect`
- `blocked`

`parked` and `done` may omit `check` if `next_action` explains the pause or completion state.

## JSON Export

JSON export should be generated from Markdown and treated as disposable derived data. The export should include normalized frontmatter, parsed body sections, lint warnings, and source file paths.
