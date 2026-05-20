import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = mkdtempSync(path.join(tmpdir(), "repo-health-pack-"));

try {
  runNpm(["pack", "--dry-run"], repoRoot);

  const packJson = runNpm(["pack", "--json", "--pack-destination", tempRoot], repoRoot);
  const [packResult] = JSON.parse(packJson);
  const tarballPath = path.join(tempRoot, packResult.filename);

  if (!existsSync(tarballPath)) {
    throw new Error(`Packed tarball not found: ${tarballPath}`);
  }

  const installDir = path.join(tempRoot, "install");
  const targetRepo = path.join(tempRoot, "target-repo");
  mkdirSync(installDir);
  mkdirSync(targetRepo);
  writeFileSync(path.join(installDir, "package.json"), JSON.stringify({ private: true }, null, 2));
  writeFileSync(path.join(targetRepo, "README.md"), "# Smoke Target\n\n## Usage\n\n```bash\nrepo-health audit .\n```\n");

  runNpm(["install", "--no-audit", "--no-fund", tarballPath], installDir);

  const binPath = path.join(installDir, "node_modules", ".bin", process.platform === "win32" ? "repo-health.cmd" : "repo-health");
  const output = process.platform === "win32"
    ? run("cmd", ["/c", binPath, "audit", targetRepo, "--json"], installDir)
    : run(binPath, ["audit", targetRepo, "--json"], installDir);

  const report = JSON.parse(output);
  if (typeof report.score !== "number" || !Array.isArray(report.categories)) {
    throw new Error("Packed CLI did not produce a valid audit report");
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}\n${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`);
  }

  return result.stdout;
}

function runNpm(args, cwd) {
  return process.platform === "win32" ? run("cmd.exe", ["/d", "/s", "/c", "npm", ...args], cwd) : run("npm", args, cwd);
}
