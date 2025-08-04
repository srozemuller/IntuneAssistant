import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import authService from "@/scripts/msalservice";
import {INTUNEASSISTANT_TENANT_INFO, INTUNEASSISTANT_TENANT_STYLE} from "@/components/constants/apiUrls";
import authDataMiddleware from "@/components/middleware/fetchData";


export function MainNavigationMenu() {
    const [isLicensed, setIsLicensed] = useState(false);
    const [currentTenantId, setCurrentTenantId] = React.useState<string>("");
    const [logoUrl, setLogoUrl] = useState<string>("/images/launch.jpg");
    const [currentContext, setCurrentContext] = useState<string>("assistant");

    // Determine current context based on path
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/rollout')) {
                setCurrentContext('rollout');
            } else if (path.startsWith('/analyser')) {
                setCurrentContext('analyser');
            } else {
                setCurrentContext('assistant');
            }
        }
    }, []);

    // Get menu items based on current context
    const links = navMenuConfig.links;
    const main = navMenuConfig.mainNav[0];
    const docs = navMenuConfig.docsNav;
    const products = navMenuConfig.productsNav;

    // Context-specific navigation items
    const assistant = currentContext === 'assistant' ?
        (navMenuConfig.assistantNav?.length ? navMenuConfig.assistantNav[0] : null) : null;
    const resources = currentContext === 'assistant' ?
        (navMenuConfig.resourcesNav?.length ? navMenuConfig.resourcesNav[0] : null) : null;
    const comparator = currentContext === 'analyser' ?
        (navMenuConfig.comparatorNav?.length ? navMenuConfig.comparatorNav[0] : null) : null;
    const migration = currentContext === 'rollout' ?
        (navMenuConfig.migrationNav?.length ? navMenuConfig.migrationNav[0] : null) : null;

    // Rollout specific items (add these to your navMenuConfig)
    const rolloutFAQ = currentContext === 'rollout' ? navMenuConfig.rolloutFAQ : null;
    const rolloutSpecific = currentContext === 'rollout' ? navMenuConfig.rolloutNav?.[0] : null;

    useEffect(() => {
        const fetchCurrentTenantId = async () => {
            if (authService.isLoggedIn()) {
                const userClaims = authService.getTokenClaims();
                setCurrentTenantId(userClaims.tenantId);
            }
        };

        fetchCurrentTenantId();
    }, []);

    useEffect(() => {
        const fetchLicenseInfo = async () => {
            if (currentTenantId) {
                try {
                    const styleResponse = await authDataMiddleware(`${INTUNEASSISTANT_TENANT_STYLE}/${currentTenantId}`);
                    const styles = typeof styleResponse?.data === 'string' ? JSON.parse(styleResponse.data) : styleResponse?.data;

                    // Set the background color
                    document.documentElement.style.setProperty('--background', styles.background);
                    document.documentElement.style.setProperty('--primary', styles.primary);
                    document.documentElement.style.setProperty('--primary-foreground', styles.primaryforeground);
                    document.documentElement.style.setProperty('--accent-foreground', styles.accentforeground);
                    document.documentElement.style.setProperty('--secondary', styles.secondary);

                    // Set the logo URL if defined
                    if (styles.logourl) {
                        document.documentElement.style.setProperty('--logo-url', `url(${styles.logourl})`);
                        setLogoUrl(styles.logourl);
                    } else {
                        const defaultLogoUrl = getComputedStyle(document.documentElement).getPropertyValue('--logo-url').trim();
                        setLogoUrl(defaultLogoUrl.slice(4, -1)); // Remove 'url(' and ')'
                    }

                    // Set the logo URL
                    setLogoUrl(styles.logoUrl || "/default-logo.svg");
                } catch (error) {
                    console.error("Failed to fetch license info:", error);
                }
            }
        };

        fetchLicenseInfo();
    }, [currentTenantId]);

    return (
        <div className="flex items-center space-x-4">
            <NavigationMenu>
                <NavigationMenuList>
                    {/* Product Selector */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            {(() => {
                                const path = typeof window !== 'undefined' ? window.location.pathname : '/';
                                // Determine which product is active based on the path
                                return 'Modules';
                            })()}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4">
                                {products?.items?.map((product) => {
                                    // Determine if this product item is the active one
                                    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
                                    const isActive = (
                                        (product.href === '/' && path === '/') ||
                                        (product.href !== '/' && path.startsWith(product.href || ''))
                                    );

                                    return (
                                        <li key={product.title}>
                                            <a
                                                href={product.disabled ? undefined : product.href}
                                                className={cn(
                                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                    product.disabled ? "text-muted-foreground hover:bg-transparent hover:text-muted-foreground" : "",
                                                    isActive ? "bg-primary text-primary-foreground" : ""
                                                )}
                                            >
                                                <div className="flex items-center text-sm font-medium leading-none">
                                                    <span className="mr-2">{product.title}</span>
                                                    {product.disabled && (
                                                        <Badge
                                                            radius="sm"
                                                            className="h-5 px-1.5 text-xs font-medium"
                                                        >
                                                            SOON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Main Menu - Always shown */}
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <a
                                href="/onboarding"
                                className="block px-4 py-2 text-sm font-medium text-primary hover:underline"
                            >
                                Onboard NOW!
                            </a>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Rollout FAQ - Shown only in rollout context */}
                    {rolloutFAQ && (
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>{rolloutFAQ.title}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {rolloutFAQ.items?.map((page) => (
                                        <ListItem key={page.title} {...page} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* Rollout specific menu - Shown only in rollout context */}
                    {rolloutSpecific && (
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                <a
                                    href="/rollout"
                                    className="inline-block mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from toggling
                                        window.location.href = "/assignments";
                                    }}
                                >
                                    {rolloutSpecific.title}
                                </a>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {rolloutSpecific.items?.map((page) => (
                                        <ListItem key={page.title} {...page} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* Assistant - Shown only in assistant context */}
                    {assistant && (
                        <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            <a
                                href="/assignments"
                                className="inline-block mr-1"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent dropdown from toggling
                                    window.location.href = "/assignments";
                                }}
                            >
                                {assistant.title}
                            </a>
                        </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {assistant.items?.map((page) => (
                                        <ListItem key={page.title} {...page} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* Resources - Shown only in assistant context */}
                    {resources && (
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>{resources.title}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {resources.items?.map((page) => (
                                        <ListItem key={page.title} {...page} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* Comparator - Shown only in assistant context */}
                    {comparator && (
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>{comparator.title}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {comparator.items?.map((page) => (
                                        <ListItem key={page.title} {...page} disabled={true} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* Migration - Shown only in assistant context */}
                    {migration && (
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                <a
                                    href="/rollout"
                                    className="inline-block mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from toggling
                                        window.location.href = "/rollout";
                                    }}
                                >
                                    {migration.title}
                                </a>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {migration.items?.map((page) => (
                                        <ListItem key={page.title} {...page} />
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}

                    {/* External links - Always shown */}
                    {links && links.map((link) => (
                        <NavigationMenuItem key={link.href}>
                            <a
                                href={link.href}
                                className={navigationMenuTriggerStyle()}
                                {...(link.forceReload ? { "data-astro-reload": true } : {})}
                            >
                                {link.title}
                            </a>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
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