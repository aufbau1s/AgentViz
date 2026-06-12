import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initWorkspace } from "./init.js";

const temporaryDirectories: string[] = [];

describe("initWorkspace", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directoryPath) => fs.rm(directoryPath, { recursive: true, force: true }))
    );
  });

  it("creates the canonical workspace layout", async () => {
    const workspaceRoot = await makeTemporaryWorkspace();
    const result = await initWorkspace(workspaceRoot);

    await expect(fs.stat(path.join(workspaceRoot, "agents"))).resolves.toHaveProperty(
      "isDirectory"
    );
    await expect(fs.stat(path.join(workspaceRoot, "agents", "runs"))).resolves.toHaveProperty(
      "isDirectory"
    );
    await expect(
      fs.readFile(path.join(workspaceRoot, "agents", "index.md"), "utf8")
    ).resolves.toContain("AgentViz Dashboard");
    await expect(
      fs.readFile(path.join(workspaceRoot, "agents", "schema.md"), "utf8")
    ).resolves.toContain("AgentViz Workspace Contract");
    await expect(
      fs.readFile(path.join(workspaceRoot, "agents", "log.md"), "utf8")
    ).resolves.toContain("Initialized AgentViz workspace");

    expect(result.created.length).toBeGreaterThanOrEqual(5);
    expect(result.skipped).toEqual([]);
  });

  it("does not overwrite existing files", async () => {
    const workspaceRoot = await makeTemporaryWorkspace();
    const schemaPath = path.join(workspaceRoot, "agents", "schema.md");
    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, "custom schema", "utf8");

    const result = await initWorkspace(workspaceRoot);

    await expect(fs.readFile(schemaPath, "utf8")).resolves.toBe("custom schema");
    expect(result.skipped).toContain(schemaPath);
    await expect(fs.stat(path.join(workspaceRoot, "agents", "runs"))).resolves.toHaveProperty(
      "isDirectory"
    );
  });
});

async function makeTemporaryWorkspace(): Promise<string> {
  const directoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "agentviz-init-"));
  temporaryDirectories.push(directoryPath);
  return directoryPath;
}
