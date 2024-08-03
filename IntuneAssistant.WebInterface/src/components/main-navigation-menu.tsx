import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navMenuConfig } from "@/config/nav-menu";
import type { MenuItem } from "@/types";
import { Badge } from "lucide-react";

const links = navMenuConfig.links;
const main = navMenuConfig.mainNav[0];
const docs = navMenuConfig.docsNav?.length ? navMenuConfig.docsNav[0] : null;
const assistant = navMenuConfig.assistantNav?.length ? navMenuConfig.assistantNav[0] : null;

export function MainNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
      <NavigationMenuItem>
          <NavigationMenuTrigger>{main.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/src/components/onboarding-card"
                  >
                    <Icons.Logo className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Onboarding
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                    Walk through the process of setting up your Intune environment.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              {main.items?.map((page) => (
                <ListItem key={page.title} {...page} />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {docs && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>{docs.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {docs.items?.map((page) => (
                  <ListItem key={page.title} {...page} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {assistant && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>{assistant.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {assistant.items?.map((page) => (
                  <ListItem key={page.title} {...page} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {links && (
          <NavigationMenuItem>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={navigationMenuTriggerStyle()}
                {...(link.forceReload ? { "data-astro-reload": true } : {})}
              >
                {link.title}
              </a>
            ))}
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem: React.FC<MenuItem> = ({
  title,
  href,
  description,
  launched,
  disabled,
  external,
  forceReload,
}) => {
  const target = external ? "_blank" : undefined;

  return (
    <li>
      <a
        target={target}
        href={disabled ? undefined : href}
        {...(forceReload ? { "data-astro-reload": true } : {})}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled
            ? "text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
            : ""
        )}
      >
        <div className="flex items-center text-sm font-medium leading-none">
          <span className="mr-2">{title}</span>
          {disabled ? (
            <Badge
              radius="sm"
              className="h-5 px-1.5 text-xs font-medium"
            >
              SOON
            </Badge>
          ) : null}
          {launched ? (
            <Badge
              radius="sm"
              className="h-5 px-1.5 text-xs font-medium bg-[#ebf5ff] hover:bg-[#ebf5ff] text-[#0068d6]"
            >
              NEW
            </Badge>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </a>
    </li>
  );
};
ListItem.displayName = "ListItem";