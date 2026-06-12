# AgentViz Dashboard

This dashboard tracks the AgentViz project using AgentViz's own Markdown registry.

## Active Runs

| Status         | Run                                                                       | Provider | Project  | Next action                                                 |
| -------------- | ------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------------------- |
| `needs-review` | [Dogfood workspace](runs/2026-06-11-codex-agentviz-dogfood-workspace.md)  | `codex`  | AgentViz | Review and merge the dogfood workspace PR                   |
| `queued`       | [Local UI MVP](runs/2026-06-11-manual-agentviz-local-ui-mvp.md)           | `manual` | AgentViz | Open the first implementation issue for the local UI MVP    |
| `queued`       | [v0.1 release checklist](runs/2026-06-11-manual-agentviz-v0-1-release.md) | `manual` | AgentViz | Draft the v0.1 release checklist after dogfooding is merged |

## Completed Foundation Runs

| Status | Run                                                                                | Provider | Project  | Result                                     |
| ------ | ---------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------ |
| `done` | [MVP CLI vertical slice](runs/2026-06-11-codex-agentviz-mvp-cli.md)                | `codex`  | AgentViz | CLI init, status, lint, export, and verify |
| `done` | [JSON export contract](runs/2026-06-11-codex-agentviz-json-export-contract.md)     | `codex`  | AgentViz | Stable `agentviz-export-v0` contract       |
| `done` | [Local UI information architecture](runs/2026-06-11-codex-agentviz-local-ui-ia.md) | `codex`  | AgentViz | Read-only UI IA grounded in JSON export    |

## Maintenance Notes

- Keep public project-level planning runs in this committed `agents/` directory.
- Keep private transcripts, customer work, credentials, and local-only experiments outside the repo.
- Run `npm run dev -- lint .` before merging registry changes.
