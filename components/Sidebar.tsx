'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
    LayoutDashboard,
    GitBranch,
    Monitor,
    FileStack,
    ShieldUser,
    FunnelPlus,
    Megaphone,
    ScrollText,
    ArchiveRestore,
    Layers,
    FileQuestion,
    Info,
    BookOpen,
    ShieldCheck,
    LogIn,
    LogOut,
    UserRound,
    PanelLeft,
    PanelLeftClose,
    ChevronRight,
    Database,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubItem {
    title: string;
    href: string;
}

interface MenuItem {
    title: string;
    icon: LucideIcon;
    href: string;
    external?: boolean;
    submenu?: SubItem[];
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: '',
        items: [{ title: 'Home', icon: LayoutDashboard, href: '/' }],
    },
    {
        title: 'Explore',
        items: [
            { title: 'Tenant Overview', icon: Database, href: '/overview' },
            {
                title: 'Assignments',
                icon: GitBranch,
                href: '/assistant',
                submenu: [
                    { title: 'All configurations', href: '/assistant/assignments-overview' },
                    { title: 'By group', href: '/assistant/group-assignments' },
                    { title: 'By user', href: '/assistant/user-assignments' },
                    { title: 'By filter', href: '/assistant/filter-assignments' },
                    { title: 'Apps', href: '/assistant/app-assignments' },
                ],
            },
            {
                title: 'Devices',
                icon: Monitor,
                href: '/devices',
                submenu: [
                    { title: 'Device overview', href: '/devices/overview' },
                    { title: 'Compare devices', href: '/devices/compare' },
                    { title: 'Duplicate devices', href: '/devices/duplicates' },
                ],
            },
            {
                title: 'Policies',
                icon: FileStack,
                href: '/configuration',
                submenu: [
                    { title: 'Policy list', href: '/configuration/policies' },
                    { title: 'Settings overview', href: '/configuration/settings' },
                    { title: 'Conditional Access', href: '/conditional-access/policies' },
                    { title: 'Compare policies', href: '/compare/policies' },
                    { title: 'Compare external', href: '/compare/configuration' },
                ],
            },
        ],
    },
    {
        title: 'Check',
        items: [
            { title: 'Admin roles', icon: ShieldUser, href: '/rbac/intune-admin-analyzer' },
            { title: 'Group filters', icon: FunnelPlus, href: '/analyzer/group-filter' },
            { title: 'Service announcements', icon: Megaphone, href: '/service-announcements' },
        ],
    },
    {
        title: 'Settings Library',
        items: [
            {
                title: 'Settings Catalog',
                icon: Layers,
                href: '/settings-library',
                submenu: [
                    { title: 'Browse catalog', href: '/settings-library' },
                    { title: 'Explore by task', href: '/settings-library/explore' },
                    { title: 'Tenant impact', href: '/settings-library/impact' },
                    { title: 'Changelog', href: '/settings-library/changelog' },
                    { title: 'Compare', href: '/settings-library/compare' },
                ],
            },
            { title: 'Baseline templates', icon: ShieldCheck, href: '/settings-library/baselines' },
        ],
    },
    {
        title: 'Tenant Events',
        items: [
            {
                title: 'Audit Events',
                icon: ScrollText,
                href: '/audit-events',
                submenu: [
                    { title: 'Dashboard', href: '/audit-events' },
                    { title: 'Advanced search', href: '/audit-events/search' },
                ],
            },
        ],
    },
    {
        title: 'Configuration Management',
        items: [
            { title: 'Backup', icon: ArchiveRestore, href: '/configuration/backup' },
        ],
    },
    {
        title: 'Help',
        items: [
            { title: 'FAQ', icon: FileQuestion, href: '/faq' },
            { title: 'Privacy & security', icon: ShieldCheck, href: '/security' },
            { title: 'About', icon: Info, href: '/about' },
            { title: 'Documentation', icon: BookOpen, href: 'https://docs.intuneassistant.cloud', external: true },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { hasConnectedTenant, customerLoading } = useCustomer();

    const account = accounts[0];
    const displayName = account?.name || account?.username || 'User';
    const initials = displayName
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleLogin = () => instance.loginRedirect({ scopes: [], prompt: 'select_account' });

    const handleLogout = () => {
        sessionStorage.removeItem('ia_consent_verified');
        sessionStorage.removeItem('ia_consent_minimized');
        sessionStorage.removeItem('ia_consent_pending');
        instance.logoutRedirect({ postLogoutRedirectUri: '/' });
    };

    const isActiveLink = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
    const isSectionActive = (item: MenuItem) =>
        isActiveLink(item.href) || (item.submenu?.some(sub => isActiveLink(sub.href)) ?? false);

    // Until the tenant is connected there is nothing to explore — only the home page and help are useful.
    const showExplore = isAuthenticated && !customerLoading && hasConnectedTenant;

    const renderItem = (item: MenuItem) => {
        const Icon = item.icon;
        const active = isSectionActive(item);
        const link = (
            <Link
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cn(
                    'flex items-center gap-3 py-2 px-3 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                    active && 'bg-primary/10 text-primary font-medium',
                    isCollapsed && 'justify-center px-2'
                )}
            >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                    <>
                        <span className="flex-1">{item.title}</span>
                        {item.submenu && (
                            <ChevronRight
                                className={cn('h-3 w-3 text-gray-400 transition-transform', active && 'rotate-90')}
                            />
                        )}
                    </>
                )}
            </Link>
        );

        if (isCollapsed) {
            return (
                <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                        {item.title}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return (
            <div key={item.href} className="space-y-1">
                {link}
                {item.submenu && active && (
                    <div className="ml-6 space-y-1 border-l border-gray-200 dark:border-gray-800 pl-3">
                        {item.submenu.map(sub => (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                    'block py-1.5 px-2 text-sm rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                    isActiveLink(sub.href) && 'text-primary font-medium'
                                )}
                            >
                                {sub.title}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const tenantOnlySections = ['Explore', 'Check', 'Settings Library', 'Tenant Events', 'Configuration Management'];
    const visibleSections = menuSections.filter(
        section => showExplore || !tenantOnlySections.includes(section.title)
    );

    return (
        <TooltipProvider>
            <div
                className={cn(
                    'sidebar bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50',
                    isCollapsed ? 'w-16' : 'w-64'
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                        {!isCollapsed && (
                            <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-white">
                                IntuneAssistant
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                            className={cn('p-2 hover:bg-gray-100 dark:hover:bg-gray-800', isCollapsed && 'mx-auto')}
                        >
                            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        <nav className="space-y-6">
                            {visibleSections.map(section => (
                                <div key={section.title || 'top'} className="space-y-2">
                                    {!isCollapsed && section.title && (
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                    )}
                                    <div className="space-y-1">{section.items.map(renderItem)}</div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 mt-auto">
                        <div className={cn('flex items-center mb-3', isCollapsed ? 'justify-center' : 'justify-between')}>
                            <ThemeToggle />
                        </div>

                        {!isAuthenticated ? (
                            <Button
                                onClick={handleLogin}
                                className={cn(isCollapsed ? 'w-10 h-10 p-0' : 'w-full')}
                            >
                                <LogIn className="h-4 w-4" />
                                {!isCollapsed && <span className="ml-2">Sign in</span>}
                            </Button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'h-auto p-2 hover:bg-gray-100/80 dark:hover:bg-slate-800/80',
                                            isCollapsed ? 'w-10 justify-center' : 'w-full justify-start'
                                        )}
                                    >
                                        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'w-full')}>
                                            <Avatar className="h-8 w-8 shadow-sm shrink-0">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            {!isCollapsed && (
                                                <div className="min-w-0 text-left">
                                                    <p className="text-sm font-medium truncate">{displayName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{account?.username}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="top" className="w-56">
                                    <DropdownMenuLabel className="truncate">{account?.username}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account">
                                            <UserRound className="h-4 w-4 mr-2" />
                                            My account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign out
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
