'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto h-14 w-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">You are all set</h1>
                    <p className="text-muted-foreground">
                        Your tenant is connected with read-only access. Pick a question on the home page and see what your tenant says.
                    </p>
                </div>
                <Button asChild size="lg" className="w-full">
                    <Link href="/">
                        Start exploring
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                    You can remove access at any time by deleting the IntuneAssistant enterprise application in Microsoft Entra ID.
                </p>
            </div>
        </div>
    );
}
