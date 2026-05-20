import { listFiles, readText } from "../utils.js";
import { scoreCategory } from "../scoring.js";
import type { CategoryResult, CheckResult, RepoContext } from "../types.js";

const WORKFLOW_EXTENSIONS = /\.(ya?ml)$/i;

export function auditCi({ repoPath }: RepoContext): CategoryResult {
  const workflowFiles = listFiles(repoPath, ".github/workflows").filter((file) => WORKFLOW_EXTENSIONS.test(file));
  const workflowText = workflowFiles.map((file) => readText(repoPath, `.github/workflows/${file}`) ?? "").join("\n");
  const checks: CheckResult[] = [
    workflowFiles.length > 0
      ? { id: "workflow-files", label: "Workflow files", status: "pass", message: `${workflowFiles.length} workflow file(s) found.` }
      : {
          id: "workflow-files",
          label: "Workflow files",
          status: "fail",
          message: "No GitHub Actions workflow files found.",
          recommendation: "Add a test workflow under .github/workflows/.",
          severity: "critical"
        },
    /test|vitest|jest|pytest|go test|cargo test|npm test|pnpm test|yarn test/i.test(workflowText)
      ? { id: "workflow-tests", label: "Runs tests", status: "pass", message: "Workflow appears to run tests." }
      : workflowFiles.length > 0
        ? {
            id: "workflow-tests",
            label: "Runs tests",
            status: "warn",
            message: "Workflow exists, but test execution was not detected.",
            recommendation: "Add an explicit test step to CI.",
            severity: "recommended"
          }
        : {
            id: "workflow-tests",
            label: "Runs tests",
            status: "fail",
            message: "Cannot detect tests because no workflow exists.",
            recommendation: "Add a CI workflow that runs tests.",
            severity: "critical"
          },
    /lint|eslint|ruff|flake8|biome|prettier|format|typecheck|tsc|build|npm run build|pnpm build|yarn build/i.test(workflowText)
      ? { id: "workflow-quality", label: "Runs lint/build/type checks", status: "pass", message: "Workflow appears to run quality checks." }
      : workflowFiles.length > 0
        ? {
            id: "workflow-quality",
            label: "Runs lint/build/type checks",
            status: "warn",
            message: "Workflow exists, but lint/build/type checks were not detected.",
            recommendation: "Add lint, typecheck, or build steps to CI.",
            severity: "recommended"
          }
        : {
            id: "workflow-quality",
            label: "Runs lint/build/type checks",
            status: "fail",
            message: "Cannot detect quality checks because no workflow exists.",
            recommendation: "Add CI quality checks.",
            severity: "recommended"
          },
    hasBroadPermissions(workflowText)
      ? {
          id: "workflow-permissions",
          label: "Workflow permissions",
          status: "warn",
          message: "Workflow permissions look broad.",
          recommendation: "Avoid broad workflow permissions such as write-all unless needed.",
          severity: "recommended"
        }
      : workflowFiles.length > 0
        ? { id: "workflow-permissions", label: "Workflow permissions", status: "pass", message: "No obviously broad workflow permissions detected." }
        : {
            id: "workflow-permissions",
            label: "Workflow permissions",
            status: "warn",
            message: "No workflow permissions to inspect.",
            recommendation: "Use least-privilege permissions when adding workflows.",
            severity: "niceToHave"
          }
  ];

  return scoreCategory("ci", "CI / automation", checks);
}

function hasBroadPermissions(workflowText: string): boolean {
  return /permissions:\s*write-all/i.test(workflowText) || /contents:\s*write/i.test(workflowText);
}
