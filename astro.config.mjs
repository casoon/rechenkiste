// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import siteFiles from "@casoon/astro-site-files";

const siteUrl = "https://rechenkiste.casoon.workers.dev/";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: siteUrl,
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ["**/.wrangler/**"],
      },
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
    siteFiles({
      sitemap: {
        i18n: {
          defaultLocale: "de",
          locales: {
            de: "de",
            en: "en",
            uk: "uk",
          },
        },
        sources: [
          () =>
            Promise.resolve([
              // Deutsch
              { loc: "/" },
              { loc: "/auswahl" },
              { loc: "/technik" },
              // English
              { loc: "/en" },
              { loc: "/en/auswahl" },
              { loc: "/en/technik" },
              // Ukrainian
              { loc: "/uk" },
              { loc: "/uk/auswahl" },
              { loc: "/uk/technik" },
            ]),
        ],
      },
      robots: {},
      llms: {
        title: "Rechenkiste",
        description:
          "Kostenlose, interaktive Mathe-Übungen für Grundschulkinder der Klassen 1 bis 5. Rechnen, Geometrie, Uhrzeit und Sachaufgaben.",
        sections: [
          {
            title: "Hauptseiten",
            links: [
              {
                title: "Startseite (Deutsch)",
                url: "/",
                description:
                  "Auswahl von Klasse und Aufgabenanzahl zum Starten der Übungen.",
              },
              {
                title: "Aufgabenauswahl (Deutsch)",
                url: "/auswahl",
                description:
                  "Gezielte Auswahl einzelner Mathe-Kategorien und Aufgabentypen.",
              },
              {
                title: "Technik & Architektur (Deutsch)",
                url: "/technik",
                description:
                  "Dokumentation über den AHA-Stack (Astro, HTMX, Alpine.js) und die Architektur.",
              },
              {
                title: "Home (English)",
                url: "/en",
                description:
                  "Grade level and task count selection to start math practice.",
              },
              {
                title: "Task Selection (English)",
                url: "/en/auswahl",
                description:
                  "Custom selection of specific math categories and exercises.",
              },
              {
                title: "Tech & Architecture (English)",
                url: "/en/technik",
                description:
                  "Technical documentation about the AHA-stack and application details.",
              },
              {
                title: "Головна (Ukrainian)",
                url: "/uk",
                description:
                  "Вибір класу та кількості завдань для початку вправ.",
              },
              {
                title: "Вибір завдань (Ukrainian)",
                url: "/uk/auswahl",
                description:
                  "Цілеспрямований вибір конкретних математичних категорій.",
              },
              {
                title: "Технічна інформація (Ukrainian)",
                url: "/uk/technik",
                description:
                  "Технічна документація про AHA-Stack та архітектуру.",
              },
            ],
          },
        ],
      },
    }),
  ],
});
