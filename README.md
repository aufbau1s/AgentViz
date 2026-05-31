# AgentViz

AgentViz is an open-source, local-first command center for tracking agent runs across Codex, Claude Code, ChatGPT, Cursor, Manus, manual workflows, and future providers.

The project is not an agent executor. It is a provider-neutral run registry, visualizer, linter, and handoff layer that uses plain Markdown with YAML frontmatter as the durable source of truth.

## Why

Power users are increasingly running multiple agent threads at once across different tools. Those threads produce useful work, but their state often gets scattered across chats, terminals, notes, browser tabs, and half-finished tasks.

AgentViz aims to make agent work inspectable, portable, and maintainable:

- Markdown is the database.
- Git is the sync and audit layer.
- The CLI maintains and validates the registry.
- The local UI visualizes active work.
- Any LLM can read and update the same files without a proprietary API.

## Project Status

AgentViz is in early implementation mode. The Markdown registry contract is drafted, and the current milestone is the V0 CLI core.

Current focus:

- Build the TypeScript CLI foundation.
- Parse and validate AgentViz Markdown workspaces.
- Implement `agentviz init`, `agentviz new`, and `agentviz status`.
- Keep future UI behavior aligned with the same registry model.

## Local Development

AgentViz uses TypeScript on Node.js. Use Node.js 20 or newer.

```sh
npm install
npm test
npm run lint
npm run format:check
npm run typecheck
npm run build
```

Run the development CLI with:

```sh
npm run dev -- --help
```

## Planned V0 Interfaces

Canonical workspace layout:

```text
agents/
  index.md
  schema.md
  log.md
  runs/
    example-run.md
```

Planned CLI:

```text
agentviz init
agentviz new
agentviz status
agentviz lint
agentviz park
agentviz done
agentviz export --json
```

Planned UI:

- Kanban-style status board.
- Timeline of agent activity.
- Provider and project filters.
- Lint warnings for missing checks and next actions.
- Markdown-rendered thread detail view.

## Documentation

- [Vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Schema contract](docs/schema-contract.md)
- [Status transitions](docs/status-transitions.md)
- [Workspace contract template](templates/agents/schema.md)
- [Fixtures](fixtures/README.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## License

AgentViz is licensed under the [Apache License 2.0](LICENSE).
