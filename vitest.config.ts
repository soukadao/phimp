import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          include: ["src/**/*.test.ts"],
          name: "unit",
          environment: "node",
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["src/**"],
      exclude: ["src/**/*.test.ts", "src/cli.ts"],
    },
  },
});
