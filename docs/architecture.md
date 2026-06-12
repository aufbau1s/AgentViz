# Architecture

AgentViz is designed around a plain Markdown registry. Everything else is a client of that registry.

```text
Markdown workspace
      |
      +-- CLI parser, validator, transitions, export
      |
      +-- Local UI board, timeline, filters, detail views
      |
      +-- Future provider import adapters
      |
      +-- LLM maintenance contract
```

## Source of Truth

The canonical backend is an `agents/` directory inside a user workspace:

```text
agents/
  index.md
  schema.md
  log.md
  runs/
    YYYYMMDD-provider-project-slug.md
```

The Markdown files are the primary database. Generated JSON is an export format, not the canonical store.

## Registry Files

### `agents/index.md`

Human-readable active dashboard. It should summarize current runs and link to run notes. It may be maintained by humans, the CLI, or LLMs.

### `agents/runs/*.md`

One file per agent run or thread. Each file contains YAML frontmatter plus fixed Markdown headings.

### `agents/schema.md`

The operating contract for humans and LLMs. It explains required fields, statuses, headings, update rules, lint rules, and handoff expectations. The future `agentviz init` command should create it from `templates/agents/schema.md`.

### `agents/log.md`

Append-only maintenance log for registry-level events. This should not replace per-run timelines.

## CLI Responsibilities

The CLI should:

- initialize the registry,
- create new run notes,
- list and summarize current status,
- validate schema compliance,
- manage common status transitions,
- export normalized JSON,
- avoid owning hidden state outside the Markdown registry.

## UI Responsibilities

The UI should:

- consume generated JSON from `agentviz export --json`,
- show a status board,
- show a timeline,
- filter by provider and project,
- highlight lint warnings,
- render run details from Markdown,
- avoid becoming the only way to understand the data.

The V0 UI information architecture is documented in [Local UI Information Architecture](local-ui.md).

## Future Adapter Responsibilities

Provider adapters may import transcripts, logs, or exported data into the same Markdown schema. They should not introduce provider-specific storage as a dependency for core behavior.

## Design Constraints

- Local-first by default.
- No required hosted service.
- No required proprietary database.
- No required paid API.
- Human-readable files.
- Git-friendly diffs.
- Provider-neutral schema.
