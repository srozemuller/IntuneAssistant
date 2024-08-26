import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import starlight from '@astrojs/starlight';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: process.env.CI ? 'https://astro-shadcn-ui-template.vercel.app' : 'http://localhost:4321',
  integrations: [
    react(),
    icon(),
    tailwind({
      applyBaseStyles: false
    }),
    starlight({
      title: 'Intune Assistant Docs',
      social: {
        github: 'https://github.com/srozemuller/intuneAssistant',
      },
      customCss: [
        './src/styles/globals.css',
        './src/styles/starlight-overrides.css',
      ],
      logo: {
        src: "./public/favicon.svg",
        replacesTitle: false,
      },
      components: {
        Header: "./src/layouts/docs-header.astro",
      },
      sidebar: [
        {
          label: 'Getting started',
          collapsed: true,
          autogenerate: {
            directory: 'docs/cli/getting-started',
          },
        },
        {
          label: 'Commands',
          collapsed: true,
          items: [
            {
              label: 'Authentication',
              autogenerate: {
                collapsed: true,
                directory: 'docs/cli/command-reference/authentication'
              }
            },
              {
              label: 'Apps',
              autogenerate: {
                collapsed: true,
                directory: 'docs/cli/command-reference/assignments'
              }
            },
            {
              label: 'Assignments',
              autogenerate: {
                collapsed: true,
                directory: 'docs/cli/command-reference/apps'
              }
            },
          ],
        },
      ],
      head: [
        {
          tag: 'script',
          content: `
            (function() {
                const getThemePreference = () => {
                    if (typeof localStorage !== 'undefined' && localStorage.getItem('starlight-theme')) {
                        return localStorage.getItem('starlight-theme');
                    }
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                };
                const isDark = getThemePreference() === 'dark';
                document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            })();
          `,
        },
      ],
    }),
  ],
  output: "hybrid",
  adapter: netlify(),
});