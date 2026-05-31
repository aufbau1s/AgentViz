# 0004: TypeScript and Node.js for the V0 Stack

## Status

Accepted

## Context

AgentViz needs a first implementation stack for the CLI core and eventual local UI.

The V0 implementation needs to:

- parse Markdown files with YAML frontmatter,
- validate the registry schema against fixture workspaces,
- provide a cross-platform CLI,
- support tests for parser, lint, transition, and export behavior,
- preserve a clean path to a future local UI,
- remain easy for contributors to install and run locally.

The project should avoid adding a database, hosted service, or provider-specific runtime dependency. The Markdown registry remains the source of truth regardless of implementation language.

## Decision

AgentViz will use TypeScript on Node.js for the V0 CLI and shared registry core.

The first implementation should use a small package structure with reusable core modules:

- registry discovery,
- Markdown/frontmatter parsing,
- schema validation,
- lint finding generation,
- status rendering,
- JSON export.

The CLI should call into those core modules instead of embedding parsing and validation directly in command handlers. This keeps the future local UI able to reuse the same registry model rather than creating a second interpretation of AgentViz Markdown.

The initial package should prefer boring, widely used dependencies for:

- command parsing,
- YAML frontmatter parsing,
- Markdown section parsing,
- test execution,
- TypeScript builds.

The exact libraries may be selected during scaffolding, but the architecture should keep them behind local parser and command boundaries so they can be replaced without changing the public registry contract.

## Consequences

Positive:

- TypeScript gives the parser, linter, JSON export, CLI, and future UI a shared type model.
- Node.js has mature Markdown, YAML, CLI, and test tooling.
- The future local UI can reuse registry parsing and validation logic.
- Contributors can install and run the project with common JavaScript tooling.
- Cross-platform behavior is practical for Windows, macOS, and Linux.
- The stack fits the expected shape of a local CLI plus browser-based dashboard.

Tradeoffs:

- Users need Node.js installed for local development and CLI execution.
- npm package distribution has its own versioning and lockfile maintenance overhead.
- Single-file native binaries are not the default distribution path.
- Care is needed to keep command handlers thin and avoid coupling core registry logic to terminal output.

## Implementation Guidance

The M2 CLI core should start with the smallest useful surface:

- `agentviz init`
- `agentviz new`
- `agentviz status`
- parser and schema validation tests against `fixtures/`

The core model should represent:

- source file path,
- raw Markdown content,
- parsed frontmatter,
- parsed required sections,
- preserved unknown fields,
- lint findings.

Generated JSON should remain derived data. It should be produced from the same parsed registry model used by the CLI and future UI.

## Alternatives Considered

### Python

Python has strong text processing and test ergonomics, and it would be a reasonable CLI implementation language. It is deferred for V0 because sharing types and parsing behavior with a future browser-based local UI would require a second implementation boundary or generated schemas. Python packaging can also be uneven for casual cross-platform CLI users.

### Rust

Rust would provide strong binaries, performance, and reliability. It is deferred for V0 because AgentViz is currently schema-heavy rather than performance-bound, and Rust would raise the contribution bar while the product shape is still evolving.

### Separate CLI and UI Stacks

Using one stack for the CLI and another for the UI could optimize each surface independently. It is deferred because the highest-risk early behavior is not rendering or terminal UX; it is interpreting the Markdown registry consistently. V0 should avoid two parser implementations.

### Hosted or Database-Backed Stack

A hosted service or database-backed runtime could support richer collaboration and queries, but it conflicts with the local-first V0 goal. Markdown remains the canonical backend.
