# 0002: V0 Run Schema Constraints

## Status

Accepted

## Context

AgentViz needs a Markdown format that humans, LLMs, CLIs, UIs, and future provider importers can all use without a database. The schema must be forgiving enough for hand-maintained notes, but strict enough to support linting, status boards, timelines, and JSON export.

## Decision

V0 run notes will use one Markdown file per run in `agents/runs/{id}.md`.

Each run file must:

- begin with YAML frontmatter,
- include all required core frontmatter keys,
- use `type: agent-run`,
- use one of the V0 status values,
- use a filename stem that matches the frontmatter `id`,
- include the required body headings in order,
- keep artifacts as a simple list of strings,
- use ISO 8601 timestamps with timezone information.

The `check` key is always required, but `parked` and `done` runs may set `check: null`. Active runs must have a timestamp.

Unknown providers are allowed when they use lower-kebab format. They lint as warnings rather than errors so users can track future tools before AgentViz has formal adapter support.

Custom frontmatter fields are allowed. They should use an `x_` prefix, and core tools should preserve them.

## Consequences

Positive:

- The CLI and UI can rely on stable fields.
- Run files are easy to locate by id.
- Unknown providers do not block local use.
- Custom fields remain possible without fragmenting the core schema.
- Linting can distinguish broken data from merely non-canonical data.

Tradeoffs:

- Hand-authored notes must follow a stricter shape.
- Some useful artifact metadata is deferred because artifacts are strings in V0.
- Filename/id mismatches become schema errors.
- `check` is present even for inactive runs, where it may be `null`.

## Alternatives Considered

### Optional `check`

Making `check` optional would make inactive runs slightly cleaner, but would force clients to distinguish missing keys from intentionally absent values.

### Object Artifacts

Artifact objects could support labels, types, and descriptions, but they would make hand-authored notes and simple LLM updates more brittle in V0.

### Hard-Fail Unknown Providers

Rejecting unknown providers would keep dashboards tidy, but would undermine the provider-neutral goal and make future tools harder to track before formal support exists.
