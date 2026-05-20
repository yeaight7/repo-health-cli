import type { AuditReport } from "../audit/types.js";

export function renderJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}
