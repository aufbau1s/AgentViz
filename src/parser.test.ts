import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRunNote } from "./parser.js";

describe("parseRunNote", () => {
  it("parses frontmatter and required sections", async () => {
    const sourcePath = path.resolve(
      "fixtures/valid/basic-workspace/agents/runs/2026-05-24-codex-running.md"
    );
    const raw = await fs.readFile(sourcePath, "utf8");
    const run = parseRunNote(sourcePath, raw);

    expect(run.parseFindings).toEqual([]);
    expect(run.frontmatter["id"]).toBe("2026-05-24-codex-running");
    expect(run.frontmatter["provider"]).toBe("codex");
    expect(run.sections.map((section) => section.heading)).toEqual([
      "Objective",
      "Prompt",
      "Current State",
      "Result / Output",
      "Next Action",
      "Artifacts",
      "Timeline",
      "Handoff Notes"
    ]);
    expect(run.sectionsByHeading.get("Next Action")?.content).toBe("Finish the parser outline.");
  });

  it("reports missing frontmatter without throwing", () => {
    const run = parseRunNote(
      "missing-frontmatter.md",
      "# Missing\n\n## Objective\n\nNo frontmatter."
    );

    expect(run.parseFindings).toMatchObject([
      {
        code: "E001",
        severity: "error"
      }
    ]);
    expect(run.sectionsByHeading.get("Objective")?.content).toBe("No frontmatter.");
  });

  it("preserves unknown frontmatter fields", () => {
    const run = parseRunNote(
      "custom.md",
      `---
id: custom
type: agent-run
x_priority: high
---

## Objective

Keep custom fields.
`
    );

    expect(run.frontmatter["x_priority"]).toBe("high");
  });
});
