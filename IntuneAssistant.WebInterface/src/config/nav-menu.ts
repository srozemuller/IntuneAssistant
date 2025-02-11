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
      title: "Documentation",
      items: [
        {
          title: "Intune Assistant Web",
          href: "/docs/web/getting-started/onboarding",
          description: "Information about the Intune Assistant Web",
        },
        {
          title: "Intune Assistant CLI",
          href: "/docs/cli/getting-started",
          description: "Information about the Intune Assistant CLI"
        }
      ],
    }
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
      title: "Migration",
      items: [
        {
          title: "Migrate policy assignments",
          href: "/assignments/migrate",
          description: "Migrate policy assignments based on a CSV file"
        },
        {
          title: "Restore",
          href: "/assignments/restore",
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
  ],
};
