export type CheckStatus = "pass" | "warn" | "fail";

export type RecommendationSeverity = "critical" | "recommended" | "niceToHave";

export type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  recommendation?: string;
  severity?: RecommendationSeverity;
};

export type CategoryResult = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  checks: CheckResult[];
};

export type AuditReport = {
  repoPath: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categories: CategoryResult[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
  };
  recommendations: {
    critical: string[];
    recommended: string[];
    niceToHave: string[];
  };
};

export type RepoContext = {
  repoPath: string;
};
