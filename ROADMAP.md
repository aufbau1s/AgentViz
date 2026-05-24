# Roadmap

AgentViz will be built in small, testable slices. The early roadmap intentionally favors schema clarity and Markdown durability over UI breadth.

## M0: Project Foundation

Goal: make the repository understandable and contributor-ready before implementation starts.

- Publish the project vision and non-goals.
- Document the architecture direction.
- Add contribution, security, and community files.
- Create GitHub issue and pull request templates.
- Record the first architecture decision: Markdown is the source of truth.

## M1: Markdown Registry Contract

Goal: define the durable file format that humans, CLIs, UIs, and LLMs can all maintain.

- Define required frontmatter fields.
- Define supported statuses.
- Define required run-note headings.
- Draft `agents/schema.md` as the LLM operating contract.
- Create fixture workspaces for Codex, Claude Code, manual, and mixed-provider runs.
- Define lint rules for missing checks, stale runs, missing next actions, invalid statuses, and malformed artifacts.

## M2: CLI Core

Goal: make the Markdown registry usable from the terminal.

- Implement `agentviz init`.
- Implement `agentviz new`.
- Implement `agentviz status`.
- Parse Markdown frontmatter and required body sections.
- Validate schema rules against fixture workspaces.
- Add tests for frontmatter parsing and status rendering.

## M3: Lint, Transitions, and Export

Goal: make the registry trustworthy and machine-readable.

- Implement `agentviz lint`.
- Implement `agentviz park`.
- Implement `agentviz done`.
- Implement `agentviz export --json`.
- Define status transition behavior.
- Add JSON export tests.
- Add CLI acceptance tests for common workflows.

## M4: Local UI

Goal: visualize the same Markdown registry without replacing it.

- Render a Kanban-style board by status.
- Render a timeline of activity.
- Add provider and project filters.
- Show missing check and missing next action warnings.
- Open a Markdown-rendered run detail view.
- Add UI smoke tests against fixture Markdown.

## M5: Dogfood v0.1

Goal: use AgentViz to manage AgentViz work.

- Track AgentViz's own implementation runs in an `agents/` workspace.
- Publish screenshots or a short demo.
- Document Codex, Claude Code, ChatGPT, Cursor, Manus, and manual workflows.
- Tag `v0.1.0`.

## Deferred Until After V0

- Direct transcript import.
- Provider API integrations.
- Hosted sync.
- Multi-user collaboration features.
- Agent execution or orchestration.
- Proprietary storage backends.
