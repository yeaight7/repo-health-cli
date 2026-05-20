import { readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import { hasCodeExample, hasDemoReference, hasMarkdownHeading, hasStatusIndicator } from "../detectors.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

export function auditReadme({ repoPath }: RepoContext): CategoryResult {
  const readme = readText(repoPath, "README.md");
  const checks: CheckResult[] = [];

  checks.push(
    readme
      ? pass("readme-exists", "README.md exists", "README.md is present.")
      : fail("readme-exists", "README.md exists", "README.md is missing.", "Add a README.md with project overview, setup, usage, and examples.", "critical")
  );

  checks.push(textCheck(readme, "title", "Clear title", /^#\s+\S+/m, "README.md has a top-level title.", "Add a clear H1 title to README.md."));
  checks.push(booleanCheck(readme, "setup", "Installation/setup section", hasMarkdownHeading(readme, ["install", "setup", "getting started", "development"]), "README.md explains setup.", "Add installation or setup instructions to README.md."));
  checks.push(booleanCheck(readme, "usage", "Usage/quickstart section", hasMarkdownHeading(readme, ["usage", "quickstart", "quick start", "command"]), "README.md explains usage.", "Add usage or quickstart examples to README.md."));
  checks.push(booleanCheck(readme, "examples", "Examples", hasCodeExample(readme), "README.md includes examples.", "Add concrete usage examples to README.md."));
  checks.push(booleanCheck(readme, "badges", "Badges/status indicators", hasStatusIndicator(readme), "README.md has status indicators.", "Add real badges or status links when CI/release status exists.", "niceToHave"));
  checks.push(textCheck(readme, "license-mention", "License mention", /license/i, "README.md mentions licensing.", "Mention the project license in README.md."));
  checks.push(booleanCheck(readme, "demo-media", "Screenshot/GIF/demo link", hasDemoReference(readme), "README.md links to demo material.", "Add a screenshot, GIF, terminal recording, or demo link when available.", "niceToHave"));

  return scoreCategory("readme", "README quality", checks);
}

function booleanCheck(
  readme: string | undefined,
  id: string,
  label: string,
  detected: boolean,
  passMessage: string,
  recommendation: string,
  severity: CheckResult["severity"] = "recommended"
): CheckResult {
  if (!readme) {
    return {
      id,
      label,
      status: "fail",
      message: "Cannot check because README.md is missing.",
      recommendation,
      severity
    };
  }

  return detected ? pass(id, label, passMessage) : fail(id, label, `${label} not detected.`, recommendation, severity);
}

function textCheck(
  readme: string | undefined,
  id: string,
  label: string,
  pattern: RegExp,
  passMessage: string,
  recommendation: string,
  severity: CheckResult["severity"] = "recommended"
): CheckResult {
  if (!readme) {
    return {
      id,
      label,
      status: "fail",
      message: "Cannot check because README.md is missing.",
      recommendation,
      severity
    };
  }

  return pattern.test(readme)
    ? pass(id, label, passMessage)
    : fail(id, label, `${label} not detected.`, recommendation, severity);
}

function pass(id: string, label: string, message: string): CheckResult {
  return { id, label, status: "pass", message };
}

function fail(id: string, label: string, message: string, recommendation: string, severity: CheckResult["severity"]): CheckResult {
  return { id, label, status: "fail", message, recommendation, severity };
}
