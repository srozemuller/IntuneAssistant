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

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300",
                isCollapsed ? "ml-16" : "ml-64"
            )}>
                <TenantIndicator />
                <div className="max-w-8xl mx-auto p-6 space-y-6">
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
                                <SidebarProvider>
                                    <MainContent>
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
