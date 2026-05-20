import { hasAnyPath, isDirectory, pathExists } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

export function auditAgentReadiness({ repoPath }: RepoContext): CategoryResult {
  const checks: CheckResult[] = [
    fileCheck(repoPath, "AGENTS.md", "Agent instructions", "Add AGENTS.md with repo-specific agent instructions.", "recommended"),
    fileCheck(repoPath, "CLAUDE.md", "Claude instructions", "Add CLAUDE.md if Claude agents are expected to work in this repo.", "niceToHave"),
    fileCheck(repoPath, ".github/copilot-instructions.md", "Copilot instructions", "Add .github/copilot-instructions.md for GitHub Copilot guidance.", "niceToHave"),
    hasAnyPath(repoPath, [".cursorrules"]) || isDirectory(repoPath, ".cursor/rules")
      ? { id: "cursor-rules", label: "Cursor rules", status: "pass", message: "Cursor rules are present." }
      : { id: "cursor-rules", label: "Cursor rules", status: "fail", message: "Cursor rules missing.", recommendation: "Add .cursorrules or .cursor/rules/ if Cursor is used.", severity: "niceToHave" },
    fileCheck(repoPath, ".windsurfrules", "Windsurf rules", "Add .windsurfrules if Windsurf agents are used.", "niceToHave"),
    fileCheck(repoPath, ".devcontainer/devcontainer.json", "Devcontainer", "Add .devcontainer/devcontainer.json for reproducible agent/dev environments.", "niceToHave")
  ];

  return scoreCategory("agentReadiness", "Agent readiness", checks);
}

function fileCheck(repoPath: string, relativePath: string, label: string, recommendation: string, severity: CheckResult["severity"]): CheckResult {
  return pathExists(repoPath, relativePath)
    ? { id: relativePath.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, status: "pass", message: `${relativePath} is present.` }
    : { id: relativePath.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, status: "fail", message: `${relativePath} is missing.`, recommendation, severity };
}
