---
id: 2026-05-24-codex-overdue-check
type: agent-run
provider: codex
model: gpt-5
status: running
project: AgentViz
created: 2026-05-24T14:00:00-04:00
updated: 2026-05-24T14:30:00-04:00
check: 2026-05-24T15:00:00-04:00
next_action: Follow up on overdue active run
human_owner: aufbau1s
source_thread: codex:fixture-overdue
artifacts: []
---

# Overdue Codex Run

## Objective

Demonstrate the overdue active-check warning.

## Prompt

Create a valid active run whose check time is before the fixture clock.

## Current State

The run is still marked active, but the check time is overdue relative to the fixture clock.

## Result / Output

Pending.

## Next Action

Follow up on overdue active run.

## Artifacts

None yet.

## Timeline

- 2026-05-24T14:00:00-04:00 - Created run.
- 2026-05-24T14:30:00-04:00 - Left the run active with a check time before the fixture clock.

## Handoff Notes

The expected warning is `W111`.
