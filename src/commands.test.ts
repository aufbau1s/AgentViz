import { afterEach, describe, expect, it, vi } from "vitest";
import { runStatus } from "./commands.js";

describe("runStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("summarizes active urgency counts before the grouped status list", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const exitCode = await runStatus("fixtures/valid/basic-workspace");
    const output = log.mock.calls.map((call) => call.join(" ")).join("\n");

    expect(exitCode).toBe(0);
    expect(output).toContain("Summary: active 4 | needs-review 1 | blocked 1");
    expect(output).toContain("queued (1)");
    expect(output).toContain("done (1)");
  });

  it("surfaces overdue checks and next-action issues ahead of status groups", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const exitCode = await runStatus("fixtures/warnings/index-missing-link");
    const output = log.mock.calls.map((call) => call.join(" ")).join("\n");

    expect(exitCode).toBe(0);
    expect(output).toContain("Summary: active 1 | next-action 1");
    expect(output).toContain("Attention");
    expect(output).toContain("next-action-issues (1)");
    expect(output).toContain("2026-05-24-codex-unlinked | running | next:");
    expect(output).toContain("body/frontmatter mismatch");
    expect(output).toContain("running (1)");
  });

  it("surfaces overdue checks in the attention block", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const exitCode = await runStatus("fixtures/warnings/active-check-overdue");
    const output = log.mock.calls.map((call) => call.join(" ")).join("\n");

    expect(exitCode).toBe(0);
    expect(output).toContain("Summary: active 1 | overdue 1");
    expect(output).toContain("Attention");
    expect(output).toContain("overdue-checks (1)");
    expect(output).toContain("2026-05-24-codex-overdue-check | running | check overdue:");
  });
});
