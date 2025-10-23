// components/ui/tenant-indicator.tsx
'use client';
import { useTenant } from '@/contexts/TenantContext';
import { Badge } from '@/components/ui/badge';
import { Building, X, ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function TenantIndicator() {
    const { selectedTenant, setSelectedTenant } = useTenant();
    const router = useRouter();

    if (!selectedTenant) return null;

    const handleClearTenant = () => {
        setSelectedTenant(null);
        router.push('/');
    };

    return (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-yellow-50 via-yellow-100/80 to-amber-50 dark:from-yellow-950/90 dark:via-yellow-900/80 dark:to-amber-950/90 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/60 dark:supports-[backdrop-filter]:bg-yellow-950/60 border-b border-yellow-200/50 dark:border-yellow-800/50 animate-in slide-in-from-top duration-300 shadow-sm">

            <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Active Tenant:
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                                {selectedTenant.displayName}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                {selectedTenant.domainName}
                            </Badge>
                            {selectedTenant.isPrimary && (
                                <Badge variant="default" className="text-xs">
                                    Primary
                                </Badge>
                            )}
                            {!selectedTenant.isEnabled && (
                                <Badge variant="destructive" className="text-xs">
                                    Disabled
                                </Badge>
                            )}
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => router.push('/customer')}
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeftRight className="h-3 w-3 mr-1" />
                                Change
                            </Button>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearTenant}
                        className="h-8 w-8 p-0 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear tenant selection</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
