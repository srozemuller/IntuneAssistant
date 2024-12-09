import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/accounts/data-table';
import type { ColumnDef } from '@tanstack/react-table';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Configuration, PublicClientApplication } from "@azure/msal-browser";

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";

interface Account {
    homeAccountId: string;
    name: string;
    username: string;
    tenantId: string;
}

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

const AccountSelectionPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            setAccounts(storedAccounts);
            const storedSelectedAccount = localStorage.getItem('selectedHomeAccountId');
            if (storedSelectedAccount) {
                setSelectedAccount(storedSelectedAccount);
            }

            // Check if the page was reloaded after account selection
            const accountSelected = localStorage.getItem('accountSelected');
            if (accountSelected) {
                const selectedAccount = storedAccounts.find(account => account.homeAccountId === accountSelected);
                if (selectedAccount) {
                    toast.success(`Selected account: ${selectedAccount.username}`);
                }
                localStorage.removeItem('accountSelected');
            }
        }
    }, []);

    const handleAccountSelect = (accountId: string) => {
        setSelectedAccount(accountId);
        localStorage.setItem('selectedHomeAccountId', accountId);
        localStorage.setItem('accountSelected', accountId);
        window.location.reload(); // Refresh the page
    };

    const handleLogout = async (accountId: string) => {
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

    const handleRadioChange = (accountId: string) => {
        handleAccountSelect(accountId);
    };

    const columns: ColumnDef<Account>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => (
                <RadioGroup value={selectedAccount} onValueChange={handleRadioChange}>
                    <RadioGroupItem value={row.original.homeAccountId} className="radio-primary" />
                </RadioGroup>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'username',
            header: 'Username',
        },
        {
            accessorKey: 'tenantId',
            header: 'Tenant ID',
        },
        {
            id: 'logout',
            header: 'Logout',
            cell: ({ row }) => (
                <Button variant="destructive" onClick={() => handleLogout(row.original.homeAccountId)}>
                    Logout
                </Button>
            ),
        },
    ];

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition} />
            <DataTable columns={columns} data={accounts} rawData={JSON.stringify(accounts)} fetchData={() => {}} source="accounts" groupData={[]} />
        </div>
    );
};

export default AccountSelectionPage;