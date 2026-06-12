import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const cliPath = "dist/cli.js";

function runCli(args) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8"
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const statusOutput = runCli(["status", "fixtures/valid/basic-workspace"]);
assert(
  statusOutput.includes("Summary: active 4 | needs-review 1 | blocked 1"),
  "status output should include the urgency summary"
);
assert(statusOutput.includes("running (1)"), "status output should include running group");
assert(
  statusOutput.includes("2026-05-24-codex-running | codex | AgentViz"),
  "status output should include codex run summary"
);
assert(
  statusOutput.includes("needs-review (1)"),
  "status output should include needs-review group"
);

const warningStatusOutput = runCli(["status", "fixtures/warnings/active-check-overdue"]);
assert(
  warningStatusOutput.includes("Summary: active 1 | overdue 1"),
  "status should summarize overdue attention"
);
assert(
  warningStatusOutput.includes("Attention"),
  "status should include attention block for warnings"
);
assert(warningStatusOutput.includes("overdue-checks (1)"), "status should surface overdue checks");

const initWorkspace = mkdtempSync(path.join(tmpdir(), "agentviz-smoke-init-"));
try {
  const initOutput = runCli(["init", initWorkspace]);
  assert(initOutput.includes("Initialized AgentViz workspace"), "init should print success output");
  assert(statSync(path.join(initWorkspace, "agents")).isDirectory(), "init should create agents/");
  assert(
    statSync(path.join(initWorkspace, "agents", "runs")).isDirectory(),
    "init should create agents/runs/"
  );
  assert(
    readFileSync(path.join(initWorkspace, "agents", "schema.md"), "utf8").includes(
      "AgentViz Workspace Contract"
    ),
    "init should copy agents/schema.md from the template"
  );
} finally {
  rmSync(initWorkspace, { recursive: true, force: true });
}

const lintResult = spawnSync(process.execPath, [cliPath, "lint", "fixtures/errors/bad-status"], {
  encoding: "utf8"
});
assert(lintResult.status === 1, "lint should exit 1 for fixture errors");
assert(lintResult.stdout.includes("ERROR E012"), "lint output should include E012");

const exportOutput = runCli(["export", "--json", "fixtures/valid/basic-workspace"]);
const parsedExport = JSON.parse(exportOutput);
assert(Array.isArray(parsedExport.runs), "export should include runs array");
assert(parsedExport.runs.length === 6, "export should include six valid fixture runs");
assert(Array.isArray(parsedExport.findings), "export should include findings array");
assert(parsedExport.findings.length === 0, "valid fixture export should include no findings");

console.log("Smoke tests passed.");
