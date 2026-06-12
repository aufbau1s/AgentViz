import path from "node:path";
import { buildJsonExport } from "./export.js";
import { initWorkspace } from "./init.js";
import { readRegistry } from "./registry.js";
import { STATUSES, type Finding } from "./types.js";
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
  const overdueRuns = runs.filter((run) => hasFinding(findingsByRun, run.id, ["W111"]));
  const nextActionRuns = runs.filter((run) => hasFinding(findingsByRun, run.id, ["W112", "W150"]));

  if (runs.length === 0) {
    console.log("No AgentViz runs found.");
  } else {
    if (overdueRuns.length > 0 || nextActionRuns.length > 0) {
      console.log("Attention");

      if (overdueRuns.length > 0) {
        console.log(`overdue-checks (${overdueRuns.length})`);

        for (const run of overdueRuns) {
          console.log(`  - ${run.id} | ${run.status} | check overdue: ${run.check ?? "none"}`);
        }

        console.log("");
      }

      if (nextActionRuns.length > 0) {
        console.log(`next-action-issues (${nextActionRuns.length})`);

        for (const run of nextActionRuns) {
          const reasons = summarizeFindings(findingsByRun.get(run.id) ?? [], ["W112", "W150"]);
          console.log(`  - ${run.id} | ${run.status} | next: ${run.next_action} | ${reasons}`);
        }

        console.log("");
      }
    }

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

function hasFinding(
  findingsByRun: Map<string, Finding[]>,
  runId: string,
  codes: string[]
): boolean {
  const runFindings = findingsByRun.get(runId) ?? [];
  return runFindings.some((finding) => codes.includes(finding.code));
}

function summarizeFindings(findings: Finding[], codes: string[]): string {
  const labelsByCode = new Map<string, string>([
    ["W112", "placeholder next action"],
    ["W150", "body/frontmatter mismatch"]
  ]);

  return findings
    .filter((finding) => codes.includes(finding.code))
    .map((finding) => labelsByCode.get(finding.code) ?? finding.code)
    .join(", ");
}
