// Create a new component file: components/ConsentWarning.tsx
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { hasTenantsNeedingConsent } from '@/contexts/CustomerContext';

export default function ConsentWarning() {
    const { customerData } = useCustomer();

    if (!customerData || !hasTenantsNeedingConsent(customerData)) {
        return null;
    }

    return (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 mb-6">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Consent Required</span>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    One or more tenants require admin consent to complete setup.{' '}
                    <a
                        href="/customer"
                        className="underline hover:text-orange-800 dark:hover:text-orange-200 font-medium"
                    >
                        Visit the customer page
                    </a>{' '}
                    to grant consent.
                </p>
            </CardContent>
        </Card>
    );
}
