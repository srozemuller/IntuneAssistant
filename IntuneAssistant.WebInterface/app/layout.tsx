'use client'
import { Inter } from 'next/font/google';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msalConfig';
import { TenantProvider } from '@/contexts/TenantContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import './globals.css';
import {CustomerProvider} from "@/contexts/CustomerContext";
import { ConsentProvider } from "@/contexts/ConsentContext";

const inter = Inter({ subsets: ['latin'] });

// Create a component that uses the sidebar context
function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300",
                isCollapsed ? "ml-16" : "ml-64"
            )}>
                <div className="max-w-8xl mx-auto p-6 space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            <MsalProvider instance={msalInstance}>
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
            </MsalProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
