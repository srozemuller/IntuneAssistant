"use client"
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Users} from 'lucide-react';
import { type Configuration, PublicClientApplication } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";

// Define the Account type
type Account = {
    homeAccountId: string;
    name: string;
    username: string;
};

const msalConfig: Configuration = {
    auth: {
        clientId: '0f0f930f-a5c7-4da2-a985-8464d1ff51d0',
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
    prompt: 'select_account',
};

const AuthButton: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const initializeMsal = async () => {
            await msalInstance.initialize();
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                setIsLoggedIn(true);
                setAccounts(accounts);
                const storedSelectedAccount = localStorage.getItem('selectedHomeAccountId');
                if (storedSelectedAccount) {
                    setSelectedAccount(storedSelectedAccount);
                    const selectedAccount = accounts.find(account => account.homeAccountId === storedSelectedAccount);
                    if (selectedAccount) {
                        setUserName(selectedAccount.name);
                    }
                } else {
                    setSelectedAccount(accounts[0].homeAccountId);
                    setUserName(accounts[0].name);
                }
            }

            // Check if the page was reloaded after account selection
            const accountSelected = localStorage.getItem('accountSelected');
            if (accountSelected) {
                const selectedAccount = accounts.find(account => account.homeAccountId === accountSelected);
                if (selectedAccount) {
                    toast.success(`Selected account: ${selectedAccount.username}`);
                }
                localStorage.removeItem('accountSelected');
            }
        };

        if (typeof window !== 'undefined') {
            initializeMsal();
        }
    }, []);

    const login = async () => {
        try {
            await msalInstance.initialize();
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            const account = loginResponse.account;
            if (account) {
                setIsLoggedIn(true);
                setUserName(account.name ?? null);
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                localStorage.setItem(`token_${account.homeAccountId}`, tokenResponse.accessToken);
                const accounts = msalInstance.getAllAccounts();
                localStorage.setItem('accounts', JSON.stringify(accounts));
                setAccounts(accounts);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(`Login error: ${(error as Error).message}`);
        }
    };

    const logout = async () => {
        try {
            await msalInstance.initialize();
            await msalInstance.logoutPopup();
            setIsLoggedIn(false);
            setUserName(null);
            localStorage.clear();
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(`Logout error: ${(error as Error).message}`);
        }
    };

    const handleSelectAccount = (accountId: string) => {
        setSelectedAccount(accountId);
        localStorage.setItem('selectedHomeAccountId', accountId);
        localStorage.setItem('accountSelected', accountId);
        window.location.reload(); // Refresh the page
    };

    const getInitials = (name: string | null): string => {
        if (!name) return '';
        const initials = name.split(' ').map(part => part[0]).join('');
        return initials.toUpperCase();
    };

    const UserAvatarDropdown: React.FC = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar>
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Account Options</DropdownMenuLabel>
                {isLoggedIn ? (
                    <>
                        <DropdownMenuItem onSelect={() => ('/profile')}>Profile</DropdownMenuItem>
                        <DropdownMenuItem onSelect={logout}>Logout</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>General Options</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={login}>Log In</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Users size={14} />
                                <span>Select other user</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup value={selectedAccount} onValueChange={handleSelectAccount}>
                                        {accounts.map((account) => (
                                            <TooltipProvider key={account.homeAccountId}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <DropdownMenuRadioItem value={account.homeAccountId}>
                                                            {account.name}
                                                        </DropdownMenuRadioItem>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {account.username}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => window.location.href = '/accounts'}>All Accounts</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </>
                ) : (
                    <DropdownMenuItem onSelect={login}>Login</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div>
            <ToastContainer autoClose={toastDuration} position={toastPosition} />
            <UserAvatarDropdown />
        </div>
    );
};

export default AuthButton;