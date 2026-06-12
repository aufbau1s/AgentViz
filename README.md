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

AgentViz is in early implementation mode. The Markdown registry contract, MVP CLI path, JSON export contract, and local UI information architecture are drafted.

Current focus:

- Dogfood AgentViz with the repo-root `agents/` workspace.
- Use the CLI to lint and export the committed registry.
- Turn the local UI information architecture into a first read-only MVP.
- Prepare the v0.1 release checklist from real dogfood output.

## Local Development

AgentViz uses TypeScript on Node.js. Use Node.js 20 or newer.

```sh
npm install
npm run verify
```

Run the development CLI with:

```sh
npm run dev -- --help
```

The verification command runs formatting, linting, typechecking, unit tests, build, and built-CLI smoke tests.

## MVP CLI

Initialize a workspace:

```sh
npm run dev -- init ./my-workspace
```

Show run status:

```sh
npm run dev -- status fixtures/valid/basic-workspace
```

When warnings exist, `agentviz status` surfaces an `Attention` block for overdue checks and next-action issues before the grouped status list.

Validate a workspace:

```sh
npm run dev -- lint fixtures/valid/basic-workspace
```

Export machine-readable JSON:

```sh
npm run dev -- export --json fixtures/valid/basic-workspace
```

Inspect this repo's dogfood workspace:

```sh
npm run dev -- status .
npm run dev -- lint .
npm run dev -- export --json .
```

Canonical workspace layout:

```text
agents/
  index.md
  schema.md
  log.md
  runs/
    example-run.md
```

## Planned V0 Interfaces

Additional planned CLI commands:

- `agentviz new`
- `agentviz park`
- `agentviz done`

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
- [JSON export](docs/json-export.md)
- [Local UI information architecture](docs/local-ui.md)
- [Dogfooding workflow](docs/dogfooding.md)
- [Workspace contract template](templates/agents/schema.md)
- [Repo dogfood dashboard](agents/index.md)
- [Fixtures](fixtures/README.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## License

AgentViz is licensed under the [Apache License 2.0](LICENSE).
