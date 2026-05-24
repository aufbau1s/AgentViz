# Schema Contract

Status: V0 draft.

This document defines the AgentViz Markdown registry schema. It is the source document for the generated workspace contract that will later live at `agents/schema.md`.

The contract has two goals:

- Make run notes easy for humans and LLMs to read and maintain.
- Make run notes strict enough for a CLI, UI, linter, and JSON exporter to trust.

## Registry Layout

An AgentViz workspace stores its canonical state in an `agents/` directory:

```text
agents/
  index.md
  schema.md
  log.md
  runs/
    {id}.md
```

### `agents/index.md`

Human-readable dashboard for active work. It should link to run notes and may be regenerated or maintained by humans, the CLI, or LLMs.

### `agents/schema.md`

Workspace-local operating contract for humans and LLMs. It should be generated from this repository's schema contract, using [the workspace contract template](../templates/agents/schema.md) as its starting point, and may include project-specific guidance.

### `agents/log.md`

Append-only registry maintenance log. Use this for registry-level events, not as a replacement for per-run timelines.

### `agents/runs/{id}.md`

One Markdown file per tracked agent run, thread, or manual handoff. The filename stem must match the frontmatter `id`.

## Run Note Shape

Each run note has YAML frontmatter followed by fixed Markdown sections:

```md
---
id: 2026-05-24-codex-agentviz-schema
type: agent-run
provider: codex
model: gpt-5
status: running
project: AgentViz
created: 2026-05-24T16:00:00-04:00
updated: 2026-05-24T16:20:00-04:00
check: 2026-05-24T17:00:00-04:00
next_action: Finish the V0 schema contract
human_owner: aufbau1s
source_thread: https://github.com/aufbau1s/AgentViz/issues/1
artifacts:
  - docs/schema-contract.md
---

# AgentViz Schema Contract

## Objective

Define the V0 Markdown registry schema.

## Prompt

Original prompt or summary.

## Current State

Current state of the run.

## Result / Output

Pending.

## Next Action

Finish the V0 schema contract.

## Artifacts

- docs/schema-contract.md

## Timeline

- 2026-05-24T16:00:00-04:00 - Created run.

## Handoff Notes

Notes for the next human or agent.
```

An optional single `#` title is allowed between the frontmatter and the required `##` sections. Do not add extra `##` sections in V0. Use `###` headings inside the required sections if more structure is needed.

## Required Frontmatter

All required keys must be present. Some values may be `null` only where explicitly allowed.

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Stable unique id. Must match `^[a-z0-9][a-z0-9._-]*$` and the file stem in `agents/runs/{id}.md`. |
| `type` | string | Must be exactly `agent-run`. |
| `provider` | string | Lower-kebab provider value. Known V0 values are listed below. Unknown valid strings are warnings, not errors. |
| `model` | string | Non-empty model or tool identifier. Use `unknown` when unavailable and `manual` for manual runs. |
| `status` | string | Must be one of the V0 statuses. |
| `project` | string | Non-empty project, repo, workspace, or initiative name. |
| `created` | timestamp | ISO 8601 timestamp with timezone offset or `Z`. |
| `updated` | timestamp | ISO 8601 timestamp with timezone offset or `Z`. Must not be earlier than `created`. |
| `check` | timestamp or null | Required key. Active statuses require a timestamp. `parked` and `done` may use `null`. |
| `next_action` | string | Non-empty concise next action. For `done`, use a completion statement such as `No action - completed`. |
| `human_owner` | string | Non-empty person, team, or handle responsible for direction or review. |
| `source_thread` | string or null | URL, local reference, or provider thread reference. May be `null` when unavailable. |
| `artifacts` | list of strings | Required list. Use `[]` when there are no artifacts yet. Values may be relative paths, absolute paths, URLs, or stable references. |

## Timestamp Rules

Timestamps should be ISO 8601 values with timezone information:

```text
2026-05-24T16:20:00-04:00
2026-05-24T20:20:00Z
```

Date-only values are not valid for `created`, `updated`, or `check`. A linter should warn when timestamps are implausibly in the future, but future `check` values are expected for active runs.

## Provider Values

V0 known providers:

- `codex`
- `claude-code`
- `chatgpt`
- `cursor`
- `manus`
- `manual`

Provider values must be lowercase kebab-case. Unknown provider values that match the format are allowed with a warning so future providers can be tracked before adapter support exists.

Examples:

- `provider: codex` is valid.
- `provider: claude-code` is valid.
- `provider: local-agent` is valid with an unknown-provider warning.
- `provider: Claude Code` is invalid because it is not canonical kebab-case.

## Status Values

| Status | Active | Meaning | `check` rule |
| --- | --- | --- | --- |
| `queued` | Yes | Captured but not started. | Must be a timestamp. Past values warn as overdue. |
| `running` | Yes | Actively in progress. | Must be a timestamp. Past values warn as overdue. |
| `needs-review` | Yes | Output exists and needs human inspection. | Must be a timestamp. Past values warn as overdue. |
| `needs-redirect` | Yes | Needs a new prompt, changed scope, or strategic decision. | Must be a timestamp. Past values warn as overdue. |
| `blocked` | Yes | Cannot proceed without an external dependency or decision. | Must be a revisit timestamp. Past values warn as overdue. |
| `parked` | No | Intentionally paused. | May be `null`; if present, it is a planned revisit time. |
| `done` | No | Completed and no longer active. | Should be `null`. |

Detailed transition rules are defined in [Status Transitions](status-transitions.md). Schema validation should enforce that `status` is one of these values before any transition rules are applied.

## Required Body Sections

Run notes must include these `##` headings in this exact order:

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

Section expectations:

| Section | Expected content |
| --- | --- |
| `Objective` | The intended outcome of the run. |
| `Prompt` | Original prompt, prompt summary, or `Redacted` with a reason. |
| `Current State` | What is true right now, including partial progress or blockers. |
| `Result / Output` | Final or interim output. Use `Pending` while active. |
| `Next Action` | Expanded next action. Should agree with frontmatter `next_action`. |
| `Artifacts` | Human-readable artifact list. Should include the frontmatter artifact values when any exist. |
| `Timeline` | Append-only timestamped events. Must have at least one entry. |
| `Handoff Notes` | Context, cautions, and continuation guidance for the next human or agent. |

Timeline entries should use this form:

```md
- 2026-05-24T16:20:00-04:00 - Updated schema lint rules.
```

## Extension Fields

Custom frontmatter fields are allowed so teams can adapt AgentViz without forking the schema.

Rules:

- Core tools must preserve unknown fields when updating a note.
- Custom fields should use an `x_` prefix, such as `x_priority` or `x_repo`.
- Unknown fields without an `x_` prefix should lint as warnings, not errors.
- Custom fields must not change the meaning of required core fields.

## Lint Semantics

AgentViz linting should use three severities:

- `error`: the registry cannot be trusted until fixed.
- `warning`: the registry can be read, but the run may be stale, ambiguous, or non-canonical.
- `info`: style or maintainability guidance.

### Errors

| Code | Rule |
| --- | --- |
| `E001` | Run file has no YAML frontmatter. |
| `E002` | YAML frontmatter cannot be parsed. |
| `E010` | Required frontmatter key is missing. |
| `E011` | `type` is not `agent-run`. |
| `E012` | `status` is not one of the V0 statuses. |
| `E013` | `id` does not match the required format. |
| `E014` | Duplicate `id` exists in the registry. |
| `E015` | Run filename stem does not match frontmatter `id`. |
| `E020` | Timestamp field is malformed or date-only. |
| `E021` | `updated` is earlier than `created`. |
| `E030` | Required body heading is missing or out of order. |
| `E031` | `artifacts` is not a list of strings. |
| `E032` | Required scalar field is empty where `null` is not allowed. |

### Warnings

| Code | Rule |
| --- | --- |
| `W100` | `provider` is valid kebab-case but not a known V0 provider. |
| `W101` | Unknown frontmatter field does not use the `x_` prefix. |
| `W110` | Active run has `check: null` or missing check value. |
| `W111` | Active run has a `check` timestamp in the past. |
| `W112` | Active run has placeholder `next_action`, such as `TBD`, `none`, or `n/a`. |
| `W113` | `done` run has a non-null `check`. |
| `W120` | `source_thread` is `null` or a placeholder for a provider run. |
| `W130` | Run file is not linked from `agents/index.md`. |
| `W140` | `Timeline` section is empty or has entries without timestamps. |
| `W150` | Body `Next Action` appears to disagree with frontmatter `next_action`. |
| `W160` | Status transition is suspicious but recoverable. |
| `W161` | `done` run appears to have been reopened without an explicit reason in the timeline. |
| `W162` | `needs-review` run has neither artifacts nor a meaningful `Result / Output` summary. |
| `W163` | `blocked` run does not name a blocker in `Current State` or `Handoff Notes`. |
| `W164` | `parked` run does not explain what would make it worth resuming. |
| `W165` | `done` run still has `Result / Output` set to `Pending`. |

### Info

| Code | Rule |
| --- | --- |
| `I200` | Filename does not use the recommended date-provider-project pattern. |
| `I210` | Artifacts are listed in the body but not in frontmatter. |
| `I220` | Run note has extra `##` sections beyond the required set. |

## Fixture Matrix

Issue #3 should create fixtures based on this matrix.

| Fixture path | Purpose | Expected lint |
| --- | --- | --- |
| `fixtures/valid/codex-running.md` | Known provider active run with all required fields. | No findings. |
| `fixtures/valid/claude-code-needs-review.md` | Review state with artifacts and source thread. | No findings. |
| `fixtures/valid/manual-parked.md` | Manual parked run with `check: null`. | No findings. |
| `fixtures/valid/chatgpt-done.md` | Completed provider run with `check: null`. | No findings. |
| `fixtures/warnings/unknown-provider.md` | Valid custom provider. | `W100`. |
| `fixtures/warnings/active-check-overdue.md` | Active run with past check time. | `W111`. |
| `fixtures/warnings/index-missing-link.md` | Valid run omitted from dashboard. | `W130`. |
| `fixtures/errors/bad-status.md` | Invalid status. | `E012`. |
| `fixtures/errors/missing-heading.md` | Missing required body section. | `E030`. |
| `fixtures/errors/artifacts-scalar.md` | `artifacts` is a scalar. | `E031`. |
| `fixtures/errors/duplicate-id-a.md` and `fixtures/errors/duplicate-id-b.md` | Duplicate ids across files. | `E014`. |

## JSON Export Guidance

JSON export is derived data. The Markdown registry remains canonical.

The eventual export should include:

- normalized frontmatter,
- parsed body sections,
- source file path,
- lint findings,
- registry metadata,
- preserved custom fields.

The export shape will be designed in issue #6.
