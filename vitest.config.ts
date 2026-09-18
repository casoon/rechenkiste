import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@domain": fromRoot("./src/server/domain"),
      "@i18n": fromRoot("./src/i18n"),
    },
  },
});
