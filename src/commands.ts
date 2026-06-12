import path from "node:path";
import { initWorkspace } from "./init.js";
import { readRegistry } from "./registry.js";
import { STATUSES, type Finding, type Registry } from "./types.js";
import { summarizeRun, validateRegistry } from "./validation.js";

export async function runInit(workspace = "."): Promise<number> {
  const result = await initWorkspace(workspace);

  console.log(`Initialized AgentViz workspace at ${result.workspaceRoot}`);

  for (const createdPath of result.created) {
    console.log(`created ${path.relative(result.workspaceRoot, createdPath) || "."}`);
  }

  for (const skippedPath of result.skipped) {
    console.log(`skipped ${path.relative(result.workspaceRoot, skippedPath)} (already exists)`);
  }

  return 0;
}

export async function runStatus(workspace = "."): Promise<number> {
  const registry = await readRegistry(workspace);
  const findings = validateRegistry(registry);
  const runs = registry.runs.map(summarizeRun);
  const findingsByRun = groupFindingsByRun(findings);

  if (runs.length === 0) {
    console.log("No AgentViz runs found.");
  } else {
    for (const status of STATUSES) {
      const runsForStatus = runs.filter((run) => run.status === status);

      if (runsForStatus.length === 0) {
        continue;
      }

      console.log(`${status} (${runsForStatus.length})`);

      for (const run of runsForStatus) {
        const check = run.check ?? "none";
        const runFindings = findingsByRun.get(run.id) ?? [];
        const findingSummary =
          runFindings.length > 0
            ? ` [${runFindings.map((finding) => finding.code).join(", ")}]`
            : "";

        console.log(
          `  - ${run.id} | ${run.provider} | ${run.project} | check: ${check} | next: ${run.next_action}${findingSummary}`
        );
      }

      console.log("");
    }
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;

  if (findings.length > 0) {
    console.log(`Findings: ${errorCount} error(s), ${warningCount} warning(s)`);
  }

  return errorCount > 0 ? 1 : 0;
}

export async function runLint(workspace = "."): Promise<number> {
  const registry = await readRegistry(workspace);
  const findings = validateRegistry(registry);

  if (findings.length === 0) {
    console.log("No lint findings.");
    return 0;
  }

  for (const finding of findings) {
    const location = finding.file
      ? path.relative(registry.workspaceRoot, finding.file)
      : "registry";
    const run = finding.runId ? ` ${finding.runId}` : "";
    console.log(
      `${finding.severity.toUpperCase()} ${finding.code}${run} ${location}: ${finding.message}`
    );
  }

  return findings.some((finding) => finding.severity === "error") ? 1 : 0;
}

export async function runExport(workspace = ".", json = false): Promise<number> {
  if (!json) {
    console.error("Only --json export is supported in the MVP.");
    return 1;
  }

  const registry = await readRegistry(workspace);
  const findings = validateRegistry(registry);
  const exportValue = buildJsonExport(registry, findings);

  console.log(JSON.stringify(exportValue, null, 2));
  return 0;
}

export function buildJsonExport(registry: Registry, findings: Finding[]): unknown {
  return {
    schemaVersion: 0,
    workspaceRoot: registry.workspaceRoot,
    generatedAt: new Date().toISOString(),
    runs: registry.runs.map(summarizeRun),
    findings
  };
}

function groupFindingsByRun(findings: Finding[]): Map<string, Finding[]> {
  const grouped = new Map<string, Finding[]>();

  for (const finding of findings) {
    if (!finding.runId) {
      continue;
    }

    grouped.set(finding.runId, [...(grouped.get(finding.runId) ?? []), finding]);
  }

  return grouped;
}
