import { describe, expect, test } from "vitest";
import { checkPackageExists } from "./resolve-package.js";

describe("checkPackageExists", () => {
  const projectRoot = process.cwd();

  test("returns true for existing package", () => {
    expect(checkPackageExists("commander", projectRoot)).toBe(true);
  });

  test("returns false for non-existing package", () => {
    expect(
      checkPackageExists(
        "this-package-definitely-does-not-exist-xyz",
        projectRoot,
      ),
    ).toBe(false);
  });

  test("returns true for scoped package", () => {
    expect(checkPackageExists("@types/node", projectRoot)).toBe(true);
  });
});
