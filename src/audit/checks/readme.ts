import { readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
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
  checks.push(textCheck(readme, "setup", "Installation/setup section", /(^|\n)#{2,3}\s+.*(install|setup|getting started|development)/i, "README.md explains setup.", "Add installation or setup instructions to README.md."));
  checks.push(textCheck(readme, "usage", "Usage/quickstart section", /(^|\n)#{2,3}\s+.*(usage|quickstart|quick start|commands?)/i, "README.md explains usage.", "Add usage or quickstart examples to README.md."));
  checks.push(textCheck(readme, "examples", "Examples", /(^|\n)#{2,3}\s+.*examples?|```[\s\S]*?(repo-health|npm|node|tsx)/i, "README.md includes examples.", "Add concrete usage examples to README.md."));
  checks.push(textCheck(readme, "badges", "Badges/status indicators", /!\[[^\]]*]\([^)]*\)|\[[^\]]*(build|ci|test|status|license)[^\]]*]\([^)]*\)/i, "README.md has status indicators.", "Add real badges or status links when CI/release status exists.", "niceToHave"));
  checks.push(textCheck(readme, "license-mention", "License mention", /license/i, "README.md mentions licensing.", "Mention the project license in README.md."));
  checks.push(textCheck(readme, "demo-media", "Screenshot/GIF/demo link", /(screenshot|demo|gif|\.gif|\.png|\.jpg|asciinema|loom|youtube)/i, "README.md links to demo material.", "Add a screenshot, GIF, terminal recording, or demo link when available.", "niceToHave"));

  return scoreCategory("readme", "README quality", checks);
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
