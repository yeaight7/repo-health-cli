import { hasAnyPath, readJson } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

type PackageJson = {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  repository?: unknown;
  keywords?: string[];
  bin?: unknown;
  scripts?: Record<string, string>;
};

export function auditPackageMetadata({ repoPath }: RepoContext): CategoryResult {
  const packageJson = readJson<PackageJson>(repoPath, "package.json");
  const hasPythonMetadata = hasAnyPath(repoPath, ["pyproject.toml", "setup.py", "requirements.txt"]);

  if (!packageJson) {
    return scoreCategory("packageMetadata", "Package metadata", [
      hasPythonMetadata
        ? { id: "python-metadata", label: "Python metadata", status: "warn", message: "Python metadata detected; Node package checks skipped.", recommendation: "Add complete package metadata for the primary runtime.", severity: "niceToHave" }
        : {
            id: "package-json",
            label: "package.json",
            status: "fail",
            message: "package.json not found.",
            recommendation: "Add package metadata for the project runtime.",
            severity: "recommended"
          }
    ]);
  }

  const scripts = packageJson.scripts ?? {};
  const checks: CheckResult[] = [
    fieldCheck("name", "Package name", Boolean(packageJson.name), "Add package.json name."),
    fieldCheck("version", "Version", Boolean(packageJson.version), "Add package.json version."),
    fieldCheck("description", "Description", Boolean(packageJson.description), "Add package.json description."),
    fieldCheck("license", "License metadata", Boolean(packageJson.license), "Add package.json license."),
    fieldCheck("repository", "Repository metadata", Boolean(packageJson.repository), "Add package.json repository metadata."),
    fieldCheck("keywords", "Keywords", Array.isArray(packageJson.keywords) && packageJson.keywords.length > 0, "Add useful package.json keywords.", "niceToHave"),
    fieldCheck("bin", "CLI bin metadata", Boolean(packageJson.bin), "Add package.json bin metadata for CLI usage."),
    fieldCheck("script-test", "Test script", Boolean(scripts.test), "Add scripts.test."),
    fieldCheck("script-build", "Build script", Boolean(scripts.build), "Add scripts.build."),
    fieldCheck("script-lint", "Lint or typecheck script", Boolean(scripts.lint || scripts.typecheck), "Add scripts.lint or scripts.typecheck.")
  ];

  return scoreCategory("packageMetadata", "Package metadata", checks);
}

function fieldCheck(id: string, label: string, ok: boolean, recommendation: string, severity: CheckResult["severity"] = "recommended"): CheckResult {
  return ok
    ? { id, label, status: "pass", message: `${label} is present.` }
    : { id, label, status: "fail", message: `${label} is missing.`, recommendation, severity };
}
