import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import astroParser from "astro-eslint-parser";
import tsParser from "@typescript-eslint/parser";

const tailwindRules = {
  // Keine doppelten Klassen
  "better-tailwindcss/no-duplicate-classes": "error",
  // Keine widersprüchlichen Klassen
  "better-tailwindcss/no-conflicting-classes": "warn",
  // Shorthand-Klassen bevorzugen (w-40 h-40 -> size-40)
  "better-tailwindcss/enforce-shorthand-classes": "warn",
};

const tailwindSettings = {
  "better-tailwindcss": {
    entryPoint: "src/styles/base.css",
  },
};

export default [
  {
    files: ["**/*.astro"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    settings: tailwindSettings,
    rules: tailwindRules,
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    languageOptions: {
      parser: tsParser,
    },
    settings: tailwindSettings,
    rules: tailwindRules,
  },
];
