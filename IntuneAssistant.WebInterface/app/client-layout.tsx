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
import { MonitorProvider } from '@/contexts/MonitorContext';
import { AuditEventsProvider } from '@/contexts/AuditEventsContext';
import { GlobalErrorDisplay } from '@/components/GlobalErrorDisplay';
import { TenantIndicator } from '@/components/ui/tenant-indicator';
import { ConsentBanner } from '@/components/ConsentBanner';
import { VerifyConsentOnMount } from '@/components/VerifyConsentOnMount';

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={cn(isCollapsed && "sidebar-collapsed")}>
            <VerifyConsentOnMount />
            <ConsentBanner />
            <Sidebar />
            <main>
                <div className="p-6">
                    <TenantIndicator />
                    <GlobalErrorDisplay />
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
                                <MonitorProvider>
                                    <AuditEventsProvider>
                                        <SidebarProvider>
                                            <MainContent>
                                                {children}
                                            </MainContent>
                                        </SidebarProvider>
                                    </AuditEventsProvider>
                                </MonitorProvider>
                            </TenantProvider>
                        </CustomerProvider>
                    </ConsentProvider>
                </ErrorProvider>
            </MsalProvider>
        </ThemeProvider>
    );
}
