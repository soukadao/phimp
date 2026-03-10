import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import type { PhantomImport, ScanResult } from "../../entities/types.js";
import { extractImports } from "../../shared/extract-imports.js";
import { checkPackageExists } from "../../shared/resolve-package.js";

const TARGET_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".mjs",
  ".cts",
  ".cjs",
]);

const IGNORE_DIRS = new Set(["node_modules", "dist", ".git", "coverage"]);

const IGNORE_PATTERNS = [/\.test\.[cm]?[jt]sx?$/, /\.spec\.[cm]?[jt]sx?$/];

export interface ScanOptions {
  ignorePatterns?: RegExp[];
}

function collectFiles(dir: string, ignorePatterns: RegExp[]): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        files.push(...collectFiles(fullPath, ignorePatterns));
      }
    } else if (TARGET_EXTENSIONS.has(extname(entry.name))) {
      if (!ignorePatterns.some((p) => p.test(entry.name))) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

export function scanFile(
  filePath: string,
  projectRoot: string,
): PhantomImport[] {
  const code = readFileSync(filePath, "utf-8");
  const imports = extractImports(code);
  const phantoms: PhantomImport[] = [];

  for (const imp of imports) {
    if (!checkPackageExists(imp.packageName, projectRoot)) {
      phantoms.push({
        filePath: relative(projectRoot, filePath),
        packageName: imp.packageName,
        line: imp.line,
      });
    }
  }

  return phantoms;
}

export function scan(targetDir: string, options?: ScanOptions): ScanResult {
  const ignorePatterns = [
    ...IGNORE_PATTERNS,
    ...(options?.ignorePatterns ?? []),
  ];
  const files = collectFiles(targetDir, ignorePatterns);
  const phantoms: PhantomImport[] = [];

  for (const file of files) {
    phantoms.push(...scanFile(file, targetDir));
  }

  return { phantoms, scannedFiles: files.length };
}
