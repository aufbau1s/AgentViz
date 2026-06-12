# Local UI Information Architecture

Status: V0 draft.

The AgentViz local UI is a lightweight visual command center for an AgentViz Markdown workspace. It should help a power user scan active agent work, identify what needs attention, inspect run details, and jump back to the source Markdown.

V0 UI is read-only. Markdown remains the source of truth, and CLI-generated JSON is the UI's data input.

## Product Role

The UI should answer five questions quickly:

- What agent runs are active right now?
- Which runs need review, redirect, or unblocking?
- Which checks are overdue?
- What changed recently?
- What does this run need next?

It should not execute agents, edit provider state, or replace the Markdown files.

## Data Source

V0 UI should consume `agentviz export --json <workspace>` output using the `agentviz-export-v0` contract.

Primary data source:

- `agentviz-export-v0` JSON

Source-of-truth fallback:

- Markdown files referenced by `runs[].sourcePath` and `runs[].sourceAbsolutePath`

The UI should not re-parse Markdown independently in V0. Parsing, validation, and normalization belong to the CLI/export layer so CLI, UI, and tests share one interpretation of the registry.

## App Shell

The first screen should be the command center, not a landing page.

Recommended layout:

- Top bar: workspace name/path, generated timestamp, summary counts, refresh action.
- Left filter rail or compact toolbar: status, provider, project, finding severity.
- Main view: board or timeline depending on selected tab.
- Detail panel/page: selected run detail rendered from JSON sections.

Primary tabs:

- `Board`
- `Timeline`
- `Warnings`

V0 can default to `Board`.

## Board View

Board columns map directly to V0 statuses:

- `queued`
- `running`
- `needs-review`
- `needs-redirect`
- `blocked`
- `parked`
- `done`

Column order should match workflow attention, not alphabetical order:

```text
queued -> running -> needs-review -> needs-redirect -> blocked -> parked -> done
```

### Column Behavior

- Show a count in each column header.
- Keep empty columns visible so the full workflow is understandable.
- Visually emphasize active attention states: `needs-review`, `needs-redirect`, and `blocked`.
- Keep `done` visually quieter but still visible for recent completion context.

### Card Content

Each run card should show:

- Run title, derived from the Markdown `#` title if available later, otherwise `frontmatter.id`.
- `provider`
- `project`
- `model` only when space allows.
- `next_action`
- `check`
- finding severity badges or count.
- artifact count.
- updated timestamp.

Minimum card fields for compact layouts:

- id or title,
- provider,
- project,
- next action,
- check,
- highest finding severity.

Cards should not show long prompt text. Prompt belongs in the detail view.

### Card Sorting

Within each status column:

1. Runs with errors.
2. Runs with warnings.
3. Earliest `check` timestamp.
4. Most recently updated.

`done` may sort by most recently updated first.

## Timeline View

Timeline view should show recent activity across runs.

V0 timeline entries can be derived from each run's parsed `Timeline` section in `runs[].sections.Timeline`.

Each timeline item should show:

- event timestamp,
- run id or title,
- status,
- provider,
- project,
- event text,
- finding badges when the run has findings,
- link to run detail.

Timeline grouping:

- Today/recent relative grouping can come later.
- V0 can group by date extracted from ISO timestamps.

Sorting:

- Newest timestamp first.
- Entries without parseable timestamps appear at the bottom with a warning state.

## Warnings View

Warnings view is a triage table for lint findings.

Rows should show:

- severity,
- finding code,
- message,
- run id when available,
- source path,
- provider and status when the finding belongs to a run.

Default grouping:

1. Errors.
2. Warnings.
3. Info.

Finding rows should link to run detail and expose the source Markdown path.

## Filters

V0 filters should be simple and composable.

Required filters:

- Status
- Provider
- Project
- Finding severity

Helpful but optional filters:

- Has artifacts
- Overdue check
- Human owner
- Text search across id, project, provider, next action, and current state

Filter behavior:

- Filters apply to board, timeline, and warnings where relevant.
- Filter state should be visible and easy to clear.
- Provider/project options should be generated from the loaded export, not hard-coded.

## Warning Presentation

Warnings should be visible without overwhelming the board.

Recommended severity treatment:

- `error`: prominent red badge and card outline/accent.
- `warning`: amber badge or count.
- `info`: quiet neutral badge.

Board cards should show:

- highest severity,
- total finding count,
- finding code list on hover or in detail.

Detail view should show full finding messages near the top of the run.

The UI should never hide runs with errors. Broken registry data is exactly what the UI needs to surface.

## Run Detail View

Run detail should be optimized for handoff.

Recommended sections:

1. Header
2. Findings
3. Next Action
4. Current State
5. Result / Output
6. Artifacts
7. Timeline
8. Prompt
9. Handoff Notes
10. Frontmatter
11. Source

### Header

Header should show:

- id or title,
- status,
- provider,
- project,
- model,
- human owner,
- updated,
- check.

### Findings

Show all `runs[].findings` for this run, grouped by severity.

Each finding should show:

- code,
- severity,
- message,
- source path.

### Markdown Sections

Render parsed sections from `runs[].sections`.

Use `sectionOrder` to preserve source order when showing all sections. The detail layout can promote important sections while still offering a full source-order view.

### Artifacts

Show artifacts from `frontmatter.artifacts`.

V0 artifact display:

- relative paths as file references,
- URLs as links,
- plain references as text.

### Source

Source area should show:

- `sourcePath`,
- `sourceAbsolutePath`,
- a copy/open affordance when the runtime supports it.

The UI should make clear that edits should happen in Markdown, not in the read-only UI.

## Empty and Error States

Empty workspace:

- Show that no runs were found.
- Show the expected `agents/runs/` location.
- Suggest `agentviz init` or creating a run note.

Invalid export:

- Show schema/version mismatch.
- Do not attempt partial rendering when `schemaVersion` is unsupported.

Registry errors:

- Render whatever runs can be parsed.
- Show top-level errors prominently.
- Avoid crashing because one run note is malformed.

## Data Mapping

| UI need              | JSON field                                       | Markdown source               |
| -------------------- | ------------------------------------------------ | ----------------------------- |
| Board columns        | `runs[].frontmatter.status`                      | Run frontmatter `status`      |
| Provider filter      | `runs[].frontmatter.provider`                    | Run frontmatter `provider`    |
| Project filter       | `runs[].frontmatter.project`                     | Run frontmatter `project`     |
| Card next action     | `runs[].frontmatter.next_action`                 | Run frontmatter `next_action` |
| Card check time      | `runs[].frontmatter.check`                       | Run frontmatter `check`       |
| Detail current state | `runs[].sections["Current State"]`               | `## Current State`            |
| Detail result        | `runs[].sections["Result / Output"]`             | `## Result / Output`          |
| Detail prompt        | `runs[].sections.Prompt`                         | `## Prompt`                   |
| Detail handoff       | `runs[].sections["Handoff Notes"]`               | `## Handoff Notes`            |
| Timeline             | `runs[].sections.Timeline`                       | `## Timeline`                 |
| Warnings             | `findings`, `runs[].findings`                    | CLI validation of Markdown    |
| Source links         | `runs[].sourcePath`, `runs[].sourceAbsolutePath` | `agents/runs/{id}.md`         |

## V0 Non-Goals

- Editing run notes in the UI.
- Drag-and-drop status changes.
- Provider API calls.
- Agent execution.
- Multi-user collaboration.
- Hosted sync.
- Persisted UI database.

These can be revisited once the read-only local visualizer feels useful.

## Open Implementation Questions

- Whether the UI is served by the CLI or opened as a static build that reads a generated JSON file.
- How refresh should work for a local workspace.
- Whether source file open/copy behavior should be CLI-assisted for browser security reasons.
- How much Markdown rendering is needed for V0 versus plain section text.
