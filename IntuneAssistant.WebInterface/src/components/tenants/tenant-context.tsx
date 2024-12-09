// src/tenants/tenant-context.tsx

import { createContext, useState, type ReactNode } from 'react';
import { msalInstance } from '@/components/auth';

interface TenantContextProps {
    tenantId: string;
    setTenantId: (tenantId: string) => void;
    switchTenant: (tenantId: string) => void;
}

export const TenantContext = createContext<TenantContextProps>({
    tenantId: '',
    setTenantId: () => {},
    switchTenant: () => {},
});
export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [tenantId, setTenantId] = useState<string>('');

    const switchTenant = async (newTenantId: string) => {
        setTenantId(newTenantId);
        const accounts = msalInstance.getAllAccounts();
        let account = accounts.find(acc => acc.tenantId === newTenantId);

        if (!account) {
            // Prompt for login if the tenant ID is not in the accounts
            const loginRequest = {
                scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
                authority: `https://login.microsoftonline.com/${newTenantId}`
            };
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            account = msalInstance.getAllAccounts().find(acc => acc.tenantId === newTenantId);
            console.log('Login response:', loginResponse);
        }

        if (account) {
            await msalInstance.setActiveAccount(account);
            console.log('Switched to tenant:', newTenantId);
            console.log('Active account:', account);

            // Store the selected tenant information in local storage
            const updatedAccounts = accounts.map(acc =>
                acc.tenantId === newTenantId ? { ...acc, tenantId: newTenantId } : acc
            );
            localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
            localStorage.setItem('selectedTenantId', newTenantId);
        }
    };

    return (
        <TenantContext.Provider value={{ tenantId, setTenantId, switchTenant }}>
            {children}
        </TenantContext.Provider>
    );
};