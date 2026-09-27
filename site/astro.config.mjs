// @ts-check
import casoonPages from '@casoon/pages-theme';
import { defineConfig } from 'astro/config';

// Project page: https://casoon.github.io/rechenkiste/ — `base` is the GitHub Pages path.
export default defineConfig({
  site: 'https://casoon.github.io/rechenkiste',
  base: '/rechenkiste/',
  integrations: [
    casoonPages({
      name: 'rechenkiste',
      description:
        'Math practice app for primary school, grades 1 to 5. A demo of the AHA stack (Astro, htmx, Alpine.js) and @casoon/fragment-renderer.',
      repo: 'casoon/rechenkiste',
      version: '0.1.2',
      license: 'MIT',
      packages: [
        { label: 'Live app', href: 'https://rechenkiste.casoon.dev' },
        {
          label: 'fragment-renderer on npm',
          href: 'https://www.npmjs.com/package/@casoon/fragment-renderer',
        },
      ],
      docsGroups: {
        'getting-started': 'Getting started',
        architecture: 'Architecture',
        reference: 'Reference',
      },
      // An app, not a package: real screen captures sit on the start page instead.
      showcase: false,
    }),
  ],
});
