// app/client-layout.tsx (Client Component)
'use client';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msalConfig';
import { TenantProvider } from '@/contexts/TenantContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { CustomerProvider } from "@/contexts/CustomerContext";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { ErrorProvider } from '@/contexts/ErrorContext';
import { GlobalErrorDisplay } from '@/components/GlobalErrorDisplay';
import { TenantIndicator } from '@/components/ui/tenant-indicator';
import ConsentWarning from "@/components/ConsentWarning";

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={cn(isCollapsed && "sidebar-collapsed")}>
            <Sidebar />
            <main>
                <div className="p-6">
                    <TenantIndicator />
                    <GlobalErrorDisplay />
                    <ConsentWarning />
                    {children}
                </div>
            </main>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            <MsalProvider instance={msalInstance}>
                <ErrorProvider>
                    <ConsentProvider>
                        <CustomerProvider>
                            <TenantProvider>
                                <SidebarProvider>
                                    <MainContent>
                                        <ConsentWarning />
                                        {children}
                                    </MainContent>
                                </SidebarProvider>
                            </TenantProvider>
                        </CustomerProvider>
                    </ConsentProvider>
                </ErrorProvider>
            </MsalProvider>
        </ThemeProvider>
    );
}
