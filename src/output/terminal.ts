import pc from "picocolors";
import type { AuditReport } from "../audit/types.js";

export type TerminalOptions = {
  color: boolean;
};

export function renderTerminal(report: AuditReport, options: TerminalOptions = { color: true }): string {
  const c = options.color ? pc : noColor;
  const lines: string[] = [];
  const grade = colorGrade(`${report.grade}`, report.score, c);

  lines.push(`Repo Health Score: ${colorScore(`${report.score}/100`, report.score, c)} - ${grade}`);
  lines.push("");
  lines.push(`Checks: ${c.green(`${report.summary.passed} passed`)}, ${c.yellow(`${report.summary.warnings} warnings`)}, ${c.red(`${report.summary.failed} failed`)}`);
  lines.push("");
  appendRecommendationSection(lines, "Critical", report.recommendations.critical, c.red);
  appendRecommendationSection(lines, "Recommended", report.recommendations.recommended, c.yellow);
  appendRecommendationSection(lines, "Nice to have", report.recommendations.niceToHave, c.cyan);
  lines.push("Category breakdown");

  const maxLabelLength = Math.max(...report.categories.map((category) => category.label.length));
  for (const category of report.categories) {
    const label = category.label.padEnd(maxLabelLength + 2, " ");
    lines.push(`${label}${category.score}/${category.maxScore}`);
  }

  return lines.join("\n");
}

type Formatter = (input: string | number | null | undefined) => string;

type Colorizer = {
  bold: Formatter;
  green: Formatter;
  yellow: Formatter;
  red: Formatter;
  cyan: Formatter;
};

const noColor: Colorizer = {
  bold: stringify,
  green: stringify,
  yellow: stringify,
  red: stringify,
  cyan: stringify
};

function appendRecommendationSection(lines: string[], title: string, recommendations: string[], color: Formatter): void {
  if (recommendations.length === 0) {
    return;
  }

  lines.push(color(title));
  for (const recommendation of recommendations) {
    lines.push(`- ${recommendation}`);
  }
  lines.push("");
}

function colorScore(value: string, score: number, c: Colorizer): string {
  if (score >= 80) return c.green(value);
  if (score >= 60) return c.yellow(value);
  return c.red(value);
}

function colorGrade(value: string, score: number, c: Colorizer): string {
  return c.bold(colorScore(value, score, c));
}

function stringify(value: string | number | null | undefined): string {
  return String(value ?? "");
}
