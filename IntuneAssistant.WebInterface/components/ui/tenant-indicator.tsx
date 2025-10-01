// components/ui/tenant-indicator.tsx
'use client';
import { useTenant } from '@/contexts/TenantContext';
import { Badge } from '@/components/ui/badge';
import { Building, X } from 'lucide-react';
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
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b animate-in slide-in-from-top duration-300">
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
