import fs from "node:fs/promises";
import path from "node:path";
import { parseRunNote } from "./parser.js";
import type { Finding, Registry } from "./types.js";

export async function readRegistry(workspaceRootInput: string): Promise<Registry> {
  const workspaceRoot = path.resolve(workspaceRootInput);
  const agentsDir = path.join(workspaceRoot, "agents");
  const runsDir = path.join(agentsDir, "runs");
  const indexPath = path.join(agentsDir, "index.md");
  const findings: Finding[] = [];

  let runFilenames: string[] = [];

  try {
    const entries = await fs.readdir(runsDir, { withFileTypes: true });
    runFilenames = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    findings.push({
      code: "E100",
      severity: "error",
      message: `Cannot read agents/runs directory: ${errorMessage(error)}.`,
      file: runsDir
    });
  }

  const runs = await Promise.all(
    runFilenames.map(async (filename) => {
      const sourcePath = path.join(runsDir, filename);
      const raw = await fs.readFile(sourcePath, "utf8");
      return parseRunNote(sourcePath, raw);
    })
  );

  return {
    workspaceRoot,
    agentsDir,
    runsDir,
    indexPath,
    runs,
    findings
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
