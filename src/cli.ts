#!/usr/bin/env node
import { Command, InvalidArgumentError } from "commander";
import { auditRepository } from "./audit/index.js";
import { renderJson } from "./output/json.js";
import { renderTerminal } from "./output/terminal.js";

const STRICT_THRESHOLD = 80;

const program = new Command();

program
  .name("repo-health")
  .description("Audit a local repository for open-source readiness.")
  .version("0.1.1");

program
  .command("audit")
  .argument("<path>", "local repository path to audit")
  .option("--json", "print machine-readable JSON only")
  .option("--no-color", "disable colored terminal output")
  .option("--strict", `exit non-zero if score is below ${STRICT_THRESHOLD}`)
  .option("--threshold <score>", "score threshold for --strict", parseThreshold, STRICT_THRESHOLD)
  .action((targetPath: string, options: { json?: boolean; color?: boolean; strict?: boolean; threshold: number }) => {
    try {
      const report = auditRepository(targetPath);
      const output = options.json ? renderJson(report) : renderTerminal(report, { color: options.color !== false });
      process.stdout.write(`${output}\n`);

      if (options.strict && report.score < options.threshold) {
        process.exitCode = 2;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Error: ${message}\n`);
      process.exitCode = 1;
    }
  });

program.parse();

function parseThreshold(value: string): number {
  const threshold = Number(value);
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100) {
    throw new InvalidArgumentError("must be an integer from 0 to 100");
  }

  return threshold;
}
