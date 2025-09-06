'use client';
import { useMsal } from '@azure/msal-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Database,
    Settings,
    BarChart3,
    FileText,
    Shield,
    LogOut,
    Building,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    CirclePlay,
    UserCheck,
    Smartphone,
    UsersIcon
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const modules = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: BarChart3,
        path: '/',
        subItems: []
    },
    {
        id: 'assistant',
        name: 'Assistant',
        icon: LayoutDashboard,
        path: '/assistant',
        subItems: [
            { id: 'assignments-overview', name: 'Assignments Overview', path: '/assistant/assignments-overview', icon: UserCheck },
            { id: 'app-assignments', name: 'App Assignments', path: '/assistant/app-assignments', icon: Smartphone },
            { id: 'group-assignments', name: 'Group Assignments', path: '/assistant/group-assignments', icon: UsersIcon }
        ]
    },
    {
        id: 'rollout',
        name: 'Rollout',
        icon: CirclePlay,
        path: '/rollout',
        subItems: []
    },
    {
        id: 'users',
        name: 'User Management',
        icon: Users,
        path: '/users',
        subItems: []
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: Settings,
        path: '/settings',
        subItems: []
    },
];

export default function Sidebar() {
    const { instance, accounts } = useMsal();
    const { selectedTenant, availableTenants, setSelectedTenant } = useTenant();
    const [expandedModules, setExpandedModules] = useState<string[]>(['assistant']);
    const pathname = usePathname();

    const isAuthenticated = accounts.length > 0;

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleLogin = async () => {
        try {
            await instance.loginPopup({
                scopes: ['User.Read', 'Directory.Read.All'],
                prompt: 'select_account'
            });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = () => {
        instance.logoutPopup();
    };

    if (!isAuthenticated) {
        return (
            <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 p-6 flex flex-col justify-center items-center">
                <div className="text-center">
                    <Building className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-xl font-bold mb-4">Intune Assistant</h2>
                    <p className="text-gray-400 mb-6">Please sign in to continue</p>
                    <Button onClick={handleLogin} className="w-full">
                        Sign In with Microsoft
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    Intune Assistant
                </h1>
            </div>

            {/* Tenant Selector */}
            {availableTenants.length > 0 && (
                <div className="p-4 border-b border-gray-700">
                    <label className="text-sm text-gray-400 block mb-2">Current Tenant</label>
                    <Select value={selectedTenant || ''} onValueChange={setSelectedTenant}>
                        <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                            <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {modules.map((module) => {
                    const Icon = module.icon;
                    const isExpanded = expandedModules.includes(module.id);
                    const hasSubItems = module.subItems.length > 0;
                    const isActive = pathname === module.path ||
                        (hasSubItems && module.subItems.some(sub => pathname === sub.path));

                    return (
                        <div key={module.id}>
                            {/* Main Module */}
                            <div
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                                onClick={() => hasSubItems ? toggleModule(module.id) : null}
                            >
                                <Link
                                    href={hasSubItems ? '#' : module.path}
                                    className="flex items-center gap-3 flex-1"
                                    onClick={hasSubItems ? (e) => e.preventDefault() : undefined}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{module.name}</span>
                                </Link>
                                {hasSubItems && (
                                    <div className="ml-2">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sub Items */}
                            {hasSubItems && isExpanded && (
                                <div className="ml-8 mt-2 space-y-1">
                                    {module.subItems.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = pathname === subItem.path;

                                        return (
                                            <Link
                                                key={subItem.id}
                                                href={subItem.path}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                    isSubActive
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                            >
                                                <SubIcon className="h-4 w-4" />
                                                <span className="text-sm">{subItem.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-700">
                <div className="mb-3">
                    <p className="text-sm font-medium">{accounts[0]?.name}</p>
                    <p className="text-xs text-gray-400">{accounts[0]?.username}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                        {accounts[0]?.tenantId?.slice(0, 8)}...
                    </Badge>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    className="w-full flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
