// components/GlobalErrorDisplay.tsx
import { useError } from '@/contexts/ErrorContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, AlertTriangle, Github } from 'lucide-react';

export function GlobalErrorDisplay() {
    const { error, clearError } = useError();

    if (!error) return null;

    const isApiError = error instanceof Error && 'correlationId' in error;
    const correlationId = isApiError ? (error as Error & { correlationId?: string }).correlationId : null;

    const createGitHubIssue = () => {
        const errorName = error instanceof Error ? error.constructor.name : 'Application Error';
        const title = encodeURIComponent(`🪲[Bug]: ${errorName}`);
        const body = encodeURIComponent(
            `## Error Details\n\n` +
            `**Error Message:** ${error.message}\n` +
            `**Correlation ID:** ${correlationId || 'N/A'}\n` +
            `**Timestamp:** ${new Date().toISOString()}\n` +
            `**URL:** ${window.location.href}\n\n` +
            `## Steps to Reproduce\n\n` +
            `[Please describe what you were doing when this error occurred]\n\n` +
            `## Expected Behavior\n\n` +
            `[What did you expect to happen?]`
        );

        // Remove template parameter to use body
        const issueUrl = `https://github.com/srozemuller/IntuneAssistant/issues/new?title=${title}&body=${body}&labels=bug,auto-generated`;
        window.open(issueUrl, '_blank');
    };

    return (
        <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-medium text-red-800 mb-1">Error</h3>
                                <p className="text-sm text-red-700 whitespace-pre-wrap">
                                    {error.message}
                                </p>
                                {correlationId && (
                                    <p className="text-xs text-red-600 mt-1">
                                        Correlation ID: {correlationId}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={clearError}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-4 flex gap-2">
                        {error.retry && (
                            <Button
                                onClick={() => {
                                    error.retry?.();
                                    clearError();
                                }}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        )}
                        <Button
                            onClick={createGitHubIssue}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            Report Issue
                        </Button>
                        <Button
                            onClick={clearError}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                            Dismiss
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
