import path from "node:path";
import { describe, expect, it } from "vitest";
import { readRegistry } from "./registry.js";
import { validateRegistry } from "./validation.js";

describe("validateRegistry", () => {
  it("accepts the valid basic workspace with no findings", async () => {
    const findings = await validateFixture("fixtures/valid/basic-workspace");

    expect(findings).toEqual([]);
  });

  it.each([
    ["fixtures/warnings/unknown-provider", "W100"],
    ["fixtures/warnings/unknown-provider", "W120"],
    ["fixtures/warnings/active-check-overdue", "W111"],
    ["fixtures/warnings/index-missing-link", "W130"],
    ["fixtures/warnings/index-missing-link", "W150"]
  ])("emits warning code %s -> %s", async (fixturePath, expectedCode) => {
    const findings = await validateFixture(fixturePath);

    expect(findings.map((finding) => finding.code)).toContain(expectedCode);
    expect(findings.find((finding) => finding.code === expectedCode)?.severity).toBe("warning");
  });

  it.each([
    ["fixtures/errors/bad-status", "E012"],
    ["fixtures/errors/missing-heading", "E030"],
    ["fixtures/errors/artifacts-scalar", "E031"],
    ["fixtures/errors/duplicate-id", "E014"]
  ])("emits error code %s -> %s", async (fixturePath, expectedCode) => {
    const findings = await validateFixture(fixturePath);

    expect(findings.map((finding) => finding.code)).toContain(expectedCode);
    expect(findings.find((finding) => finding.code === expectedCode)?.severity).toBe("error");
  });
});

async function validateFixture(fixturePath: string) {
  const registry = await readRegistry(path.resolve(fixturePath));
  return validateRegistry(registry);
}
