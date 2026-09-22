// app/client-layout.tsx (Client Component)
'use client';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msalConfig';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { GlobalErrorDisplay } from '@/components/GlobalErrorDisplay';
import { ConsentBanner } from '@/components/ConsentBanner';
import { VerifyConsentOnMount } from '@/components/VerifyConsentOnMount';
import { SessionExpiredDialog } from '@/components/SessionExpiredDialog';
import { TenantOverviewProvider } from '@/contexts/TenantOverviewContext';
import { OverviewStreamStatus } from '@/components/OverviewStreamStatus';
import { TenantSearch } from '@/components/TenantSearch';

/**
 * Tenant Overview's global search dialog + status pill. Available to every connected community
 * account. Note: the backend endpoint (`v1/overview/stream`) still carries
 * `[Authorize(Policy = "RequireBetaTester")]` — a per-customer flag the frontend cannot grant. Until
 * that policy is revisited (tracked in the backend todo list), most accounts will simply never see
 * the stream complete; `TenantOverviewContext` treats that specific 403 as quietly idle rather than
 * a visible failure, so this renders unconditionally without showing anyone a broken feature.
 */
function TenantOverviewGlobalUi() {
    return (
        <>
            <OverviewStreamStatus />
            <TenantSearch />
        </>
    );
}

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={cn(isCollapsed && 'sidebar-collapsed')}>
            <VerifyConsentOnMount />
            <ConsentBanner />
            <SessionExpiredDialog />
            <Sidebar />
            <TenantOverviewGlobalUi />
            <main>
                <div className="p-6">
                    <GlobalErrorDisplay />
                    {children}
                </div>
            </main>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <MsalProvider instance={msalInstance}>
                <ErrorProvider>
                    <ConsentProvider>
                        <CustomerProvider>
                            <TenantOverviewProvider>
                                <SidebarProvider>
                                    <MainContent>{children}</MainContent>
                                </SidebarProvider>
                            </TenantOverviewProvider>
                        </CustomerProvider>
                    </ConsentProvider>
                </ErrorProvider>
            </MsalProvider>
        </ThemeProvider>
    );
}
