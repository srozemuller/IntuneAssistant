import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface CancelledCardProps {
    onRetry: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export function CancelledCard({
    onRetry,
    title = "Request Cancelled",
    description = "The data loading request was cancelled. Click below to try again.",
    buttonText = "Retry"
}: CancelledCardProps) {
    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
            <CardContent className="pt-6">
                <div className="text-center py-12">
                    <div className="text-orange-400 mb-6">
                        <XCircle className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        {description}
                    </p>
                    <Button
                        onClick={onRetry}
                        className="flex items-center gap-2 mx-auto"
                        size="lg"
                    >
                        {buttonText}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}