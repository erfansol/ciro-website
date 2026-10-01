import { defineConfig } from "vitest/config";
import path from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      // Next's path alias, mirrored for the test runner.
      "@": root,
      // `server-only` throws by design when imported outside a React Server
      // Component. Under vitest we're exercising the pure helpers in those
      // modules directly, so point it at an inert stub.
      "server-only": path.resolve(root, "test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
