import { isDirectory, readJson, walkFiles } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

type PackageJson = {
  scripts?: Record<string, string>;
};

export function auditTests({ repoPath }: RepoContext): CategoryResult {
  const files = walkFiles(repoPath);
  const packageJson = readJson<PackageJson>(repoPath, "package.json");
  const hasTestDirectory = ["test", "tests", "__tests__"].some((dir) => isDirectory(repoPath, dir));
  const hasTestFiles = files.some((file) => /\.(test|spec)\.[jt]s$/i.test(file));
  const hasTestScript = Boolean(packageJson?.scripts?.test);

  const checks: CheckResult[] = [
    hasTestDirectory || hasTestFiles
      ? { id: "test-files", label: "Test files", status: "pass", message: "Test files or directories found." }
      : {
          id: "test-files",
          label: "Test files",
          status: "fail",
          message: "No common test files or directories found.",
          recommendation: "Add tests under test/, tests/, __tests__, or *.test/spec files.",
          severity: "critical"
        },
    packageJson
      ? hasTestScript
        ? { id: "test-script", label: "Package test script", status: "pass", message: "package.json has a test script." }
        : {
            id: "test-script",
            label: "Package test script",
            status: "fail",
            message: "package.json does not define scripts.test.",
            recommendation: "Add a package.json test script.",
            severity: "recommended"
          }
      : {
          id: "test-script",
          label: "Package test script",
          status: "warn",
          message: "package.json not found; skipping Node test script check.",
          recommendation: "If this is a Node project, add package.json with a test script.",
          severity: "niceToHave"
        }
  ];

  return scoreCategory("tests", "Tests", checks);
}
