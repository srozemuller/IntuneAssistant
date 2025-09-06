'use client';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msalConfig';
import { TenantProvider } from '@/contexts/TenantContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <MsalProvider instance={msalInstance}>
            <TenantProvider>
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <main className="ml-64 flex-1 p-8">
                        {children}
                    </main>
                </div>
            </TenantProvider>
        </MsalProvider>
        </body>
        </html>
    );
}
