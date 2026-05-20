import { statSync } from "node:fs";
import path from "node:path";
import { auditAgentReadiness } from "./checks/agentReadiness.js";
import { auditCi } from "./checks/ci.js";
import { auditCommunity } from "./checks/community.js";
import { auditDocs } from "./checks/docs.js";
import { auditLicense } from "./checks/license.js";
import { auditPackageMetadata } from "./checks/packageMetadata.js";
import { auditReadme } from "./checks/readme.js";
import { auditRelease } from "./checks/release.js";
import { auditTests } from "./checks/tests.js";
import { assertWeightsTotal100, clamp, collectRecommendations, gradeForScore, summarizeChecks } from "./scoring.js";
import type { AuditReport, CategoryResult, RepoContext } from "./types.js";

export function auditRepository(inputPath: string): AuditReport {
  assertWeightsTotal100();

  const repoPath = path.resolve(inputPath);
  validateRepoPath(repoPath);

  const context: RepoContext = { repoPath };
  const categories: CategoryResult[] = [
    auditReadme(context),
    auditLicense(context),
    auditCi(context),
    auditTests(context),
    auditPackageMetadata(context),
    auditCommunity(context),
    auditDocs(context),
    auditRelease(context),
    auditAgentReadiness(context)
  ];

  const score = clamp(categories.reduce((sum, category) => sum + category.score, 0), 0, 100);

  return {
    repoPath,
    score,
    grade: gradeForScore(score),
    categories,
    summary: summarizeChecks(categories),
    recommendations: collectRecommendations(categories)
  };
}

function validateRepoPath(repoPath: string): void {
  let stats;
  try {
    stats = statSync(repoPath);
  } catch {
    throw new Error(`Repository path does not exist or is not readable: ${repoPath}`);
  }

  if (!stats.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${repoPath}`);
  }
}
