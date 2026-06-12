# Status Transitions

Status: V0 draft.

AgentViz statuses describe what attention a run needs next. They do not attempt to mirror every provider's internal execution state.

For example, a Codex thread may no longer be literally executing, but its AgentViz run can still be `running` if the next step is already clear and the run is expected to continue. A run should become `needs-review`, `needs-redirect`, `blocked`, `parked`, or `done` when the next human or agent action changes.

## Status Definitions

| Status           | Meaning                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `queued`         | Captured as work to start, but no agent or human has begun execution yet.                                                                   |
| `running`        | An agent or human is actively working, or the run is expected to continue without new direction.                                            |
| `needs-review`   | There is output to inspect before deciding whether it is accepted, revised, or continued.                                                   |
| `needs-redirect` | The run needs a new prompt, scope change, clarification, or strategic decision.                                                             |
| `blocked`        | The run cannot proceed because of an external dependency, missing access, failing command, unavailable information, or unresolved decision. |
| `parked`         | Intentionally paused. Not urgent, not active, and not necessarily failed.                                                                   |
| `done`           | Complete enough that no further action is expected for this run.                                                                            |

## Normal Transitions

These are the normal V0 transitions. Tools should allow them without override when the required update fields are supplied.

| From             | Allowed next statuses                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| `queued`         | `running`, `blocked`, `parked`, `done`                                           |
| `running`        | `needs-review`, `needs-redirect`, `blocked`, `parked`, `done`                    |
| `needs-review`   | `running`, `needs-redirect`, `blocked`, `parked`, `done`                         |
| `needs-redirect` | `running`, `blocked`, `parked`, `done`                                           |
| `blocked`        | `running`, `needs-redirect`, `parked`, `done`                                    |
| `parked`         | `queued`, `running`, `needs-redirect`, `done`                                    |
| `done`           | No normal transitions. Prefer creating a new run unless the close was a mistake. |

## Suspicious Transitions

Some transitions are readable but suspicious. Future tools may allow them with an explicit reason or override flag.

| Transition                   | Why suspicious                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `done` to any active status  | A completed run is expected to be terminal. Create a new run unless the original close was mistaken.                                   |
| `queued` to `needs-review`   | There should be output before review is needed. Use `running` first unless importing an already-complete provider thread.              |
| `queued` to `needs-redirect` | A run usually needs an initial attempt before redirect. Use this only when triage discovers the original prompt is unusable.           |
| `blocked` to `needs-review`  | A blocked run normally resumes or needs redirect before review. Use only when the blocker resolution produced reviewable output.       |
| `parked` to `blocked`        | A parked run should usually be resumed before becoming blocked. Use `needs-redirect` if the first action is to decide what to do next. |

Invalid statuses are schema errors, but suspicious transitions are lint warnings because the Markdown should remain recoverable.

## Required Transition Updates

Every status change should update both frontmatter and body content.

Required frontmatter updates:

- `status`
- `updated`
- `check`
- `next_action`

Required body updates:

- `Current State`
- `Next Action`
- `Timeline`

Conditional body updates:

- `Result / Output` when moving to `needs-review` or `done`.
- `Artifacts` when reviewable or final output exists.
- `Handoff Notes` when moving to `blocked`, `parked`, or `needs-redirect`.

Timeline entries should use this form:

```md
- 2026-05-24T17:30:00-04:00 - Status changed from `running` to `needs-review`: CLI schema draft is ready for human review.
```

The timeline entry should say what changed and why. Avoid entries that only repeat the new status.

## Status-Specific Rules

### `queued`

Use `queued` when the run is captured but not started.

Rules:

- `next_action` should usually begin with an action such as `Start`, `Assign`, `Review`, or `Prompt`.
- `check` must be a timestamp.
- `Current State` should say what is waiting to start.

### `running`

Use `running` when the run can continue without a new decision.

Rules:

- `next_action` must be concrete.
- `check` must be a timestamp.
- Do not use `running` when output is waiting for review.
- Do not use `running` when the agent needs a changed prompt or scope.

### `needs-review`

Use `needs-review` when output exists and a human needs to inspect it.

Rules:

- `Result / Output` should summarize the reviewable output.
- `Artifacts` should identify produced or changed files when any exist.
- `next_action` should name the review decision needed.
- Lint should warn when `needs-review` has no artifacts and no output summary.

### `needs-redirect`

Use `needs-redirect` when the next step is a new prompt, scope adjustment, clarification, or strategic decision.

Rules:

- `Current State` should explain why the current direction is no longer sufficient.
- `Next Action` should describe the decision or prompt change needed.
- `Handoff Notes` should include enough context for the next human or agent to redirect the work.
- This is different from `blocked`: the run can proceed once direction is clarified.

### `blocked`

Use `blocked` when the run cannot proceed because of an external dependency or missing condition.

Rules:

- `Current State` or `Handoff Notes` must name the blocker.
- `next_action` should say who or what can unblock it.
- `check` must be a revisit timestamp.
- Do not use `blocked` for ordinary uncertainty that can be solved with a better prompt; use `needs-redirect`.

### `parked`

Use `parked` when the run is intentionally paused.

Rules:

- `check` may be `null`.
- `next_action` should explain the pause, such as `No action - parked until CLI stack is chosen`.
- `Handoff Notes` should explain what would make the run worth resuming.
- Parking should not imply failure.

### `done`

Use `done` when no further action is expected for this run.

Rules:

- `check` should be `null`.
- `Result / Output` should not be `Pending`.
- `next_action` should be a completion statement, such as `No action - completed`.
- Reopening `done` should require an explicit reason. Prefer a new run for follow-up work.

## CLI Implications

These rules define future CLI behavior but do not require implementation yet.

### `agentviz park`

`agentviz park` should transition any non-`done` status to `parked`.

Expected behavior:

- require or generate a reason,
- set `status: parked`,
- set `check: null` unless a revisit time is provided,
- update `next_action`,
- append a timeline entry,
- update `Current State`, `Next Action`, and `Handoff Notes`.

### `agentviz done`

`agentviz done` should transition any status to `done`.

Expected behavior:

- set `status: done`,
- set `check: null`,
- set `next_action` to a completion statement,
- update `Result / Output`,
- append a timeline entry,
- warn if `Result / Output` is empty or still `Pending`,
- warn if there are unreviewed artifacts.

### Future Reopen Behavior

V0 does not need a `reopen` command. If one is added later, it should require a reason and should append a timeline entry explaining why the original completion was no longer accurate.

## Transition Lint Rules

The schema contract defines core lint severities. Transition-aware linting should add these findings:

| Code   | Severity | Rule                                                                                 |
| ------ | -------- | ------------------------------------------------------------------------------------ |
| `W160` | warning  | Status transition is suspicious but recoverable.                                     |
| `W161` | warning  | `done` run appears to have been reopened without an explicit reason in the timeline. |
| `W162` | warning  | `needs-review` run has neither artifacts nor a meaningful `Result / Output` summary. |
| `W163` | warning  | `blocked` run does not name a blocker in `Current State` or `Handoff Notes`.         |
| `W164` | warning  | `parked` run does not explain what would make it worth resuming.                     |
| `W165` | warning  | `done` run still has `Result / Output` set to `Pending`.                             |

Transition linting may require comparing the current run note to Git history or a generated registry log. When history is unavailable, tools should still apply the status-specific rules to the current file.
