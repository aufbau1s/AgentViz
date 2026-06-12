import path from "node:path";
import { parseDocument } from "yaml";
import {
  REQUIRED_HEADINGS,
  type Finding,
  type ParsedRunNote,
  type ParsedSection
} from "./types.js";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function parseRunNote(sourcePath: string, raw: string): ParsedRunNote {
  const filename = path.basename(sourcePath);
  const parseFindings: Finding[] = [];
  let frontmatterRaw = "";
  let body = raw;
  let frontmatter: Record<string, unknown> = {};

  const frontmatterMatch = raw.match(FRONTMATTER_PATTERN);

  if (!frontmatterMatch) {
    parseFindings.push({
      code: "E001",
      severity: "error",
      message: "Run file has no YAML frontmatter.",
      file: sourcePath
    });
  } else {
    frontmatterRaw = frontmatterMatch[1] ?? "";
    body = raw.slice(frontmatterMatch[0].length);

    const parsedFrontmatter = parseFrontmatter(frontmatterRaw, sourcePath);
    frontmatter = parsedFrontmatter.frontmatter;
    parseFindings.push(...parsedFrontmatter.findings);
  }

  const sections = parseSections(body);

  return {
    sourcePath,
    filename,
    raw,
    frontmatterRaw,
    frontmatter,
    body,
    sections,
    sectionsByHeading: new Map(sections.map((section) => [section.heading, section])),
    parseFindings
  };
}

function parseFrontmatter(
  frontmatterRaw: string,
  sourcePath: string
): { frontmatter: Record<string, unknown>; findings: Finding[] } {
  const findings: Finding[] = [];
  const document = parseDocument(frontmatterRaw, { schema: "core" });

  if (document.errors.length > 0) {
    findings.push({
      code: "E002",
      severity: "error",
      message: `YAML frontmatter cannot be parsed: ${document.errors[0]?.message ?? "unknown error"}.`,
      file: sourcePath
    });
    return { frontmatter: {}, findings };
  }

  const value = document.toJS() as unknown;

  if (!isRecord(value)) {
    findings.push({
      code: "E002",
      severity: "error",
      message: "YAML frontmatter must be a mapping object.",
      file: sourcePath
    });
    return { frontmatter: {}, findings };
  }

  return { frontmatter: value, findings };
}

function parseSections(body: string): ParsedSection[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const sections: ParsedSection[] = [];
  let currentHeading: string | undefined;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^## ([^\n#].*?)\s*$/);

    if (headingMatch) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          content: trimSectionContent(currentContent)
        });
      }

      currentHeading = headingMatch[1] ?? "";
      currentContent = [];
      continue;
    }

    if (currentHeading) {
      currentContent.push(line);
    }
  }

  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      content: trimSectionContent(currentContent)
    });
  }

  return sections;
}

function trimSectionContent(lines: string[]): string {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start]?.trim() === "") {
    start += 1;
  }

  while (end > start && lines[end - 1]?.trim() === "") {
    end -= 1;
  }

  return lines.slice(start, end).join("\n");
}

export function getRequiredHeadingOrder(run: ParsedRunNote): string[] {
  return run.sections
    .filter((section) => REQUIRED_HEADINGS.includes(section.heading as never))
    .map((section) => section.heading);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
