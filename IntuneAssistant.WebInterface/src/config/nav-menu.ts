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
          href: "/docs/web/getting-started",
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
          title: "Configuration Policies",
          href: "/policies/configuration",
          description: "Configuration Policy overview",
        },
        {
          title: "Configuration Settings",
          href: "/policies/configuration/settings",
          description: "Configuration Settings overview",
        },
        {
          title: "Conditional Access Policies",
          href: "/policies/ca",
          description: "Information about Conditional Access Policies"
        }
      ],
    }
  ],
  links: [
    // {
    //   title: "Example",
    //   href: "/example",
    //   description: "this is an example link",
    // },
  ],
};
