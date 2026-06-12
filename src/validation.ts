import fs from "node:fs";
import path from "node:path";
import {
  ACTIVE_STATUSES,
  KNOWN_PROVIDERS,
  REQUIRED_FRONTMATTER_KEYS,
  REQUIRED_HEADINGS,
  STATUSES,
  type Finding,
  type ParsedRunNote,
  type Registry,
  type RunSummary
} from "./types.js";

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const KEBAB_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const PLACEHOLDER_PATTERN = /^(?:tbd|todo|none|n\/a|null|-)$/i;
const DEFAULT_FIXTURE_NOW = "2026-05-24T16:00:00-04:00";

export interface ValidateOptions {
  now?: Date;
}

export function validateRegistry(registry: Registry, options: ValidateOptions = {}): Finding[] {
  const findings: Finding[] = [...registry.findings];
  const now = options.now ?? inferNow(registry.workspaceRoot);
  const ids = new Map<string, ParsedRunNote[]>();
  const indexContent = readIndexContent(registry.indexPath);

  for (const run of registry.runs) {
    findings.push(...run.parseFindings);
    const id = stringField(run, "id");

    if (id) {
      const matchingRuns = ids.get(id) ?? [];
      matchingRuns.push(run);
      ids.set(id, matchingRuns);
    }

    findings.push(...validateRun(run, indexContent, now));
  }

  for (const [id, runs] of ids) {
    if (runs.length > 1) {
      for (const run of runs) {
        findings.push({
          code: "E014",
          severity: "error",
          message: `Duplicate run id '${id}' exists in the registry.`,
          file: run.sourcePath,
          runId: id
        });
      }
    }
  }

  return sortFindings(findings);
}

export function summarizeRun(run: ParsedRunNote): RunSummary {
  const sections: Record<string, string> = {};

  for (const section of run.sections) {
    sections[section.heading] = section.content;
  }

  const coreKeys = new Set<string>(REQUIRED_FRONTMATTER_KEYS);
  const extraFrontmatter: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(run.frontmatter)) {
    if (!coreKeys.has(key)) {
      extraFrontmatter[key] = value;
    }
  }

  return {
    id: stringField(run, "id") ?? "",
    status: stringField(run, "status") ?? "",
    provider: stringField(run, "provider") ?? "",
    model: stringField(run, "model") ?? "",
    project: stringField(run, "project") ?? "",
    updated: stringField(run, "updated") ?? "",
    check: nullableStringField(run, "check"),
    next_action: stringField(run, "next_action") ?? "",
    human_owner: stringField(run, "human_owner") ?? "",
    source_thread: nullableStringField(run, "source_thread"),
    artifacts: Array.isArray(run.frontmatter["artifacts"])
      ? run.frontmatter["artifacts"].filter(
          (artifact): artifact is string => typeof artifact === "string"
        )
      : [],
    sourcePath: run.sourcePath,
    sections,
    extraFrontmatter
  };
}

function validateRun(run: ParsedRunNote, indexContent: string | undefined, now: Date): Finding[] {
  const findings: Finding[] = [];
  const runId = stringField(run, "id");

  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!(key in run.frontmatter)) {
      findings.push({
        code: "E010",
        severity: "error",
        message: `Required frontmatter key '${key}' is missing.`,
        file: run.sourcePath,
        runId
      });
    }
  }

  findings.push(...validateScalarFields(run));
  findings.push(...validateKnownFields(run, now));
  findings.push(...validateHeadings(run));
  findings.push(...validateIndexLink(run, indexContent));
  findings.push(...validateTimeline(run));
  findings.push(...validateStatusSpecificRules(run));
  findings.push(...validateUnknownFields(run));

  return findings;
}

function validateScalarFields(run: ParsedRunNote): Finding[] {
  const findings: Finding[] = [];
  const runId = stringField(run, "id");
  const scalarKeys = [
    "id",
    "type",
    "provider",
    "model",
    "status",
    "project",
    "created",
    "updated",
    "next_action",
    "human_owner"
  ];

  for (const key of scalarKeys) {
    if (key in run.frontmatter && !isNonEmptyString(run.frontmatter[key])) {
      findings.push({
        code: "E032",
        severity: "error",
        message: `Required scalar field '${key}' must be a non-empty string.`,
        file: run.sourcePath,
        runId
      });
    }
  }

  if ("source_thread" in run.frontmatter && !isNullableString(run.frontmatter["source_thread"])) {
    findings.push({
      code: "E032",
      severity: "error",
      message: "Field 'source_thread' must be a string or null.",
      file: run.sourcePath,
      runId
    });
  }

  return findings;
}

function validateKnownFields(run: ParsedRunNote, now: Date): Finding[] {
  const findings: Finding[] = [];
  const id = stringField(run, "id");
  const type = stringField(run, "type");
  const status = stringField(run, "status");
  const provider = stringField(run, "provider");
  const filenameStem = path.basename(run.filename, ".md");

  if (type && type !== "agent-run") {
    findings.push({
      code: "E011",
      severity: "error",
      message: "Frontmatter 'type' must be exactly 'agent-run'.",
      file: run.sourcePath,
      runId: id
    });
  }

  if (status && !STATUSES.includes(status as never)) {
    findings.push({
      code: "E012",
      severity: "error",
      message: `Status '${status}' is not one of the V0 statuses.`,
      file: run.sourcePath,
      runId: id
    });
  }

  if (id && !ID_PATTERN.test(id)) {
    findings.push({
      code: "E013",
      severity: "error",
      message: `Run id '${id}' does not match the required format.`,
      file: run.sourcePath,
      runId: id
    });
  }

  if (id && filenameStem !== id) {
    findings.push({
      code: "E015",
      severity: "error",
      message: `Run filename stem '${filenameStem}' does not match frontmatter id '${id}'.`,
      file: run.sourcePath,
      runId: id
    });
  }

  if (provider) {
    if (!KEBAB_PATTERN.test(provider)) {
      findings.push({
        code: "E032",
        severity: "error",
        message: `Provider '${provider}' must be lowercase kebab-case.`,
        file: run.sourcePath,
        runId: id
      });
    } else if (!KNOWN_PROVIDERS.includes(provider as never)) {
      findings.push({
        code: "W100",
        severity: "warning",
        message: `Provider '${provider}' is not a known V0 provider.`,
        file: run.sourcePath,
        runId: id
      });
    }
  }

  findings.push(...validateTimestamps(run, now));
  findings.push(...validateArtifacts(run));

  return findings;
}

function validateTimestamps(run: ParsedRunNote, now: Date): Finding[] {
  const findings: Finding[] = [];
  const id = stringField(run, "id");
  const status = stringField(run, "status");
  const created = stringField(run, "created");
  const updated = stringField(run, "updated");
  const check = nullableStringField(run, "check");

  for (const key of ["created", "updated"] as const) {
    const value = stringField(run, key);

    if (value && !isTimestamp(value)) {
      findings.push({
        code: "E020",
        severity: "error",
        message: `Timestamp field '${key}' is malformed or date-only.`,
        file: run.sourcePath,
        runId: id
      });
    }
  }

  if (created && updated && isTimestamp(created) && isTimestamp(updated)) {
    if (Date.parse(updated) < Date.parse(created)) {
      findings.push({
        code: "E021",
        severity: "error",
        message: "Timestamp field 'updated' is earlier than 'created'.",
        file: run.sourcePath,
        runId: id
      });
    }
  }

  if (status && ACTIVE_STATUSES.includes(status as never)) {
    if (check === null) {
      findings.push({
        code: "W110",
        severity: "warning",
        message: "Active run has no check timestamp.",
        file: run.sourcePath,
        runId: id
      });
    } else if (!isTimestamp(check)) {
      findings.push({
        code: "E020",
        severity: "error",
        message: "Timestamp field 'check' is malformed or date-only.",
        file: run.sourcePath,
        runId: id
      });
    } else if (Date.parse(check) < now.getTime()) {
      findings.push({
        code: "W111",
        severity: "warning",
        message: "Active run has a check timestamp in the past.",
        file: run.sourcePath,
        runId: id
      });
    }
  }

  if (status === "done" && check !== null) {
    findings.push({
      code: "W113",
      severity: "warning",
      message: "Done run has a non-null check timestamp.",
      file: run.sourcePath,
      runId: id
    });
  }

  return findings;
}

function validateArtifacts(run: ParsedRunNote): Finding[] {
  const artifacts = run.frontmatter["artifacts"];

  if (!Array.isArray(artifacts) || artifacts.some((artifact) => typeof artifact !== "string")) {
    return [
      {
        code: "E031",
        severity: "error",
        message: "Frontmatter 'artifacts' must be a list of strings.",
        file: run.sourcePath,
        runId: stringField(run, "id")
      }
    ];
  }

  return [];
}

function validateHeadings(run: ParsedRunNote): Finding[] {
  const actualHeadings = run.sections.map((section) => section.heading);
  const requiredHeadings = [...REQUIRED_HEADINGS];
  const hasExactOrder =
    actualHeadings.length >= requiredHeadings.length &&
    requiredHeadings.every((heading, index) => actualHeadings[index] === heading);

  if (!hasExactOrder) {
    return [
      {
        code: "E030",
        severity: "error",
        message: "Required body headings are missing or out of order.",
        file: run.sourcePath,
        runId: stringField(run, "id")
      }
    ];
  }

  return [];
}

function validateIndexLink(run: ParsedRunNote, indexContent: string | undefined): Finding[] {
  if (!indexContent) {
    return [];
  }

  const normalizedIndex = indexContent.replace(/\\/g, "/");
  const expectedLink = `runs/${run.filename}`;
  const linkPattern = new RegExp(`\\]\\((?:\\./)?${escapeRegExp(expectedLink)}\\)`);

  if (!linkPattern.test(normalizedIndex)) {
    return [
      {
        code: "W130",
        severity: "warning",
        message: "Run file is not linked from agents/index.md.",
        file: run.sourcePath,
        runId: stringField(run, "id")
      }
    ];
  }

  return [];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateTimeline(run: ParsedRunNote): Finding[] {
  const timeline = run.sectionsByHeading.get("Timeline")?.content.trim() ?? "";

  if (timeline.length === 0 || !/^- \d{4}-\d{2}-\d{2}T/m.test(timeline)) {
    return [
      {
        code: "W140",
        severity: "warning",
        message: "Timeline section is empty or has entries without timestamps.",
        file: run.sourcePath,
        runId: stringField(run, "id")
      }
    ];
  }

  return [];
}

function validateStatusSpecificRules(run: ParsedRunNote): Finding[] {
  const findings: Finding[] = [];
  const id = stringField(run, "id");
  const status = stringField(run, "status");
  const nextAction = stringField(run, "next_action") ?? "";
  const artifacts = run.frontmatter["artifacts"];
  const resultOutput = run.sectionsByHeading.get("Result / Output")?.content.trim() ?? "";
  const currentState = run.sectionsByHeading.get("Current State")?.content.trim() ?? "";
  const handoffNotes = run.sectionsByHeading.get("Handoff Notes")?.content.trim() ?? "";

  if (nextAction.length > 0 && PLACEHOLDER_PATTERN.test(nextAction)) {
    findings.push({
      code: "W112",
      severity: "warning",
      message: "Run has a placeholder next_action.",
      file: run.sourcePath,
      runId: id
    });
  }

  if (status === "needs-review") {
    const hasArtifacts = Array.isArray(artifacts) && artifacts.length > 0;
    const hasResult = resultOutput.length > 0 && resultOutput.toLowerCase() !== "pending.";

    if (!hasArtifacts && !hasResult) {
      findings.push({
        code: "W162",
        severity: "warning",
        message: "Needs-review run has neither artifacts nor a meaningful Result / Output summary.",
        file: run.sourcePath,
        runId: id
      });
    }
  }

  if (
    status === "blocked" &&
    !/block|unblock|unavailable|missing|dependency/i.test(`${currentState}\n${handoffNotes}`)
  ) {
    findings.push({
      code: "W163",
      severity: "warning",
      message: "Blocked run does not name a blocker.",
      file: run.sourcePath,
      runId: id
    });
  }

  if (status === "parked" && !/resume|resuming|park|pause|until|revisit/i.test(handoffNotes)) {
    findings.push({
      code: "W164",
      severity: "warning",
      message: "Parked run does not explain what would make it worth resuming.",
      file: run.sourcePath,
      runId: id
    });
  }

  if (status === "done" && resultOutput.toLowerCase() === "pending.") {
    findings.push({
      code: "W165",
      severity: "warning",
      message: "Done run still has Result / Output set to Pending.",
      file: run.sourcePath,
      runId: id
    });
  }

  return findings;
}

function validateUnknownFields(run: ParsedRunNote): Finding[] {
  const knownKeys = new Set<string>(REQUIRED_FRONTMATTER_KEYS);
  const findings: Finding[] = [];

  for (const key of Object.keys(run.frontmatter)) {
    if (!knownKeys.has(key) && !key.startsWith("x_")) {
      findings.push({
        code: "W101",
        severity: "warning",
        message: `Unknown frontmatter field '${key}' does not use the x_ prefix.`,
        file: run.sourcePath,
        runId: stringField(run, "id")
      });
    }
  }

  return findings;
}

function readIndexContent(indexPath: string): string | undefined {
  try {
    return fs.readFileSync(indexPath, "utf8");
  } catch {
    return undefined;
  }
}

function inferNow(workspaceRoot: string): Date {
  const normalizedRoot = workspaceRoot.replace(/\\/g, "/");

  if (normalizedRoot.includes("/fixtures/")) {
    return new Date(DEFAULT_FIXTURE_NOW);
  }

  return new Date();
}

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((left, right) => {
    const fileCompare = (left.file ?? "").localeCompare(right.file ?? "");

    if (fileCompare !== 0) {
      return fileCompare;
    }

    return left.code.localeCompare(right.code);
  });
}

function stringField(run: ParsedRunNote, key: string): string | undefined {
  const value = run.frontmatter[key];
  return typeof value === "string" ? value : undefined;
}

function nullableStringField(run: ParsedRunNote, key: string): string | null {
  const value = run.frontmatter[key];
  return typeof value === "string" ? value : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isTimestamp(value: string): boolean {
  return TIMESTAMP_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}
