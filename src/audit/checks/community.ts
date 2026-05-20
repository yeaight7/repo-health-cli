import { hasAnyPath, isDirectory, pathExists } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

export function auditCommunity({ repoPath }: RepoContext): CategoryResult {
  const checks: CheckResult[] = [
    fileCheck(repoPath, "CONTRIBUTING.md", "Contributing guide", "Add CONTRIBUTING.md.", "recommended"),
    fileCheck(repoPath, "CODE_OF_CONDUCT.md", "Code of conduct", "Add CODE_OF_CONDUCT.md.", "niceToHave"),
    isDirectory(repoPath, ".github/ISSUE_TEMPLATE")
      ? { id: "issue-template", label: "Issue templates", status: "pass", message: "Issue templates are present." }
      : { id: "issue-template", label: "Issue templates", status: "fail", message: "Issue templates missing.", recommendation: "Add .github/ISSUE_TEMPLATE/.", severity: "niceToHave" },
    hasAnyPath(repoPath, [".github/pull_request_template.md", ".github/PULL_REQUEST_TEMPLATE.md"])
      ? { id: "pr-template", label: "Pull request template", status: "pass", message: "Pull request template is present." }
      : { id: "pr-template", label: "Pull request template", status: "fail", message: "Pull request template missing.", recommendation: "Add .github/pull_request_template.md.", severity: "niceToHave" },
    fileCheck(repoPath, "SECURITY.md", "Security policy", "Add SECURITY.md.", "recommended"),
    fileCheck(repoPath, "CHANGELOG.md", "Changelog", "Add CHANGELOG.md.", "recommended")
  ];

  return scoreCategory("community", "Community files", checks);
}

function fileCheck(repoPath: string, relativePath: string, label: string, recommendation: string, severity: CheckResult["severity"]): CheckResult {
  return pathExists(repoPath, relativePath)
    ? { id: relativePath.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, status: "pass", message: `${relativePath} is present.` }
    : { id: relativePath.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, status: "fail", message: `${relativePath} is missing.`, recommendation, severity };
}
