// components/NoTenantSelected.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Shield, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NoTenantSelectedProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    feature?: string;
    showSelectButton?: boolean;
}

export function NoTenantSelected({
                                     icon: Icon = Building,
                                     title = "No Tenant Selected",
                                     description,
                                     feature = "this feature",
                                     showSelectButton = true
                                 }: NoTenantSelectedProps) {
    const router = useRouter();

    const defaultDescription = `Please select a tenant to access ${feature}.`;

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-6">
                            <Icon className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                            {title}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {description || defaultDescription}
                        </p>
                        {showSelectButton && (
                            <Button onClick={() => router.push('/customer')}>
                                Select Tenant
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
