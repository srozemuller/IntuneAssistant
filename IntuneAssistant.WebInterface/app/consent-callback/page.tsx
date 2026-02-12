// app/consent-callback/page.tsx
import { Suspense } from 'react';
import ConsentCallbackContent from './consent-callback-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Loading...
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please wait...
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

export default function ConsentCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConsentCallbackContent />
        </Suspense>
    );
}