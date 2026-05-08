import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["lib/**"],
      exclude: [
        "node_modules",
        ".next",
        "lib/api.ts", // useApi is a React hook — covered by integration tests, not unit tests
      ],
    },

  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
