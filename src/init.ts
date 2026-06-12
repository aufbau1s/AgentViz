import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface InitResult {
  workspaceRoot: string;
  created: string[];
  skipped: string[];
}

export async function initWorkspace(workspaceRootInput: string): Promise<InitResult> {
  const workspaceRoot = path.resolve(workspaceRootInput);
  const agentsDir = path.join(workspaceRoot, "agents");
  const runsDir = path.join(agentsDir, "runs");
  const created: string[] = [];
  const skipped: string[] = [];

  await ensureDirectory(agentsDir, created);
  await ensureDirectory(runsDir, created);
  await writeFileIfMissing(path.join(agentsDir, "index.md"), defaultIndex(), created, skipped);
  await writeFileIfMissing(
    path.join(agentsDir, "schema.md"),
    await readSchemaTemplate(),
    created,
    skipped
  );
  await writeFileIfMissing(path.join(agentsDir, "log.md"), defaultLog(), created, skipped);

  return { workspaceRoot, created, skipped };
}

async function ensureDirectory(directoryPath: string, created: string[]): Promise<void> {
  try {
    const stat = await fs.stat(directoryPath);

    if (!stat.isDirectory()) {
      throw new Error(`${directoryPath} exists but is not a directory.`);
    }
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      await fs.mkdir(directoryPath, { recursive: true });
      created.push(directoryPath);
      return;
    }

    throw error;
  }
}

async function writeFileIfMissing(
  filePath: string,
  content: string,
  created: string[],
  skipped: string[]
): Promise<void> {
  try {
    await fs.writeFile(filePath, content, { flag: "wx" });
    created.push(filePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      skipped.push(filePath);
      return;
    }

    throw error;
  }
}

async function readSchemaTemplate(): Promise<string> {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const templatePath = path.resolve(currentDirectory, "..", "templates", "agents", "schema.md");
  return fs.readFile(templatePath, "utf8");
}

function defaultIndex(): string {
  return `# AgentViz Dashboard

No runs yet.
`;
}

function defaultLog(): string {
  return `# AgentViz Maintenance Log

- ${new Date().toISOString()} - Initialized AgentViz workspace.
`;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
