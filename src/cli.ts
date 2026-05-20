#!/usr/bin/env node
import { Command } from "commander";
import { auditRepository } from "./audit/index.js";
import { renderJson } from "./output/json.js";
import { renderTerminal } from "./output/terminal.js";

const STRICT_THRESHOLD = 80;

const program = new Command();

program
  .name("repo-health")
  .description("Audit a local repository for open-source readiness.")
  .version("0.1.0");

program
  .command("audit")
  .argument("<path>", "local repository path to audit")
  .option("--json", "print machine-readable JSON only")
  .option("--no-color", "disable colored terminal output")
  .option("--strict", `exit non-zero if score is below ${STRICT_THRESHOLD}`)
  .action((targetPath: string, options: { json?: boolean; color?: boolean; strict?: boolean }) => {
    try {
      const report = auditRepository(targetPath);
      const output = options.json ? renderJson(report) : renderTerminal(report, { color: options.color !== false });
      process.stdout.write(`${output}\n`);

      if (options.strict && report.score < STRICT_THRESHOLD) {
        process.exitCode = 2;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Error: ${message}\n`);
      process.exitCode = 1;
    }
  });

program.parse();
