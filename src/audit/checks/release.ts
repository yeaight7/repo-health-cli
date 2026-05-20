import { execFileSync } from "node:child_process";
import { hasAnyPath, listFiles, pathExists, readJson, readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import { isReleaseWorkflow } from "../detectors.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

type PackageJson = {
  version?: string;
};

export function auditRelease({ repoPath }: RepoContext): CategoryResult {
  const packageJson = readJson<PackageJson>(repoPath, "package.json");
  const workflowFiles = listFiles(repoPath, ".github/workflows");
  const releaseWorkflow = workflowFiles.some((file) => isReleaseWorkflow(file, readText(repoPath, `.github/workflows/${file}`) ?? ""));
  const tagStatus = getTagStatus(repoPath);
  const checks: CheckResult[] = [
    tagStatus === "present"
      ? { id: "git-tags", label: "Git tags", status: "pass", message: "Git tags found." }
      : tagStatus === "none"
        ? { id: "git-tags", label: "Git tags", status: "fail", message: "No git tags found.", recommendation: "Create version tags when releases begin.", severity: "niceToHave" }
        : { id: "git-tags", label: "Git tags", status: "warn", message: "Not a git repo or tags could not be inspected.", recommendation: "Use git tags for releases when this project is released.", severity: "niceToHave" },
    hasAnyPath(repoPath, ["CHANGELOG.md", "changelog.md"])
      ? { id: "changelog", label: "Changelog", status: "pass", message: "Changelog is present." }
      : { id: "changelog", label: "Changelog", status: "fail", message: "Changelog missing.", recommendation: "Add CHANGELOG.md before public releases.", severity: "recommended" },
    releaseWorkflow
      ? { id: "release-workflow", label: "Release workflow", status: "pass", message: "Release workflow detected." }
      : { id: "release-workflow", label: "Release workflow", status: "fail", message: "Release workflow not detected.", recommendation: "Add a release workflow when publishing is needed.", severity: "niceToHave" },
    packageJson?.version
      ? { id: "version-metadata", label: "Version metadata", status: "pass", message: "Package version metadata is present." }
      : { id: "version-metadata", label: "Version metadata", status: "fail", message: "Package version metadata missing.", recommendation: "Add version metadata to package.json or equivalent.", severity: "recommended" }
  ];

  return scoreCategory("release", "Release readiness", checks);
}

function getTagStatus(repoPath: string): "present" | "none" | "unknown" {
  if (!pathExists(repoPath, ".git")) {
    return "unknown";
  }

  try {
    const output = execFileSync("git", ["-C", repoPath, "tag", "--list"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return output.trim().length > 0 ? "present" : "none";
  } catch {
    return "unknown";
  }
}
