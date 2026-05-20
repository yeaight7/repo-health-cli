import type { AuditReport, CategoryResult, CheckResult, CheckStatus, RecommendationSeverity } from "./types.js";

export const CATEGORY_WEIGHTS = {
  readme: 20,
  license: 10,
  ci: 15,
  tests: 15,
  packageMetadata: 10,
  community: 10,
  docs: 8,
  release: 7,
  agentReadiness: 5
} as const;

export type CategoryId = keyof typeof CATEGORY_WEIGHTS;

const STATUS_VALUES: Record<CheckStatus, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0
};

export function assertWeightsTotal100(): void {
  const total = Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (total !== 100) {
    throw new Error(`Category weights must total 100, got ${total}`);
  }
}

export function scoreCategory(id: CategoryId, label: string, checks: CheckResult[]): CategoryResult {
  const maxScore = CATEGORY_WEIGHTS[id];
  if (checks.length === 0) {
    return { id, label, score: 0, maxScore, checks };
  }

  const rawScore = checks.reduce((sum, check) => sum + STATUS_VALUES[check.status], 0) / checks.length;
  const score = clamp(Math.round(rawScore * maxScore), 0, maxScore);
  return { id, label, score, maxScore, checks };
}

export function gradeForScore(score: number): AuditReport["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function summarizeChecks(categories: CategoryResult[]): AuditReport["summary"] {
  const checks = categories.flatMap((category) => category.checks);
  return {
    passed: checks.filter((check) => check.status === "pass").length,
    warnings: checks.filter((check) => check.status === "warn").length,
    failed: checks.filter((check) => check.status === "fail").length
  };
}

export function collectRecommendations(categories: CategoryResult[]): AuditReport["recommendations"] {
  const recommendations: AuditReport["recommendations"] = {
    critical: [],
    recommended: [],
    niceToHave: []
  };

  for (const check of categories.flatMap((category) => category.checks)) {
    if (check.status === "pass" || !check.recommendation) {
      continue;
    }

    const severity = check.severity ?? inferSeverity(check.status);
    recommendations[severity].push(check.recommendation);
  }

  return {
    critical: unique(recommendations.critical),
    recommended: unique(recommendations.recommended),
    niceToHave: unique(recommendations.niceToHave)
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function inferSeverity(status: CheckStatus): RecommendationSeverity {
  return status === "fail" ? "recommended" : "niceToHave";
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
