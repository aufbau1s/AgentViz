---
id: 2026-05-24-claude-code-artifacts-scalar
type: agent-run
provider: claude-code
model: claude-sonnet-4
status: needs-review
project: AgentViz
created: 2026-05-24T15:00:00-04:00
updated: 2026-05-24T15:20:00-04:00
check: 2026-05-24T18:00:00-04:00
next_action: Convert artifacts to a list
human_owner: aufbau1s
source_thread: claude-code:fixture-artifacts-scalar
artifacts: docs/output.md
---

# Artifacts Scalar Run

## Objective

Demonstrate malformed artifact frontmatter.

## Prompt

Create a run note where `artifacts` is a scalar instead of a list.

## Current State

The frontmatter has `artifacts: docs/output.md`, but AgentViz expects a list of strings.

## Result / Output

The malformed artifact value is ready for linter detection.

## Next Action

Convert artifacts to a list.

## Artifacts

- docs/output.md

## Timeline

- 2026-05-24T15:00:00-04:00 - Created run with scalar artifact frontmatter.

## Handoff Notes

The expected error is `E031`.
