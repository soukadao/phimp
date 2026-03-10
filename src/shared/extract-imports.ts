import { builtinModules } from "node:module";
import type { ImportInfo } from "../entities/types.js";

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

export function extractPackageName(importPath: string): string | null {
  if (importPath === "") return null;
  if (importPath.startsWith(".")) return null;
  if (importPath.startsWith("node:")) return null;
  if (builtins.has(importPath)) return null;

  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }

  return importPath.split("/")[0] || null;
}

export function extractImports(code: string): ImportInfo[] {
  const results: ImportInfo[] = [];
  const seen = new Set<string>();

  const patterns = [
    /\bfrom\s+['"]([^'"]+)['"]/g,
    /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      const importPath = match[1];
      const packageName = extractPackageName(importPath);
      if (packageName === null) continue;

      const line = code.substring(0, match.index).split("\n").length;
      const key = `${line}:${packageName}`;

      if (!seen.has(key)) {
        seen.add(key);
        results.push({ packageName, line });
      }
    }
  }

  return results.sort((a, b) => a.line - b.line);
}
