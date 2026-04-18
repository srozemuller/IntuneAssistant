// contexts/TenantContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';

interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isActive: boolean;
    isPrimary: boolean;
    lastLogin: string | null;
}

interface TenantContextType {
    selectedTenant: Tenant | null;
    setSelectedTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { accounts } = useMsal();
    const [selectedTenant, setSelectedTenantState] = useState<Tenant | null>(null);

    // Load tenant from localStorage on mount
    useEffect(() => {
        const savedTenant = localStorage.getItem('selectedTenant');
        if (savedTenant) {
            try {
                setSelectedTenantState(JSON.parse(savedTenant));
            } catch (error) {
                console.error('Failed to parse saved tenant:', error);
                localStorage.removeItem('selectedTenant');
            }
        }
    }, []);

    // Clear tenant when user logs out (MSAL accounts become empty)
    useEffect(() => {
        if (accounts.length === 0) {
            setSelectedTenantState(null);
            localStorage.removeItem('selectedTenant');
        }
    }, [accounts.length]);

    // Save tenant to localStorage when it changes
    const setSelectedTenant = (tenant: Tenant | null) => {
        setSelectedTenantState(tenant);
        if (tenant) {
            localStorage.setItem('selectedTenant', JSON.stringify(tenant));
        } else {
            localStorage.removeItem('selectedTenant');
        }
    };

    return (
        <TenantContext.Provider value={{ selectedTenant, setSelectedTenant }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
