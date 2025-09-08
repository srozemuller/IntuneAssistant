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
    UsersIcon,
    ChevronLeft,
    Menu,
    ListCheck,
    User,
    ChevronUp,
    Mail,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerData } from '@/hooks/useCustomerData';

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
        subItems: [
            { id: 'assignments', name: 'Assignments', path: '/rollout/assignments', icon: ListCheck },
        ]
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const { customerData, loading: customerLoading } = useCustomerData();

    const isAuthenticated = accounts.length > 0;
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleModule = (moduleId: string) => {
        if (isCollapsed) return;
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) {
            setExpandedModules([]);
        } else {
            setExpandedModules(['assistant']);
        }
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
            <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-screen fixed left-0 top-0 p-6 flex flex-col justify-center items-center transition-all duration-300`}>
                <div className="text-center">
                    <Building className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    {!isCollapsed && (
                        <>
                            <h2 className="text-xl font-bold mb-4">Intune Assistant</h2>
                            <p className="text-gray-400 mb-6">Please sign in to continue</p>
                            <Button onClick={handleLogin} className="w-full">
                                Sign In with Microsoft
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6" />
                        Intune Assistant
                    </h1>
                )}
                {isCollapsed && (
                    <Building className="h-6 w-6 mx-auto" />
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="text-gray-400 hover:text-white p-1"
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Tenant Selector */}
            {!isCollapsed && availableTenants.length > 0 && (
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
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors relative group ${
                                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                                onClick={() => hasSubItems ? toggleModule(module.id) : null}
                                title={isCollapsed ? module.name : ''}
                            >
                                <Link
                                    href={hasSubItems ? '#' : module.path}
                                    className={`flex items-center gap-3 flex-1 ${isCollapsed ? 'justify-center' : ''}`}
                                    onClick={hasSubItems ? (e) => e.preventDefault() : undefined}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="font-medium">{module.name}</span>}
                                </Link>
                                {!isCollapsed && hasSubItems && (
                                    <div className="ml-2">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </div>
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {module.name}
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                    </div>
                                )}
                            </div>

                            {/* Sub Items */}
                            {!isCollapsed && hasSubItems && isExpanded && (
                                <div className="ml-8 mt-2 space-y-1">
                                    {module.subItems.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = pathname === subItem.path;

                                        return (
                                            <Link
                                                key={subItem.id}
                                                href={subItem.path}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                    isSubActive ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

            {/* User Info & Context Menu */}
            <div className="p-4 border-t border-gray-700" ref={userMenuRef}>
                {!isCollapsed ? (
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{accounts[0]?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{accounts[0]?.username}</p>
                                </div>
                            </div>
                            {userMenuOpen ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>

                        {/* User Context Menu */}
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg border border-gray-600 shadow-lg z-50">
                                {/* User Info Section */}
                                <div className="p-4 border-b border-gray-600">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {accounts[0]?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {accounts[0]?.username}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Tenant ID:</span>
                                            <Badge variant="outline" className="text-xs">
                                                {accounts[0]?.tenantId?.slice(0, 8)}...
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Environment:</span>
                                            <span className="text-gray-300">{accounts[0]?.environment}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Home Account ID:</span>
                                            <span className="text-gray-300">{accounts[0]?.homeAccountId?.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info Section */}
                                <div className="p-4 border-b border-gray-600">
                                    <div className="mb-2">
                                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Customer</h4>
                                    </div>
                                    {customerLoading ? (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span className="text-xs">Loading...</span>
                                        </div>
                                    ) : customerData ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm text-white font-medium truncate">
                                                    {customerData.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Badge variant={customerData.isMsp ? "default" : "secondary"} className="text-xs">
                                                    {customerData.isMsp ? 'MSP' : 'Direct'}
                                                </Badge>
                                                <Badge variant={customerData.isActive ? "default" : "destructive"} className="text-xs">
                                                    {customerData.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {customerData.primaryContactEmail && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-300 truncate">
                                                        {customerData.primaryContactEmail}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">No customer data</span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            router.push('/account');
                                        }}
                                        className="w-full flex items-center gap-3 p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Account Overview
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            router.push('/customer');
                                        }}
                                        className="w-full flex items-center gap-3 p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <Building className="h-4 w-4" />
                                        Customer Info
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            // Add settings/profile handler here
                                        }}
                                        className="w-full flex items-center gap-3 p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Account Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 p-2 text-sm text-red-400 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Collapsed state - simple logout button
                    <Button
                        onClick={handleLogout}
                        variant="destructive"
                        size="sm"
                        className="w-8 h-8 p-0 flex items-center justify-center"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
