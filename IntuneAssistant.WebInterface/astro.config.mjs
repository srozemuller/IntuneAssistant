import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import starlight from '@astrojs/starlight';
import netlify from '@astrojs/netlify';
import sentry from "@sentry/astro";
import { BrowserTracing } from '@sentry/tracing'
// https://astro.build/config
export default defineConfig({
  site: process.env.CI ? 'https://astro-shadcn-ui-template.vercel.app' : 'http://localhost:4321',
  integrations: [
    react(),
    icon(),
    tailwind({
      applyBaseStyles: false
    }),
    sentry({
      dsn: process.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: "intuneassistant",
        authToken: process.env.SENTRY_AUTH_TOKEN
      },
      tracesSampleRate: 0.3,
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
          label: 'Intune Assistant',
          collapsed: true,
          items: [
            {
              label: 'What is Intune Assistant?',
              link: '/docs/what-is-intune-assistant'  // Link to your markdown file
            },
            {
              label: 'Assistant',
              autogenerate: {
                collapsed: true,
                directory: 'docs/assistant'
              }
            },
            {
              label: 'Rollout',
              autogenerate: {
                collapsed: true,
                directory: 'docs/rollout'
              }
            }
          ],
        },
        {
          label: 'Intune CLI',
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
  output: "static",
  adapter: netlify(),
});