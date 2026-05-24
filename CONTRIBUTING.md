# Contributing

Thanks for helping shape AgentViz. The project is young, so design clarity matters as much as code.

## Project Principles

- Keep Markdown as the durable source of truth.
- Keep core functionality local-first and open-source.
- Prefer provider-neutral abstractions over provider-specific assumptions.
- Make every generated artifact readable and maintainable by humans.
- Treat the CLI, UI, and future adapters as clients of the same registry contract.

## Before Opening a Pull Request

1. Check the roadmap and open issues for the relevant milestone.
2. Keep changes focused on one project area when possible.
3. Include docs or fixtures when changing the schema.
4. Include tests when changing parsing, validation, status transitions, or export behavior.
5. Avoid adding required hosted services, paid APIs, or proprietary storage.

## Development Workflow

The implementation stack is not finalized yet. Until then, contribution work should focus on:

- schema proposals,
- fixtures,
- docs,
- architecture notes,
- issue refinement,
- CLI/runtime tradeoff analysis,
- UI information architecture.

Once implementation starts, this file will be updated with local setup, test, lint, and release commands.

## Architecture Decisions

Major decisions should be recorded in `docs/decisions/` as short ADRs. Include:

- context,
- decision,
- consequences,
- alternatives considered.

## Issue Triage

Use issue labels to keep work discoverable:

- `area:schema`
- `area:cli`
- `area:ui`
- `area:docs`
- `area:tests`
- `area:fixtures`
- `area:adapters`
- `type:feature`
- `type:bug`
- `type:docs`
- `type:research`

## License

By contributing to AgentViz, you agree that your contributions are licensed under the Apache License 2.0.
