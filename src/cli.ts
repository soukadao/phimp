import { resolve } from "node:path";
import { program } from "commander";
import pkg from "../package.json" with { type: "json" };
import { scan } from "./commands/scan/index.js";

program.name(pkg.name).description(pkg.description).version(pkg.version);

program
  .argument("[directory]", "directory to scan", ".")
  .option("--json", "output results as JSON")
  .action((directory: string, options: { json?: boolean }) => {
    const targetDir = resolve(directory);
    const result = scan(targetDir);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      if (result.phantoms.length > 0) process.exit(1);
      return;
    }

    if (result.phantoms.length === 0) {
      console.log(
        `Scanned ${result.scannedFiles} files. No phantom imports found.`,
      );
      return;
    }

    console.error(
      `Found ${result.phantoms.length} phantom import(s) in ${result.scannedFiles} files:\n`,
    );
    for (const p of result.phantoms) {
      console.error(
        `  ${p.filePath}:${p.line} - "${p.packageName}" not found in node_modules`,
      );
    }
    process.exit(1);
  });

program.parse();
