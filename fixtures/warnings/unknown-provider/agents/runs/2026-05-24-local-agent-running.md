---
id: 2026-05-24-local-agent-running
type: agent-run
provider: local-agent
model: local-agent-v0
status: running
project: AgentViz
created: 2026-05-24T15:10:00-04:00
updated: 2026-05-24T15:50:00-04:00
check: 2026-05-24T18:00:00-04:00
next_action: Finish local-provider smoke notes
human_owner: aufbau1s
source_thread: local-agent:fixture-unknown-provider
artifacts: []
---

# Local Agent Run

## Objective

Demonstrate that unknown lowercase providers are recoverable warnings.

## Prompt

Track a provider value that AgentViz does not know yet.

## Current State

The run is valid except for the unknown provider warning.

## Result / Output

Pending.

## Next Action

Finish local-provider smoke notes.

## Artifacts

None yet.

## Timeline

- 2026-05-24T15:10:00-04:00 - Created run with an unknown provider.

## Handoff Notes

The expected warning is `W100`.
