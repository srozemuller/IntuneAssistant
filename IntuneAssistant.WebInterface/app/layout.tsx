// app/layout.tsx (Server Component)
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ClientLayout } from './client-layout';
import './globals.css';
import Script from 'next/script';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Intune Assistant',
    description: 'Manage your (multiple) Intune tenants with ease',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            {GA_MEASUREMENT_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${GA_MEASUREMENT_ID}');
                        `}
                    </Script>
                </>
            )}
        </head>
        <body className={inter.className}>
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}
