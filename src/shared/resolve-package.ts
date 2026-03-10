import { existsSync } from "node:fs";
import { join } from "node:path";

export function checkPackageExists(
  packageName: string,
  projectRoot: string,
): boolean {
  return existsSync(join(projectRoot, "node_modules", packageName));
}
