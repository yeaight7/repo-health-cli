import { hasAnyPath, readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

export function auditLicense({ repoPath }: RepoContext): CategoryResult {
  const readme = readText(repoPath, "README.md");
  const checks: CheckResult[] = [
    hasAnyPath(repoPath, ["LICENSE", "LICENSE.md"])
      ? { id: "license-file", label: "License file", status: "pass", message: "License file is present." }
      : {
          id: "license-file",
          label: "License file",
          status: "fail",
          message: "No LICENSE or LICENSE.md file found.",
          recommendation: "Add a LICENSE file.",
          severity: "critical"
        },
    readme && /license/i.test(readme)
      ? { id: "readme-license", label: "README license mention", status: "pass", message: "README.md mentions licensing." }
      : {
          id: "readme-license",
          label: "README license mention",
          status: "fail",
          message: "README.md does not mention licensing.",
          recommendation: "Mention the license in README.md.",
          severity: "recommended"
        }
  ];

  return scoreCategory("license", "Licensing", checks);
}
