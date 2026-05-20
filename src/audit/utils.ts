import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export function pathExists(repoPath: string, relativePath: string): boolean {
  return existsSync(path.join(repoPath, relativePath));
}

export function isDirectory(repoPath: string, relativePath: string): boolean {
  const target = path.join(repoPath, relativePath);
  return existsSync(target) && statSync(target).isDirectory();
}

export function readText(repoPath: string, relativePath: string): string | undefined {
  const target = path.join(repoPath, relativePath);
  if (!existsSync(target)) {
    return undefined;
  }

  return readFileSync(target, "utf8");
}

export function readJson<T>(repoPath: string, relativePath: string): T | undefined {
  const text = readText(repoPath, relativePath);
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

export function listFiles(repoPath: string, relativePath: string): string[] {
  const target = path.join(repoPath, relativePath);
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    return [];
  }

  return readdirSync(target);
}

export function walkFiles(root: string, current = root): string[] {
  if (!existsSync(current)) {
    return [];
  }

  const entries = readdirSync(current, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
      continue;
    }

    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(root, fullPath));
    } else {
      files.push(path.relative(root, fullPath).replaceAll(path.sep, "/"));
    }
  }

  return files;
}

export function hasAnyPath(repoPath: string, relativePaths: string[]): boolean {
  return relativePaths.some((relativePath) => pathExists(repoPath, relativePath));
}
