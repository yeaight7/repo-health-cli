import { isDirectory, readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

export function auditDocs({ repoPath }: RepoContext): CategoryResult {
  const readme = readText(repoPath, "README.md") ?? "";
  const checks: CheckResult[] = [
    isDirectory(repoPath, "docs")
      ? { id: "docs-directory", label: "docs/ directory", status: "pass", message: "docs/ directory is present." }
      : { id: "docs-directory", label: "docs/ directory", status: "fail", message: "docs/ directory missing.", recommendation: "Add docs/ for deeper documentation.", severity: "niceToHave" },
    /\]\((docs\/|\.\/docs\/|\/docs\/)|\bdocs\//i.test(readme)
      ? { id: "readme-docs-link", label: "README links to docs", status: "pass", message: "README.md links to docs." }
      : { id: "readme-docs-link", label: "README links to docs", status: "fail", message: "README.md does not link to docs.", recommendation: "Link README.md to docs/ when docs exist.", severity: "niceToHave" },
    isDirectory(repoPath, "examples") || isDirectory(repoPath, "example")
      ? { id: "examples-directory", label: "Examples directory", status: "pass", message: "Examples directory is present." }
      : { id: "examples-directory", label: "Examples directory", status: "fail", message: "Examples directory missing.", recommendation: "Add examples/ with runnable examples.", severity: "recommended" }
  ];

  return scoreCategory("docs", "Documentation", checks);
}
