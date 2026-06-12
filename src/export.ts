import path from "node:path";
import { VERSION } from "./version.js";
import type { Finding, ParsedRunNote, Registry } from "./types.js";
import { summarizeRun } from "./validation.js";

export interface JsonExport {
  schemaVersion: "agentviz-export-v0";
  generatedAt: string;
  generator: {
    name: "agentviz";
    version: string;
  };
  source: {
    kind: "markdown";
    canonical: true;
    workspaceRoot: string;
    agentsDir: string;
  };
  summary: {
    runCount: number;
    findingCount: number;
    errorCount: number;
    warningCount: number;
  };
  runs: JsonExportRun[];
  findings: JsonExportFinding[];
}

export interface JsonExportRun {
  id: string;
  sourcePath: string;
  sourceAbsolutePath: string;
  frontmatter: Record<string, unknown>;
  sections: Record<string, string>;
  sectionOrder: string[];
  findings: JsonExportFinding[];
}

export interface JsonExportFinding {
  code: string;
  severity: Finding["severity"];
  message: string;
  runId: string | null;
  sourcePath: string | null;
  sourceAbsolutePath: string | null;
}

export function buildJsonExport(
  registry: Registry,
  findings: Finding[],
  generatedAt = new Date()
): JsonExport {
  const normalizedFindings = findings.map((finding) => normalizeFinding(registry, finding));

  return {
    schemaVersion: "agentviz-export-v0",
    generatedAt: generatedAt.toISOString(),
    generator: {
      name: "agentviz",
      version: VERSION
    },
    source: {
      kind: "markdown",
      canonical: true,
      workspaceRoot: registry.workspaceRoot,
      agentsDir: relativePath(registry.workspaceRoot, registry.agentsDir)
    },
    summary: {
      runCount: registry.runs.length,
      findingCount: findings.length,
      errorCount: findings.filter((finding) => finding.severity === "error").length,
      warningCount: findings.filter((finding) => finding.severity === "warning").length
    },
    runs: registry.runs.map((run) => exportRun(registry, run, normalizedFindings)),
    findings: normalizedFindings
  };
}

function exportRun(
  registry: Registry,
  run: ParsedRunNote,
  normalizedFindings: JsonExportFinding[]
): JsonExportRun {
  const summary = summarizeRun(run);

  return {
    id: summary.id,
    sourcePath: relativePath(registry.workspaceRoot, run.sourcePath),
    sourceAbsolutePath: run.sourcePath,
    frontmatter: {
      id: summary.id,
      type: run.frontmatter["type"] ?? null,
      provider: summary.provider,
      model: summary.model,
      status: summary.status,
      project: summary.project,
      created: run.frontmatter["created"] ?? null,
      updated: summary.updated,
      check: summary.check,
      next_action: summary.next_action,
      human_owner: summary.human_owner,
      source_thread: summary.source_thread,
      artifacts: summary.artifacts,
      ...summary.extraFrontmatter
    },
    sections: summary.sections,
    sectionOrder: run.sections.map((section) => section.heading),
    findings: normalizedFindings.filter((finding) => finding.runId === summary.id)
  };
}

function normalizeFinding(registry: Registry, finding: Finding): JsonExportFinding {
  return {
    code: finding.code,
    severity: finding.severity,
    message: finding.message,
    runId: finding.runId ?? null,
    sourcePath: finding.file ? relativePath(registry.workspaceRoot, finding.file) : null,
    sourceAbsolutePath: finding.file ? path.resolve(finding.file) : null
  };
}

function relativePath(from: string, to: string): string {
  return path.relative(from, to).replace(/\\/g, "/");
}
