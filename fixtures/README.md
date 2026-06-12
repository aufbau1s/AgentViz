# Fixtures

These fixtures are small AgentViz workspaces for future parser, linter, export, and UI smoke tests.

Use this fixed clock when evaluating time-sensitive lint rules:

```text
FIXTURE_NOW=2026-05-24T16:00:00-04:00
```

That keeps active checks deterministic. A run with `check: 2026-05-24T18:00:00-04:00` is valid relative to the fixture clock, while a run with `check: 2026-05-24T15:00:00-04:00` is intentionally overdue.

## Fixture Workspaces

| Path                                     | Purpose                                                                              | Expected result                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `fixtures/valid/basic-workspace`         | Valid registry covering Codex, Claude Code, ChatGPT, Cursor, Manus, and manual runs. | No findings.                                                                   |
| `fixtures/warnings/unknown-provider`     | Valid custom provider value.                                                         | `W100`.                                                                        |
| `fixtures/warnings/active-check-overdue` | Active run with an overdue `check`.                                                  | `W111`.                                                                        |
| `fixtures/warnings/index-missing-link`   | Valid run omitted from `agents/index.md`.                                            | `W130`.                                                                        |
| `fixtures/errors/bad-status`             | Run uses an invalid status.                                                          | `E012`.                                                                        |
| `fixtures/errors/missing-heading`        | Run is missing a required body heading.                                              | `E030`.                                                                        |
| `fixtures/errors/artifacts-scalar`       | Run has scalar `artifacts` instead of a list.                                        | `E031`.                                                                        |
| `fixtures/errors/duplicate-id`           | Two files share one run id.                                                          | `E014`, plus `E015` for the copy whose filename cannot match the duplicate id. |

## Notes

- Fixtures are intentionally small enough to review by hand.
- Each workspace has its own `agents/index.md`, `agents/schema.md`, `agents/log.md`, and `agents/runs/` directory.
- `agents/schema.md` files are short fixture-local pointers, not full copies of `templates/agents/schema.md`.
