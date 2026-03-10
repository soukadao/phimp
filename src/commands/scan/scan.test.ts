import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { scan, scanFile } from "./scan.js";

describe("scanFile", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "phimp-test-"));
    mkdirSync(join(tempDir, "node_modules", "existing-pkg"), {
      recursive: true,
    });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("detects phantom import", () => {
    const filePath = join(tempDir, "test.ts");
    writeFileSync(filePath, `import foo from 'non-existent-pkg';`);

    const result = scanFile(filePath, tempDir);
    expect(result).toEqual([
      {
        filePath: "test.ts",
        packageName: "non-existent-pkg",
        line: 1,
      },
    ]);
  });

  test("does not flag existing packages", () => {
    const filePath = join(tempDir, "test.ts");
    writeFileSync(filePath, `import foo from 'existing-pkg';`);

    const result = scanFile(filePath, tempDir);
    expect(result).toEqual([]);
  });

  test("does not flag relative imports", () => {
    const filePath = join(tempDir, "test.ts");
    writeFileSync(filePath, `import foo from './local';`);

    const result = scanFile(filePath, tempDir);
    expect(result).toEqual([]);
  });

  test("does not flag Node.js builtins", () => {
    const filePath = join(tempDir, "test.ts");
    writeFileSync(filePath, `import fs from 'node:fs';`);

    const result = scanFile(filePath, tempDir);
    expect(result).toEqual([]);
  });
});

describe("scan", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "phimp-test-"));
    mkdirSync(join(tempDir, "node_modules", "real-pkg"), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("scans directory and finds phantoms", () => {
    writeFileSync(join(tempDir, "a.ts"), `import foo from 'phantom-pkg';`);
    writeFileSync(join(tempDir, "b.ts"), `import bar from 'real-pkg';`);

    const result = scan(tempDir);
    expect(result.scannedFiles).toBe(2);
    expect(result.phantoms).toEqual([
      {
        filePath: "a.ts",
        packageName: "phantom-pkg",
        line: 1,
      },
    ]);
  });

  test("ignores node_modules directory", () => {
    writeFileSync(
      join(tempDir, "node_modules", "real-pkg", "index.js"),
      `import foo from 'another-pkg';`,
    );
    writeFileSync(join(tempDir, "main.ts"), `import bar from 'real-pkg';`);

    const result = scan(tempDir);
    expect(result.scannedFiles).toBe(1);
    expect(result.phantoms).toEqual([]);
  });

  test("scans subdirectories", () => {
    mkdirSync(join(tempDir, "src"));
    writeFileSync(
      join(tempDir, "src", "index.ts"),
      `import foo from 'phantom-pkg';`,
    );

    const result = scan(tempDir);
    expect(result.scannedFiles).toBe(1);
    expect(result.phantoms.length).toBe(1);
  });

  test("returns empty when no phantoms found", () => {
    writeFileSync(join(tempDir, "main.ts"), `import foo from 'real-pkg';`);

    const result = scan(tempDir);
    expect(result.phantoms).toEqual([]);
  });

  test("returns zero scanned files for empty directory", () => {
    const result = scan(tempDir);
    expect(result.scannedFiles).toBe(0);
    expect(result.phantoms).toEqual([]);
  });
});
