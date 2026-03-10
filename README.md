# phimp

Detect phantom (hallucinated) imports in JS/TS projects.

AI that generates code sometimes imports packages that don't exist. phimp scans your source files and reports any imports not found in `node_modules`.

## Install

```bash
npm install -g phimp
```

## Usage

```bash
phimp [directory]
```

Scans `.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.mjs`, `.cts`, `.cjs` files in the target directory (default: current directory).

Test files (`*.test.*`, `*.spec.*`) and `node_modules`, `dist`, `.git`, `coverage` directories are excluded by default.

### Options

| Option          | Description            |
| --------------- | ---------------------- |
| `--json`        | Output results as JSON |
| `-V, --version` | Show version           |
| `-h, --help`    | Show help              |

### Examples

```bash
# Scan current directory
phimp

# Scan specific directory
phimp src/

# JSON output (for CI/AI integration)
phimp --json
```

### Exit codes

| Code | Meaning                  |
| ---- | ------------------------ |
| `0`  | No phantom imports found |
| `1`  | Phantom imports detected |

## JSON output format

```json
{
  "phantoms": [
    {
      "filePath": "src/index.ts",
      "packageName": "non-existent-pkg",
      "line": 3
    }
  ],
  "scannedFiles": 12
}
```

## License

MIT
