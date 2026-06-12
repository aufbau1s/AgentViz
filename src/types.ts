export const KNOWN_PROVIDERS = [
  "codex",
  "claude-code",
  "chatgpt",
  "cursor",
  "manus",
  "manual"
] as const;

export const STATUSES = [
  "queued",
  "running",
  "needs-review",
  "needs-redirect",
  "blocked",
  "parked",
  "done"
] as const;

export const ACTIVE_STATUSES = [
  "queued",
  "running",
  "needs-review",
  "needs-redirect",
  "blocked"
] as const;

export const REQUIRED_FRONTMATTER_KEYS = [
  "id",
  "type",
  "provider",
  "model",
  "status",
  "project",
  "created",
  "updated",
  "check",
  "next_action",
  "human_owner",
  "source_thread",
  "artifacts"
] as const;

export const REQUIRED_HEADINGS = [
  "Objective",
  "Prompt",
  "Current State",
  "Result / Output",
  "Next Action",
  "Artifacts",
  "Timeline",
  "Handoff Notes"
] as const;

export type KnownProvider = (typeof KNOWN_PROVIDERS)[number];
export type RunStatus = (typeof STATUSES)[number];
export type FindingSeverity = "error" | "warning" | "info";

export interface Finding {
  code: string;
  severity: FindingSeverity;
  message: string;
  file?: string;
  runId?: string;
}

export interface ParsedSection {
  heading: string;
  content: string;
}

export interface ParsedRunNote {
  sourcePath: string;
  filename: string;
  raw: string;
  frontmatterRaw: string;
  frontmatter: Record<string, unknown>;
  body: string;
  sections: ParsedSection[];
  sectionsByHeading: Map<string, ParsedSection>;
  parseFindings: Finding[];
}

export interface Registry {
  workspaceRoot: string;
  agentsDir: string;
  runsDir: string;
  indexPath: string;
  runs: ParsedRunNote[];
  findings: Finding[];
}

export interface RunSummary {
  id: string;
  status: string;
  provider: string;
  model: string;
  project: string;
  updated: string;
  check: string | null;
  next_action: string;
  human_owner: string;
  source_thread: string | null;
  artifacts: string[];
  sourcePath: string;
  sections: Record<string, string>;
  extraFrontmatter: Record<string, unknown>;
}
