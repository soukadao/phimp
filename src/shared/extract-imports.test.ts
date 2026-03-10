import { describe, expect, test } from "vitest";
import { extractImports, extractPackageName } from "./extract-imports.js";

describe("extractPackageName", () => {
  test("returns package name for simple import", () => {
    expect(extractPackageName("lodash")).toBe("lodash");
  });

  test("returns package name for subpath import", () => {
    expect(extractPackageName("lodash/merge")).toBe("lodash");
  });

  test("returns scoped package name", () => {
    expect(extractPackageName("@types/node")).toBe("@types/node");
  });

  test("returns scoped package name with subpath", () => {
    expect(extractPackageName("@scope/pkg/utils")).toBe("@scope/pkg");
  });

  test("returns null for relative path starting with ./", () => {
    expect(extractPackageName("./foo")).toBeNull();
  });

  test("returns null for relative path starting with ../", () => {
    expect(extractPackageName("../bar")).toBeNull();
  });

  test("returns null for node: prefix", () => {
    expect(extractPackageName("node:fs")).toBeNull();
    expect(extractPackageName("node:path")).toBeNull();
  });

  test("returns null for Node.js builtins without prefix", () => {
    expect(extractPackageName("fs")).toBeNull();
    expect(extractPackageName("path")).toBeNull();
    expect(extractPackageName("http")).toBeNull();
    expect(extractPackageName("crypto")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(extractPackageName("")).toBeNull();
  });
});

describe("extractImports", () => {
  test("extracts default import", () => {
    const result = extractImports(`import foo from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts named import", () => {
    const result = extractImports(`import { foo } from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts namespace import", () => {
    const result = extractImports(`import * as foo from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts side-effect import", () => {
    const result = extractImports(`import 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts type import", () => {
    const result = extractImports(`import type { Foo } from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts re-export", () => {
    const result = extractImports(`export { foo } from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts star re-export", () => {
    const result = extractImports(`export * from 'pkg';`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("extracts require call", () => {
    const result = extractImports(`const foo = require('pkg');`);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });

  test("skips relative imports", () => {
    const code = `import foo from './local';\nimport bar from '../parent';`;
    expect(extractImports(code)).toEqual([]);
  });

  test("skips Node.js builtins", () => {
    const code = `import fs from 'node:fs';\nimport path from 'path';`;
    expect(extractImports(code)).toEqual([]);
  });

  test("handles multiple imports with correct line numbers", () => {
    const code = `import foo from 'pkg-a';\nimport bar from 'pkg-b';`;
    expect(extractImports(code)).toEqual([
      { packageName: "pkg-a", line: 1 },
      { packageName: "pkg-b", line: 2 },
    ]);
  });

  test("handles multi-line import", () => {
    const code = `import {\n  foo,\n  bar,\n} from 'pkg';`;
    expect(extractImports(code)).toEqual([{ packageName: "pkg", line: 4 }]);
  });

  test("extracts scoped package", () => {
    const result = extractImports(`import { foo } from '@scope/pkg';`);
    expect(result).toEqual([{ packageName: "@scope/pkg", line: 1 }]);
  });

  test("extracts subpath import as package name", () => {
    const result = extractImports(`import merge from 'lodash/merge';`);
    expect(result).toEqual([{ packageName: "lodash", line: 1 }]);
  });

  test("returns empty array for code with no imports", () => {
    expect(extractImports(`const x = 1;`)).toEqual([]);
  });

  test("deduplicates same package on same line", () => {
    const code = `export { a } from 'pkg'; export { b } from 'pkg';`;
    const result = extractImports(code);
    expect(result).toEqual([{ packageName: "pkg", line: 1 }]);
  });
});
