import type { NavMenuConfig } from "@/types";

export const navMenuConfig: NavMenuConfig = {
  rolloutFAQ: {
    title: "FAQ",
    items: [
      {
        title: "General Questions",
        href: "/rollout/faq/general",
        description: "Answers to common questions about rollout management"
      },
      // Add more FAQ items as needed
    ]
  },
  rolloutNav: [
    {
      title: "Rollout",
      items: [
        {
          title: "Assignments Rollout",
          href: "/rollout/assignments",
          description: "Bulk rollout assignments management",
        },
      ]
    }
  ],
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
  productsNav: {
    title: "Products",
    items: [
      {
        title: "Assistant",
        href: "/assistant",
        badge: "Community",
        description: "The community tool for help you with Intune management."
      },
      {
        title: "Rollout",
        href: "/rollout",
        badge: "Premium",
        description: "Advanced feature rollout management for your Intune environment."
      }
    ]
  },
  assistantNav: [
    {
      title: "Assignments",
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
        }
      ],
    }
  ],
  resourcesNav: [
    {
      title: "Policies",
      items: [
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
