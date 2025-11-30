// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      // @see https://github.com/dai-shi/waku/issues/943
      alias: import.meta.env?.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : undefined,
    },
  },
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en", "uk"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    {
      name: "file-url-patcher",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          const fs = await import("node:fs/promises");
          const path = await import("node:path");

          const workerPath = path.join(dir.pathname, "_worker.js", "index.js");

          try {
            let content = await fs.readFile(workerPath, "utf-8");

            // Replace file:/// URLs with relative paths for Cloudflare Workers
            const fileUrlPattern = /file:\/\/\/[^"'\s]+/g;
            content = content.replace(fileUrlPattern, (match) => {
              // Extract just the filename from the path
              const filename = match.split("/").pop();
              return `./${filename}`;
            });

            await fs.writeFile(workerPath, content, "utf-8");
            console.log("Patched file:/// URLs in worker bundle");
          } catch (error) {
            console.warn("Could not patch worker bundle:", error);
          }
        },
      },
    },
  ],
});
