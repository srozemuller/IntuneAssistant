// app/layout.tsx (Server Component)
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ClientLayout } from './client-layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Multi-Tenant Dashboard',
    description: 'Manage your Azure AD tenants',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}
