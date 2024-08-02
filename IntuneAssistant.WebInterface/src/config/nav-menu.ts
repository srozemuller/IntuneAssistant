import type { NavMenuConfig } from "@/types";

export const navMenuConfig: NavMenuConfig = {
  mainNav: [
    {
      title: "Getting started",
      items: [
        {
          title: "Onboarding",
          href: "/onboarding",
          description: "Onboard customers onto the Fusion platform."
        },
        {
          title: "Intune Configuration",
          href: "/intune-config",
          description: "Show Intune configuration overview"
        },
        {
          title: "Security Configuration",
          href: "/security-config",
          description: "Show Security configuration overview"
        }
      ]
    }
  ],
  docsNav: [
    {
      title: "Documentation",
      items: [
        {
          title: "About Intune Assistant",
          href: "/docs/intune-assistant",
          description: "A landing page for all Intune Assistant documentation",
        },
        {
          title: "Intune Assistant CLI",
          href: "/docs/cli",
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
