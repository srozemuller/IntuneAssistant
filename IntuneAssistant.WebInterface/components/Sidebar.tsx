'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {useCustomer} from "@/contexts/CustomerContext";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    GitBranch,
    BarChart3,
    Rocket,
    Bot,
    Settings,
    Users,
    Key,
    TrendingUp,
    ChevronRight,
    Crown,
    User,
    LogOut,
    HelpCircle,
    PanelLeftClose,
    PanelLeft,
    LogIn,
    FileQuestion,
    Info,
    BookOpen,
    Monitor,
    ArrowLeftRight,
    MonitorCog,
    ShieldCheck,
    MonitorCheck,
    ScrollText
} from 'lucide-react';

const iconMap = {
    LayoutDashboard,
    ArrowLeftRight,
    GitBranch,
    BarChart3,
    Rocket,
    Bot,
    Settings,
    Users,
    Key,
    TrendingUp,
    FileQuestion,
    Info,
    BookOpen,
    Monitor,
    MonitorCog,
    Crown,
    ShieldCheck,
    MonitorCheck,
    ScrollText
};

interface MenuItem {
    title: string;
    icon: string;
    href: string;
    description?: string;
    isPaid?: boolean;
    isBeta?: boolean;
    submenu?: Array<{
        title: string;
        href: string;
        submenu?: Array<{
            title: string;
            href: string;
        }>;
    }>;
}

interface MenuSection {
    title: string;
    badge?: string;
    badgeColor?: string;
    items: MenuItem[];
}

export function Sidebar() {
    const pathname = usePathname();
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const router = useRouter();
    const { isActiveCustomer, customerLoading, customerData } = useCustomer();

    const account = accounts[0];
    const displayName = account?.name || account?.username || 'User';
    const initials = displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleLogin = () => {
        instance.loginRedirect();
    };

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: '/',
        });
    };

    const isActiveLink = (href: string) => {
        if (href === '/') return pathname === href;
        return pathname.startsWith(href);
    };

    const renderBadge = (section: MenuSection) => {
        if (!section.badge || isCollapsed) return null;

        const badgeClass = section.badgeColor || 'bg-green-500';

        return (
            <Badge className={cn("text-xs text-white ml-2", badgeClass)}>
                {section.badge}
            </Badge>
        );
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = isActiveLink(item.href);
        const isSubmenuItem = level > 0;
        const paddingLeft = level === 1 ? "pl-6" : level === 2 ? "pl-10" : "pl-3";

        const menuItem = (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                    isActive && "bg-primary/10 text-primary font-medium",
                    !isCollapsed && paddingLeft,
                    isCollapsed && level === 0 && "justify-center px-2",
                    level > 0 && isCollapsed && "hidden" // Hide nested items when collapsed
                )}
            >
                {level === 0 && Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                {level > 0 && !isCollapsed && (
                    <div className="w-4 h-4 flex items-center justify-center">
                        <div className={cn(
                            "rounded-full bg-gray-400",
                            level === 1 ? "w-1.5 h-1.5" : "w-1 h-1"
                        )}></div>
                    </div>
                )}

                {!isCollapsed && (
                    <>
                        <span className="flex-1">{item.title}</span>
                        <div className="flex items-center gap-1">
                            {item.isPaid && <Crown className="h-3 w-3 text-amber-500" />}
                            {item.isBeta && (
                                <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-[9px] px-1.5 py-0 h-4 font-semibold">
                                    BETA
                                </Badge>
                            )}
                            {item.submenu && level === 0 && (
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                        </div>
                    </>
                )}
            </Link>
        );

        // Wrap with tooltip when collapsed and level 0
        if (isCollapsed && level === 0) {
            return (
                <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                        {menuItem}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                        <div className="flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.isPaid && <Crown className="h-3 w-3 text-amber-500" />}
                            {item.isBeta && (
                                <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-[9px] px-1.5 py-0 h-4 font-semibold">
                                    BETA
                                </Badge>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            );
        }

        return (
            <div key={item.href} className="space-y-1">
                {menuItem}
                {/* Render nested submenus */}
                {item.submenu && isActive && !isCollapsed && isAuthenticated && (
                    <div className="space-y-1">
                        {item.submenu.map(subItem =>
                            renderMenuItem({ ...subItem, icon: '' }, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    const hasEnterpriseLicense = (): boolean => {
        if (!customerData?.licenses || customerData.licenses.length === 0) {
            return false;
        }

        return customerData.licenses.some(license => license.licenseType === 2 && license.isActive);
    };

    const isBetaTester = (): boolean => {
        return customerData?.isBetaTester === true;
    };

    const menuSections: MenuSection[] = [
        {
            title: "",
            items: [
                {
                    title: "Overview",
                    icon: "LayoutDashboard",
                    href: "/"
                }
            ]
        },
        {
            title: "Intune Assistant",
            badgeColor: "bg-green-500",
            items: [
                {
                    title: "Assignments",
                    icon: "GitBranch",
                    href: "/assistant",
                    submenu: [
                        { title: "Configuration Assignments (all)", href: "/assistant/assignments-overview" },
                        { title: "Group Assignments", href: "/assistant/group-assignments" },
                        {
                            title: "User Assignments",
                            href: "/assistant/user-assignments",
                            submenu: [
                                { title: "Configuration Assignments", href: "/assistant/user-assignments/configuration" },
                                { title: "App Assignments", href: "/assistant/user-assignments/apps" }
                            ]
                        },
                        { title: "Assignments with Filter", href: "/assistant/filter-assignments" },
                        { title: "Application Assignments (all)", href: "/assistant/app-assignments" }
                    ]
                },
                {
                    title: "Devices",
                    icon: "Monitor",
                    href: "/devices",
                    submenu: [
                        { title: "Device Overview", href: "/devices/overview" },
                    ]
                },
                {
                    title: "Configuration",
                    icon: "MonitorCog",
                    href: "/configuration",
                    submenu: [
                        { title: "Config Policies", href: "/configuration/policies" },
                        { title: "Config Settings", href: "/configuration/settings" }
                    ]
                },
                {
                    title: "Conditional Access",
                    icon: "Key",
                    href: "/conditional-access",
                    submenu: [
                        { title: "Policies Overview", href: "/conditional-access/policies" }
                    ]
                },
                {
                    title: "Compare Policies",
                    icon: "ArrowLeftRight",
                    href: "/compare",
                    submenu: [
                        { title: "Policies & Settings", href: "/compare/policies" }
                    ]
                }
            ]
        },
        {
            title: "Drift Monitor",
            badgeColor: "bg-green-500",
            items: [
                {
                    title: "Monitor Overview",
                    icon: "MonitorCheck",
                    href: "/monitor",
                    submenu: [
                        { title: "Global Overview", href: "/monitor/global-overview" },
                        { title: "All Monitors", href: "/monitor/monitors" },
                        { title: "Add Monitor", href: "/monitor/add" },
                        { title: "Drifts", href: "/monitor/drift" }
                    ]
                }
            ]
        },
        // Only include Audit Events section if customer is a beta tester
       // ...(isBetaTester() ? [
        {
            title: "Audit Events",
            badgeColor: "bg-purple-500",
            items: [
                {
                    title: "Event Dashboard",
                    icon: "ScrollText",
                    href: "/audit-events",
                    isBeta: true,
                    submenu: [
                        { title: "Dashboard", href: "/audit-events" },
                        { title: "Advanced Search", href: "/audit-events/search" }
                    ]
                }
            ]
        },
        //] : []),
        // Only include Business Modules section if customer is active
        ...(isActiveCustomer && hasEnterpriseLicense() ? [{
            title: "Extensions",
            badgeColor: "bg-blue-500",
            items: [
                {
                    title: "Assignment Manager",
                    icon: "Rocket",
                    href: "/deployment",
                    submenu: [
                        { title: "Deploy Assignments", href: "/deployment/assignments" }
                    ]
                }
            ]
        }] : []),
        ...(isActiveCustomer && hasEnterpriseLicense() ? [{
            title: "Worker",
            badgeColor: "bg-slate-500",
            items: [
                {
                    title: "Worker Overview",
                    icon: "Bot",
                    href: "/worker",
                    isBeta: true,
                    submenu: [
                        { title: "Overview", href: "/worker" },
                        { title: "Job Management", href: "/worker/jobs" }
                    ]
                }
            ]
        }] : []),
        {
            title: "Support",
            items: [
                {
                    title: "FAQ",
                    icon: "FileQuestion",
                    href: "https://docs.intuneassistant.cloud/docs/faq"
                },
                {
                    title: "About",
                    icon: "Info",
                    href: "/about",
                },
                {
                    title: "Security & Compliance",
                    icon: "ShieldCheck",
                    href: "/security",
                },
                {
                    title: "Docs",
                    icon: "BookOpen",
                    href: "https://docs.intuneassistant.cloud"
                }
            ]
        },
        {
            title: "Enterprise",
            items: [
                {
                    title: "Plans",
                    icon: "Crown",
                    href: "/plans"
                }
            ]
        }
    ];

    return (
        <TooltipProvider>
    <div className={cn(
        "sidebar bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50",
        isCollapsed ? "w-16" : "w-64"
    )}>
                {/* Content wrapper */}
                <div className="h-full flex flex-col">
                    {/* Header with Logo and Collapse Toggle */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                        {!isCollapsed && (
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Intune Assistant
                            </h2>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className={cn("p-2 hover:bg-gray-100 dark:hover:bg-gray-800", isCollapsed && "mx-auto")}
                        >
                            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        {/* Onboarding banner */}

                        <nav className="space-y-6">
                            {menuSections.map((section, index) => (
                                <div key={index} className="space-y-2">
                                    {!isCollapsed && section.title && (
                                        <div className="flex items-center">
                                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {section.title}
                                            </h3>
                                            {renderBadge(section)}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        {section.items.map(item => renderMenuItem(item))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 mt-auto">
                        <div className={cn("flex items-center mb-3", isCollapsed ? "justify-center" : "justify-between")}>
                            <ThemeToggle />
                        </div>

                        {!isAuthenticated ? (
                            <Button
                                onClick={handleLogin}
                                className={cn(
                                    "bg-blue-600 hover:bg-blue-700 text-white",
                                    isCollapsed ? "w-10 h-10 p-0" : "w-full"
                                )}
                            >
                                <LogIn className="h-4 w-4" />
                                {!isCollapsed && <span className="ml-2">Sign In</span>}
                            </Button>
                        ) : (
                            // Your existing user dropdown menu code here
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={cn(
                                        "h-auto p-2 hover:bg-gray-100/80 dark:hover:bg-slate-800/80",
                                        isCollapsed ? "w-10 justify-center" : "w-full justify-start"
                                    )}>
                                        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "w-full")}>
                                            <Avatar className="h-8 w-8 shadow-sm">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            {!isCollapsed && (
                                                <div className="flex-1 text-left overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {account?.username}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="start" side="right">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {account?.username}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => window.location.href = '/account'}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.location.href = '/auditlog'}>
                                        <ScrollText className="mr-2 h-4 w-4" />
                                        <span>Audit Logs</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.location.href = '/customer'}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Customer Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('https://docs.intuneassistant.cloud', '_blank')}>
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        <span>Help & Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

        </TooltipProvider>
    );

}
