# Security Policy

AgentViz is planned as a local-first tool that reads and writes Markdown files in user-controlled workspaces.

## Supported Versions

The project is pre-release. Security support will be defined before the first stable release.

## Reporting a Vulnerability

Until a dedicated private reporting channel is configured, please avoid posting sensitive vulnerability details in public issues. Instead, contact the maintainer through a private GitHub channel if available.

Useful reports include:

- affected version or commit,
- operating system,
- reproduction steps,
- expected and actual behavior,
- whether local files, secrets, or shell execution are involved.

## Security Goals

- Do not require hosted services for core functionality.
- Do not require paid or proprietary APIs for core functionality.
- Treat Markdown workspaces as user data.
- Avoid unexpected network access.
- Avoid executing untrusted Markdown content.
- Make destructive file operations explicit and recoverable.

## Non-Goals for V0

- Agent execution sandboxing.
- Hosted authentication.
- Cloud sync.
- Provider API token management.
