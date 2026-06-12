# 0005: JSON Export Is Derived Data

## Status

Accepted

## Context

AgentViz needs a machine-readable output for the local UI, downstream scripts, tests, and future integrations. The project also commits to Markdown as the canonical backend, so any generated format must avoid becoming a second source of truth.

## Decision

AgentViz will provide a generated JSON export with `schemaVersion: agentviz-export-v0`.

The export will include:

- generator metadata,
- source registry metadata,
- aggregate summary counts,
- one normalized run object per Markdown run note,
- workspace-relative and absolute source file paths,
- normalized frontmatter with custom fields preserved,
- parsed Markdown sections,
- section order,
- top-level findings,
- per-run findings.

The JSON export is always derived from Markdown. It may be regenerated at any time and should not be edited as the canonical record.

## Consequences

Positive:

- UI and integration code can consume a stable shape.
- The CLI can test export behavior against existing fixtures.
- Consumers get both normalized data and source paths back to the Markdown files.
- Findings are available globally and per run.

Tradeoffs:

- The export duplicates information from Markdown.
- Absolute paths are useful locally but not portable.
- Future schema changes must be versioned carefully.

## Alternatives Considered

### Raw Parser Dump

Dumping internal parser objects would be faster to implement, but would expose implementation details and make future refactors harder.

### JSON as a Cache File

Writing a cache file could speed up UI startup later, but it would add lifecycle questions before the UI exists. V0 emits JSON to stdout and treats persistence as the caller's choice.

### JSON as the Database

Using JSON as the canonical store would be simpler for machines, but it conflicts with the core AgentViz principle that Markdown remains human-readable, Git-friendly, and LLM-maintainable.
