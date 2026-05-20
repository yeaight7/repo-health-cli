import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { auditRepository } from "../src/audit/index.js";
import { CATEGORY_WEIGHTS } from "../src/audit/scoring.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const fixturesPath = path.join(__dirname, "fixtures");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");

describe("auditRepository", () => {
  it("produces a low bounded score and critical recommendations for an empty repo", () => {
    const report = auditRepository(path.join(fixturesPath, "empty-repo"));

    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThan(50);
    expect(report.recommendations.critical.length).toBeGreaterThan(0);
    expect(report.grade).toBe("F");
  });

  it("produces a high score for a healthy repo", () => {
    const report = auditRepository(path.join(fixturesPath, "healthy-repo"));

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.categories).toHaveLength(9);
    expect(report.recommendations.critical).toEqual([]);
  });

  it("produces mixed check states for a partial repo", () => {
    const report = auditRepository(path.join(fixturesPath, "partial-repo"));
    const statuses = report.categories.flatMap((category) => category.checks.map((check) => check.status));

    expect(statuses).toContain("pass");
    expect(statuses).toContain("warn");
    expect(statuses).toContain("fail");
    expect(report.score).toBeGreaterThan(0);
    expect(report.score).toBeLessThan(80);
  });

  it("keeps scores within 0-100", () => {
    for (const fixture of ["empty-repo", "partial-repo", "healthy-repo", "docs-only-repo", "python-repo", "broad-permissions-repo"]) {
      const report = auditRepository(path.join(fixturesPath, fixture));
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    }
  });

  it("detects broad workflow permissions", () => {
    const report = auditRepository(path.join(fixturesPath, "broad-permissions-repo"));
    const ci = report.categories.find((category) => category.id === "ci");
    const permissions = ci?.checks.find((check) => check.id === "workflow-permissions");

    expect(permissions?.status).toBe("warn");
  });

  it("detects Python metadata without requiring Node metadata", () => {
    const report = auditRepository(path.join(fixturesPath, "python-repo"));
    const metadata = report.categories.find((category) => category.id === "packageMetadata");

    expect(metadata?.checks[0]).toMatchObject({
      id: "python-metadata",
      status: "warn"
    });
  });

  it("keeps JSON report shape stable", () => {
    const report = auditRepository(path.join(fixturesPath, "healthy-repo"));

    expect(Object.keys(report)).toEqual(["repoPath", "score", "grade", "categories", "summary", "recommendations"]);
    expect(report.summary).toEqual({
      passed: expect.any(Number),
      warnings: expect.any(Number),
      failed: expect.any(Number)
    });
    expect(report.recommendations).toEqual({
      critical: expect.any(Array),
      recommended: expect.any(Array),
      niceToHave: expect.any(Array)
    });
    expect(report.categories[0]).toEqual({
      id: expect.any(String),
      label: expect.any(String),
      score: expect.any(Number),
      maxScore: expect.any(Number),
      checks: expect.any(Array)
    });
  });

  it("fails clearly for a missing path", () => {
    expect(() => auditRepository(path.join(fixturesPath, "missing"))).toThrow(/does not exist|not readable/);
  });

  it("fails clearly for a file path", () => {
    expect(() => auditRepository(path.join(fixturesPath, "partial-repo", "README.md"))).toThrow(/not a directory/);
  });

  it("category weights sum to 100", () => {
    const total = Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

    expect(total).toBe(100);
  });
});

describe("CLI output", () => {
  it("prints valid JSON only with --json", () => {
    const output = execFileSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "partial-repo"), "--json"], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    const parsed = JSON.parse(output);
    expect(parsed.repoPath).toContain("partial-repo");
    expect(output).not.toContain("Repo Health Score");
  });

  it("exits non-zero in strict mode below threshold", () => {
    const result = spawnSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "empty-repo"), "--strict"], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("Repo Health Score");
  });

  it("exits zero in strict mode when custom threshold is lower than score", () => {
    const result = spawnSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "empty-repo"), "--strict", "--threshold", "5"], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
  });

  it("exits zero in strict mode at or above threshold", () => {
    const result = spawnSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "healthy-repo"), "--strict"], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
  });

  it("exits one and prints a clear error for invalid paths", () => {
    const result = spawnSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "missing")], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Repository path does not exist or is not readable");
  });

  it("exits one for invalid strict threshold values", () => {
    const result = spawnSync(process.execPath, [tsxCli, "src/cli.ts", "audit", path.join(fixturesPath, "healthy-repo"), "--strict", "--threshold", "101"], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("must be an integer from 0 to 100");
  });
});
