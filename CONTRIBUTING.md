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

AgentViz uses TypeScript on Node.js for the V0 CLI and shared registry core.

Install dependencies and run the basic checks with:

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

Early implementation work should stay aligned with the documented registry contract and existing fixtures. Include tests when changing parsing, validation, status transitions, export behavior, or command behavior.

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
