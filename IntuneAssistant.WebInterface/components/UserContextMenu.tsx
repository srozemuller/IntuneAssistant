// components/UserContextMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useMessageCenter } from '@/contexts/MessageCenterContext';

interface UserInfo {
    name?: string;
    email?: string;
    picture?: string;
    preferred_username?: string;
}

interface UserContextMenuProps {
    accessToken: string;
    onLogout: () => void;
}

export const UserContextMenu: React.FC<UserContextMenuProps> = ({ accessToken, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { unreadCount, refetch } = useMessageCenter();

    // Re-sync unread count from localStorage whenever the dropdown opens
    useEffect(() => {
        if (isOpen) refetch();
    }, [isOpen, refetch]);

    useEffect(() => {
        if (accessToken) {
            // Decode JWT token to get user info
            try {
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const tokenData = JSON.parse(jsonPayload);
                setUserInfo({
                    name: tokenData.name,
                    email: tokenData.email || tokenData.upn,
                    preferred_username: tokenData.preferred_username,
                    picture: tokenData.picture
                });
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    }, [accessToken]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    {/* Avatar with optional unread badge */}
                    <div className="relative">
                        {userInfo?.picture ? (
                            <img src={userInfo.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                        )}
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                            </span>
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                        {userInfo?.name || userInfo?.preferred_username || 'User'}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            {/* Avatar with badge in the dropdown header too */}
                            <div className="relative">
                                {userInfo?.picture ? (
                                    <img src={userInfo.picture} alt="Profile" className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-800" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {userInfo?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {userInfo?.email || userInfo?.preferred_username}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="py-1">
                        {/* ── Message Center item ── */}
                        <button
                            onClick={() => { setIsOpen(false); router.push('/message-center'); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Bell className="w-4 h-4 mr-3" />
                            <span className="flex-1 text-left">Message Center</span>
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => { setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                        </button>

                        <button
                            onClick={() => { setIsOpen(false); onLogout(); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
