# 0001: Markdown as the Source of Truth

## Status

Accepted

## Context

AgentViz needs to track agent runs across multiple providers without depending on any provider API or hosted service. The first users are expected to be comfortable with Git and Markdown, and the registry should remain useful even if the CLI or UI is unavailable.

## Decision

AgentViz will use Markdown files with YAML frontmatter as the canonical backend.

The CLI, local UI, JSON export, and future provider adapters will all read from and write to the Markdown registry. JSON exports may be generated for integrations, but JSON will not be the primary database.

## Consequences

Positive:

- Human-readable state.
- Git-friendly review and history.
- Easy for LLMs to read and update.
- No required database.
- No required hosted service.
- Portable across editors and note-taking tools.

Tradeoffs:

- The project must handle malformed Markdown gracefully.
- Concurrency and merge conflicts are delegated mostly to Git.
- Query performance may require indexing later.
- Schema evolution needs careful migration guidance.

## Alternatives Considered

### SQLite

SQLite would provide stronger querying and transactional behavior, but would make direct LLM and human maintenance less transparent.

### JSON or YAML Database

Structured files would be machine-friendly, but less pleasant as living notes and handoff documents.

### Hosted Backend

A hosted backend could support collaboration, but conflicts with the local-first V0 goal and raises trust, cost, and availability concerns.
