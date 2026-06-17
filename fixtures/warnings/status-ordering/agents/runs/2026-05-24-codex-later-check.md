---
id: 2026-05-24-codex-later-check
type: agent-run
provider: codex
model: gpt-5
status: running
project: AgentViz
created: 2026-05-24T15:05:00-04:00
updated: 2026-05-24T15:40:00-04:00
check: 2026-05-24T19:00:00-04:00
next_action: Finish the later parser draft
human_owner: aufbau1s
source_thread: codex:fixture-later-check
artifacts: []
---

# Later Check Codex Run

## Objective

Demonstrate ordering of a healthy running run with a later upcoming check.

## Prompt

Create a running run whose next check is later than another healthy running run.

## Current State

The run is active and should appear after the earlier-check run when the status group is sorted.

## Result / Output

Pending.

## Next Action

Finish the later parser draft.

## Artifacts

None yet.

## Timeline

- 2026-05-24T15:05:00-04:00 - Created run.
- 2026-05-24T15:40:00-04:00 - Set the later future check time for the fixture.

## Handoff Notes

The expected order is after the overdue run and the earlier-check run.
