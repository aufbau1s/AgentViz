import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildJsonExport } from "./export.js";
import { readRegistry } from "./registry.js";
import { validateRegistry } from "./validation.js";

describe("buildJsonExport", () => {
  it("exports the valid fixture workspace using the documented shape", async () => {
    const registry = await readRegistry(path.resolve("fixtures/valid/basic-workspace"));
    const findings = validateRegistry(registry);
    const exported = buildJsonExport(registry, findings, new Date("2026-06-12T00:00:00Z"));

    expect(exported.schemaVersion).toBe("agentviz-export-v0");
    expect(exported.generatedAt).toBe("2026-06-12T00:00:00.000Z");
    expect(exported.generator).toEqual({
      name: "agentviz",
      version: "0.0.0"
    });
    expect(exported.source).toMatchObject({
      kind: "markdown",
      canonical: true,
      agentsDir: "agents"
    });
    expect(exported.summary).toEqual({
      runCount: 6,
      findingCount: 0,
      errorCount: 0,
      warningCount: 0
    });
    expect(exported.runs).toHaveLength(6);
    expect(exported.findings).toEqual([]);

    const codexRun = exported.runs.find((run) => run.id === "2026-05-24-codex-running");

    expect(codexRun).toMatchObject({
      sourcePath: "agents/runs/2026-05-24-codex-running.md",
      frontmatter: {
        id: "2026-05-24-codex-running",
        type: "agent-run",
        provider: "codex",
        status: "running",
        artifacts: []
      },
      sections: {
        Objective: "Outline the first parser slice for AgentViz."
      }
    });
    expect(codexRun?.sectionOrder).toEqual([
      "Objective",
      "Prompt",
      "Current State",
      "Result / Output",
      "Next Action",
      "Artifacts",
      "Timeline",
      "Handoff Notes"
    ]);
  });

  it("normalizes lint findings with relative and absolute source paths", async () => {
    const registry = await readRegistry(path.resolve("fixtures/warnings/unknown-provider"));
    const findings = validateRegistry(registry);
    const exported = buildJsonExport(registry, findings, new Date("2026-06-12T00:00:00Z"));

    expect(exported.summary).toMatchObject({
      findingCount: 1,
      errorCount: 0,
      warningCount: 1
    });
    expect(exported.findings).toEqual([
      expect.objectContaining({
        code: "W100",
        severity: "warning",
        runId: "2026-05-24-local-agent-running",
        sourcePath: "agents/runs/2026-05-24-local-agent-running.md"
      })
    ]);
    expect(exported.findings[0]?.sourceAbsolutePath).toContain("2026-05-24-local-agent-running.md");
    expect(exported.runs[0]?.findings).toHaveLength(1);
  });
});
