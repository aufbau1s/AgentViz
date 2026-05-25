---
id: 2026-05-24-codex-bad-status
type: agent-run
provider: codex
model: gpt-5
status: reviewing
project: AgentViz
created: 2026-05-24T15:00:00-04:00
updated: 2026-05-24T15:20:00-04:00
check: 2026-05-24T18:00:00-04:00
next_action: Replace invalid status
human_owner: aufbau1s
source_thread: codex:fixture-bad-status
artifacts: []
---

# Bad Status Run

## Objective

Demonstrate invalid status detection.

## Prompt

Create a run note with a status value outside the V0 set.

## Current State

The frontmatter uses `reviewing`, which is not a valid AgentViz status.

## Result / Output

Pending.

## Next Action

Replace invalid status.

## Artifacts

None yet.

## Timeline

- 2026-05-24T15:00:00-04:00 - Created run with an invalid status.

## Handoff Notes

The expected error is `E012`.
