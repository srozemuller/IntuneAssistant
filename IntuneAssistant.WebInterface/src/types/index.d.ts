export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MenuItem = NavItem & {
  image?: string;
  title: string;
  href: string;
  description?: string;
  disabled?: boolean;
  launched?: boolean;
  external?: boolean;
  forceReload?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: MenuItem[];
    }
);

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
};

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};


export type NavMenuConfig = {
  mainNav: SidebarNavItem[];
  docsNav?: SidebarNavItem[];
  assistantNav?: SidebarNavItem[];
  resourcesNav?: SidebarNavItem[];
  comparatorNav?: SidebarNavItem[];
  migrationNav?: SidebarNavItem[];
  productsNav: SidebarNavItem[];
  rolloutFAQ?: NavItem;
  rolloutNav?: NavItem[];
  links?: {
    title: string;
    href: string;
    description?: string;
    forceReload?: boolean;
  }[];
};

export type DashboardConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

export type SubscriptionPlan = {
  name: string;
  description: string;
  stripePriceId: string;
};

// Animes types
export type Airing = {
  id: number;
  episode: number;
  airingAt: number;
  media: Media;
};

export type Media = {
  id: number;
  title: Title;
  coverImage: CoverImage;
  isAdult: boolean;
};

type Title = {
  userPreferred: string;
};

type CoverImage = {
  extraLarge: string;
  large: string;
};

export type InfoLdg = {
  title: string;
  image: string;
  description: string;
  list: InfoList[];
};
