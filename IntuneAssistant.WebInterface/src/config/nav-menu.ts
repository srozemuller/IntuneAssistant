import type { NavMenuConfig } from "@/types";

export const navMenuConfig: NavMenuConfig = {
  mainNav: [
    {
      title: "Getting started",
      items: [
        {
          title: "About Intune Assistant",
          href: "/about",
          description: "All info about Intune Assistant",
        },
      ]
    }
  ],
  docsNav: [
    {
      title: "Docs",
      href: "/docs",
    },
  ],
  assistantNav: [
    {
      title: "Assistant",
      items: [
        {
          title: "Assignments Overview",
          href: "/assignments/overview",
          description: "Information about all assignments"
        },
        {
          title: "Application Assignments",
          href: "/assignments/apps",
          description: "Information about application assignments and there installation type"
        },
        {
          title: "Configuration Settings",
          href: "/policies/configuration/settings",
          description: "Configuration Settings overview",
        },
      ],
    }
  ],
  resourcesNav: [
    {
      title: "Resources",
      items: [
        {
          title: "Configuration Policies",
          href: "/policies/configuration",
          description: "Configuration Policy overview",
        },
        {
          title: "Conditional Access Policies",
          href: "/policies/ca",
          description: "Information about Conditional Access Policies"
        },
      ]
    }
  ],
  comparatorNav: [
    {
      title: "Comparator",
      items: [
        {
          title: "Compare Policy Settings",
          href: "/compare/settings",
          description: "Configuration Policy setting comparison",
        },
      ]
    }
  ],
  migrationNav: [
    {
      title: "Rollout",
      items: [
        {
          title: "Rollout policy assignments",
          href: "/rollout/assignments",
          description: "Rollout policy assignments based on a CSV file"
        },
        {
          title: "Restore",
          href: "/assignments/restore",
          disabled: true,
          description: "Restore assignments based on backup"
        }
      ]
    }
  ],
  links: [
    {
      title: "FAQ",
      href: "/faq",
      description: "Frequently asked questions",
    },
    {
      title: "Docs",
      href: "/docs",
      description: "Documentation",
    },
  ],
};
