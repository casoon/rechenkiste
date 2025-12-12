// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://rechenkiste.casoon.workers.dev/";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: siteUrl,
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
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
      name: "patch-container-file-urls",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          const workerDir = path.join(dir.pathname, "_worker.js");

          if (!fs.existsSync(workerDir)) {
            console.log("[patch-container] Worker-Verzeichnis nicht gefunden");
            return;
          }

          // Alle .js und .mjs Dateien im Worker-Verzeichnis durchsuchen
          const patchFiles = (/** @type {string} */ directory) => {
            const entries = fs.readdirSync(directory, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(directory, entry.name);
              if (entry.isDirectory()) {
                patchFiles(fullPath);
              } else if (
                entry.name.endsWith(".js") ||
                entry.name.endsWith(".mjs")
              ) {
                let code = fs.readFileSync(fullPath, "utf8");
                let modified = false;

                // Container API: hrefRoot: import.meta.url -> site URL
                if (code.includes("hrefRoot: import.meta.url")) {
                  code = code.replace(
                    /hrefRoot:\s*import\.meta\.url/g,
                    `hrefRoot: "${siteUrl}"`,
                  );
                  modified = true;
                }

                // file:/// URLs patchen
                if (code.includes("file:///")) {
                  // 1) new URL("file:///...") -> new URL(siteUrl)
                  code = code.replace(
                    /new URL\("file:[^"]*"\)/g,
                    `new URL("${siteUrl}")`,
                  );

                  // 2) hrefRoot: "file:///..." -> site URL
                  code = code.replace(
                    /"hrefRoot":\s*"file:\/\/\/[^"]*"/g,
                    `"hrefRoot":"${siteUrl}"`,
                  );

                  // 3) Andere dir-Pfade mit file:/// -> site URL
                  code = code.replace(
                    /"(cacheDir|outDir|srcDir|publicDir|buildClientDir|buildServerDir)":\s*"file:\/\/\/[^"]*"/g,
                    (_, key) => `"${key}":"${siteUrl}"`,
                  );

                  // 4) Fallback: nackte "file:///..."-Strings durch site URL ersetzen
                  code = code.replace(/"file:\/\/\/[^"]*"/g, `"${siteUrl}"`);
                  modified = true;
                }

                if (modified) {
                  fs.writeFileSync(fullPath, code, "utf8");
                  console.log(
                    "[patch-container] Gepatcht:",
                    path.relative(dir.pathname, fullPath),
                  );
                }
              }
            }
          };

          patchFiles(workerDir);
        },
      },
    },
  ],
});
