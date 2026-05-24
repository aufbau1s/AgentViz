# AgentViz Workspace Contract

This `agents/` directory is the source of truth for tracked agent runs.

AgentViz tracks work across Codex, Claude Code, ChatGPT, Cursor, Manus, manual workflows, and future providers. It does not execute agents. It records state, handoffs, artifacts, and next actions in Markdown files with YAML frontmatter.

## Core Rules

- Treat Markdown files as canonical.
- Preserve human edits.
- Preserve unknown frontmatter fields.
- Do not invent status values.
- Do not delete timeline history.
- Do not mark work `done` unless no further action is expected.
- Every meaningful update must change `updated` and append a `Timeline` entry.
- Every active run must have a concrete `next_action` and `check`.

## Registry Layout

- `agents/index.md`: active dashboard and links to run notes.
- `agents/schema.md`: this operating contract.
- `agents/log.md`: append-only registry maintenance log.
- `agents/runs/{id}.md`: one note per run.

Run filenames must match the frontmatter `id`.

## Required Frontmatter

Each run note must include:

```yaml
---
id: 2026-05-24-codex-example-run
type: agent-run
provider: codex
model: gpt-5
status: running
project: Example Project
created: 2026-05-24T16:00:00-04:00
updated: 2026-05-24T16:30:00-04:00
check: 2026-05-24T17:00:00-04:00
next_action: Finish the schema draft
human_owner: aufbau1s
source_thread: https://example.com/thread-or-local-reference
artifacts:
  - docs/schema-contract.md
---
```

Required keys:

- `id`
- `type: agent-run`
- `provider`
- `model`
- `status`
- `project`
- `created`
- `updated`
- `check`
- `next_action`
- `human_owner`
- `source_thread`
- `artifacts`

Use ISO 8601 timestamps with timezone information, such as `2026-05-24T16:30:00-04:00` or `2026-05-24T20:30:00Z`.

Use `artifacts: []` when there are no artifacts yet.

## Providers

Known providers:

- `codex`
- `claude-code`
- `chatgpt`
- `cursor`
- `manus`
- `manual`

Unknown providers are allowed if they are lowercase kebab-case, such as `local-agent`.

## Statuses

Use statuses to describe what attention the run needs next.

- `queued`: captured but not started.
- `running`: can continue without new direction.
- `needs-review`: output exists and needs human review.
- `needs-redirect`: needs a new prompt, scope change, clarification, or strategic decision.
- `blocked`: cannot proceed because of an external dependency or missing condition.
- `parked`: intentionally paused.
- `done`: complete; no further action expected.

## Required Run Sections

Every run note must contain these `##` headings in order:

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

Do not add extra `##` sections. Use `###` headings inside required sections if more structure is needed.

## Creating a Run

When creating a run:

1. Create `agents/runs/{id}.md`.
2. Use `type: agent-run`.
3. Choose the most accurate provider.
4. Set `status` to `queued` or `running`.
5. Set `created`, `updated`, and `check` with ISO 8601 timestamps.
6. Write a concrete `next_action`.
7. Add the first `Timeline` entry.
8. Link the run from `agents/index.md`.

## Updating a Run

When updating a run:

1. Read the full run note first.
2. Update only fields and sections related to the actual change.
3. Update `updated`.
4. Update `status` if the next attention state changed.
5. Update `check` and `next_action`.
6. Append a timestamped `Timeline` entry.
7. Add artifacts when files, links, or outputs matter.
8. Leave handoff notes when another human or agent may continue the work.

## Status Changes

Every status change should update:

- `status`
- `updated`
- `check`
- `next_action`
- `Current State`
- `Next Action`
- `Timeline`

Use this timeline format:

```md
- 2026-05-24T17:30:00-04:00 - Status changed from `running` to `needs-review`: schema draft is ready for review.
```

## Status Guidance

Use `queued` when work is captured but not started. Set a concrete start or assignment action.

Use `running` when the run can continue without a new decision. Do not use it when output is waiting for review.

Use `needs-review` when output exists and a human needs to inspect it. List artifacts or summarize the output.

Use `needs-redirect` when the next step is a changed prompt, scope adjustment, clarification, or strategic decision.

Use `blocked` when an external dependency or missing condition prevents progress. Name the blocker and who or what can unblock it.

Use `parked` when the run is intentionally paused. Explain what would make it worth resuming. `check` may be `null`.

Use `done` only when no further action is expected. Set `check: null`, make sure `Result / Output` is not `Pending`, and use a completion statement for `next_action`.

## Handoff Checklist

Before leaving a run active, make sure:

- The current state is clear.
- The next action is specific.
- The check time is present.
- Blockers are named.
- Artifacts are listed when they matter.
- The timeline explains what changed.
- Handoff notes contain enough context for the next person or agent.

## Done Checklist

Before marking a run `done`:

- Set `check: null`.
- Set `next_action` to a completion statement.
- Make sure `Result / Output` is not `Pending`.
- Append a final timeline entry.
- Leave useful handoff notes if the result affects future work.

## Lint Self-Check

Before ending work, check for these common problems:

- Missing required frontmatter.
- Invalid status.
- Filename and `id` mismatch.
- Missing required headings.
- Active run without `check`.
- Active run without concrete `next_action`.
- Empty or malformed `artifacts`.
- Empty `Timeline`.
- Missing link from `agents/index.md`.

If the registry has a conflict between this file and local human instructions, follow the more specific local human instruction and record the decision in the run timeline.
