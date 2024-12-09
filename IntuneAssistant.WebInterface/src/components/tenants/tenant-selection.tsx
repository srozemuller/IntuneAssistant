// src/components/tenants/tenant-selection.tsx

import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from '@/components/tenants/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { type Configuration, PublicClientApplication } from "@azure/msal-browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import axios from "axios";
import { TenantContext } from '@/components/tenants/tenant-context';

interface Account {
    homeAccountId: string;
    name: string;
    username: string;
    tenantId: string;
}
interface Tenant {
    id: string;
    tenantName: string;
    tenantId: string;
    managedByTenantId: string;
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
    const { switchTenant } = useContext(TenantContext);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            setAccounts(storedAccounts);
            const loggedInUser = storedAccounts[0];
            if (loggedInUser) {
                setSelectedAccount(loggedInUser.homeAccountId);
                fetchTenants(loggedInUser.tenantId);
            }
        }
    }, []);

    const fetchTenants = async (tenantId: string) => {
        try {
            const response = await axios.get(`https://localhost:7224/v1/tenant/managed-by?tenantId=${tenantId}`);
            setTenants(response.data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            toast.error(`Error fetching tenants: ${(error as Error).message}`);
        }
    };

    const handleAccountSelect = (accountId: string) => {
        setSelectedAccount(accountId);
        localStorage.setItem('selectedHomeAccountId', accountId);
        const selectedAccount = accounts.find(account => account.homeAccountId === accountId);
        if (selectedAccount) {
            fetchTenants(selectedAccount.tenantId);
        }
    };
    const handleTenantSelect = async (tenantId: string) => {
        try {
            await msalInstance.initialize();
            await switchTenant(tenantId);

            // Store the selected tenant information in local storage
            const accounts = msalInstance.getAllAccounts();
            const updatedAccounts = accounts.map(account =>
                account.tenantId === tenantId ? { ...account, tenantId } : account
            );
            localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
            localStorage.setItem('selectedTenantId', tenantId);

            console.log('Selected tenant:', tenantId);
            console.log('Updated accounts:', updatedAccounts);

            window.location.href = '/tenants';
        } catch (error) {
            console.error('Login error:', error);
            toast.error(`Login error: ${(error as Error).message}`);
        }
    };

    const handleRadioChange = (accountId: string) => {
        handleAccountSelect(accountId);
    };

    const columns: ColumnDef<Tenant>[] = [
        {
            accessorKey: 'tenantId',
            header: 'Tenant ID',
        },
        {
            accessorKey: 'tenantName',
            header: 'Name',
        },
        {
            accessorKey: 'managedByTenantId',
            header: 'Managed By',
        },
        {
            id: 'selectButton',
            header: 'Select',
            cell: ({ row }) => (
                <Button variant="outline" onClick={() => handleTenantSelect(row.original.tenantId)}>
                    Select
                </Button>
            ),
        },
    ];

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition} />
            <DataTable columns={columns} data={tenants} rawData={JSON.stringify(tenants)} fetchData={() => Promise.resolve()} source="tenants" groupData={[]} />
        </div>
    );
};

export default AccountSelectionPage;