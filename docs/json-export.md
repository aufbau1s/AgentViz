# JSON Export

Status: V0 draft.

AgentViz JSON export is derived data generated from the Markdown registry. It is meant for local UI views, downstream scripts, tests, and integrations that need a machine-readable snapshot.

Markdown remains the canonical backend. Do not treat JSON export as the database.

## Command

```sh
agentviz export --json <workspace>
```

For local development:

```sh
npm run dev -- export --json fixtures/valid/basic-workspace
```

The command writes formatted JSON to stdout.

## Top-Level Shape

```json
{
  "schemaVersion": "agentviz-export-v0",
  "generatedAt": "2026-06-12T00:00:00.000Z",
  "generator": {
    "name": "agentviz",
    "version": "0.0.0"
  },
  "source": {
    "kind": "markdown",
    "canonical": true,
    "workspaceRoot": "/absolute/path/to/workspace",
    "agentsDir": "agents"
  },
  "summary": {
    "runCount": 6,
    "findingCount": 0,
    "errorCount": 0,
    "warningCount": 0
  },
  "runs": [],
  "findings": []
}
```

## Top-Level Fields

| Field           | Type          | Meaning                                                 |
| --------------- | ------------- | ------------------------------------------------------- |
| `schemaVersion` | string        | Export schema identifier. V0 uses `agentviz-export-v0`. |
| `generatedAt`   | ISO timestamp | Time the export was generated.                          |
| `generator`     | object        | Tool metadata for the export producer.                  |
| `source`        | object        | Describes the canonical source registry.                |
| `summary`       | object        | Aggregate run and finding counts.                       |
| `runs`          | array         | Normalized run records parsed from Markdown notes.      |
| `findings`      | array         | Lint findings across the registry.                      |

## Source

```json
{
  "kind": "markdown",
  "canonical": true,
  "workspaceRoot": "/absolute/path/to/workspace",
  "agentsDir": "agents"
}
```

`source.canonical: true` means the Markdown workspace is the source of truth. The export can be regenerated and discarded.

## Run Shape

Each run contains normalized frontmatter, parsed Markdown sections, source paths, and per-run findings.

```json
{
  "id": "2026-05-24-codex-running",
  "sourcePath": "agents/runs/2026-05-24-codex-running.md",
  "sourceAbsolutePath": "/absolute/path/to/agents/runs/2026-05-24-codex-running.md",
  "frontmatter": {
    "id": "2026-05-24-codex-running",
    "type": "agent-run",
    "provider": "codex",
    "model": "gpt-5",
    "status": "running",
    "project": "AgentViz",
    "created": "2026-05-24T15:30:00-04:00",
    "updated": "2026-05-24T15:55:00-04:00",
    "check": "2026-05-24T18:00:00-04:00",
    "next_action": "Finish the parser outline",
    "human_owner": "aufbau1s",
    "source_thread": "codex:fixture-running",
    "artifacts": []
  },
  "sections": {
    "Objective": "Outline the first parser slice for AgentViz."
  },
  "sectionOrder": ["Objective", "Prompt"],
  "findings": []
}
```

### Run Fields

| Field                | Type         | Meaning                                                      |
| -------------------- | ------------ | ------------------------------------------------------------ |
| `id`                 | string       | Stable run id from frontmatter.                              |
| `sourcePath`         | string       | Workspace-relative Markdown source path with `/` separators. |
| `sourceAbsolutePath` | string       | Absolute Markdown source path for local tooling.             |
| `frontmatter`        | object       | Normalized frontmatter, including preserved custom fields.   |
| `sections`           | object       | Parsed Markdown `##` sections keyed by heading text.         |
| `sectionOrder`       | string array | Section headings in source order.                            |
| `findings`           | array        | Findings associated with this run.                           |

## Frontmatter Normalization

The `frontmatter` object includes all core schema keys:

- `id`
- `type`
- `provider`
- `model`
- `status`
- `project`
- `created`
- `updated`
- `check`
- `next_action`
- `human_owner`
- `source_thread`
- `artifacts`

Custom frontmatter fields are preserved after the core fields. Custom fields should use the `x_` prefix.

Malformed missing fields may appear as `null` or empty strings in export output so consumers can still inspect broken registries alongside lint findings.

## Findings

Findings appear at the top level and inside the run they belong to.

```json
{
  "code": "W100",
  "severity": "warning",
  "message": "Provider 'local-agent' is not a known V0 provider.",
  "runId": "2026-05-24-local-agent-running",
  "sourcePath": "agents/runs/2026-05-24-local-agent-running.md",
  "sourceAbsolutePath": "/absolute/path/to/agents/runs/2026-05-24-local-agent-running.md"
}
```

Top-level findings let tools scan the whole registry quickly. Per-run findings let UI detail views show local warnings without regrouping data.

## Path Rules

- `sourcePath` values are relative to `source.workspaceRoot`.
- `sourcePath` values use `/` separators on every platform.
- `sourceAbsolutePath` values are local-machine paths and may vary across users.
- Consumers should use `sourcePath` for stable comparisons and `sourceAbsolutePath` only for local file opening.

## Compatibility Rules

V0 consumers should:

- require `schemaVersion: "agentviz-export-v0"`,
- ignore unknown top-level fields,
- ignore unknown run fields,
- preserve the Markdown registry as the authority when export data conflicts with source files,
- treat lint findings as advisory unless their severity is `error`.

Future export schema changes should either remain backward-compatible or use a new `schemaVersion`.
