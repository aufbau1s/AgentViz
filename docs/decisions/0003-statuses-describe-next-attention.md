# 0003: Statuses Describe Next Attention

## Status

Accepted

## Context

AgentViz tracks agent work across providers, local tools, and manual workflows. Provider execution state is not consistent across tools and may not be available at all. A useful local registry needs statuses that tell humans and LLMs what to do next, not just whether a remote process is currently running.

## Decision

AgentViz statuses describe the attention a run needs next.

For V0:

- `queued` means captured but not started.
- `running` means the run can continue without new direction.
- `needs-review` means output exists and needs human inspection.
- `needs-redirect` means the run needs a new prompt, scope change, clarification, or strategic decision.
- `blocked` means an external dependency or missing condition prevents progress.
- `parked` means intentionally paused.
- `done` means no further action is expected for this run.

Normal transitions are permissive for all non-terminal statuses, but `done` is treated as terminal. Reopening a completed run should require an explicit reason, and follow-up work should usually become a new run.

## Consequences

Positive:

- The board tells users what needs attention.
- The schema remains provider-neutral.
- Human-maintained and LLM-maintained notes use the same status model.
- Future CLI commands can update status, check time, next action, and timeline together.

Tradeoffs:

- `running` does not always mean a provider process is currently executing.
- Some suspicious transitions are allowed as warnings instead of rejected.
- Detecting historical transitions may require Git history or registry log context.

## Alternatives Considered

### Provider Execution State

Tracking provider execution state would be more literal, but many tools do not expose that state consistently. It would also make manual runs and imported transcripts second-class.

### Strict Finite State Machine

A strict transition graph would catch more mistakes, but it would make hand-maintained Markdown brittle. AgentViz should prefer readable recovery with lint warnings over blocking local users.
