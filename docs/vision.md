# Vision

AgentViz exists to make agent work visible, durable, and handoff-friendly.

The first users are solo power users who already use Git, Markdown, terminals, editors, and multiple agent tools. They may have Codex working in one repo, Claude Code exploring another task, ChatGPT holding a planning thread, Cursor doing local edits, and a manual follow-up waiting in a notes app.

AgentViz gives those threads a shared, boring, trustworthy place to land.

## Core Belief

Agent work should not disappear into provider-specific chat histories.

The durable record should be:

- readable by humans,
- writable by LLMs,
- diffable in Git,
- useful without a server,
- portable across tools,
- resilient if the UI disappears.

## Product Shape

AgentViz is a registry and visualizer, not an executor.

It should answer questions like:

- What agent runs are active?
- Which runs are blocked?
- Which runs need human review?
- Which projects have stale agent work?
- What is the next action for this thread?
- What artifacts did this run produce?
- What does a future agent need to know before picking this up?

## Non-Goals

AgentViz does not aim to:

- launch agents,
- schedule agents,
- replace provider UIs,
- store canonical data in a proprietary database,
- require cloud sync,
- require paid APIs,
- hide state in an opaque binary format.

## Success Criteria for V0

V0 is successful if a power user can:

- initialize an `agents/` registry in a repo,
- create and update agent run notes,
- lint run notes for missing handoff data,
- see active work in a local UI,
- export the registry as JSON,
- hand the Markdown files to another LLM and get useful continuation.
