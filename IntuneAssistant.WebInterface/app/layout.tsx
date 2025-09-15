'use client'
import { Inter } from 'next/font/google';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msalConfig';
import { TenantProvider } from '@/contexts/TenantContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
                <TenantProvider>
                    <SidebarProvider>
                        <div className="flex min-h-screen bg-background text-foreground">
                            <Sidebar />
                            <main className="flex-1 p-8 transition-all duration-300">
                                {children}
                            </main>
                        </div>
                    </SidebarProvider>
                </TenantProvider>
            </MsalProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
