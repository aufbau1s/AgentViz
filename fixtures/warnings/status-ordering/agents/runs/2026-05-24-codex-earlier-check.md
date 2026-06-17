---
id: 2026-05-24-codex-earlier-check
type: agent-run
provider: codex
model: gpt-5
status: running
project: AgentViz
created: 2026-05-24T15:00:00-04:00
updated: 2026-05-24T15:35:00-04:00
check: 2026-05-24T17:00:00-04:00
next_action: Review the first pending parser note
human_owner: aufbau1s
source_thread: codex:fixture-earlier-check
artifacts: []
---

# Earlier Check Codex Run

## Objective

Demonstrate ordering of a healthy running run with the earlier upcoming check.

## Prompt

Create a running run whose next check is sooner than another healthy running run.

## Current State

The run is active and should appear before the later-check run when the status group is sorted.

## Result / Output

Pending.

## Next Action

Review the first pending parser note.

## Artifacts

None yet.

## Timeline

- 2026-05-24T15:00:00-04:00 - Created run.
- 2026-05-24T15:35:00-04:00 - Set the earlier future check time for the fixture.

## Handoff Notes

The expected order is after the overdue run and before the later-check run.
