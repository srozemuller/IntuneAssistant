import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Building, X } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useRouter } from 'next/navigation';

export const GdapStatus = () => {
    const { selectedTenant, setSelectedTenant } = useCustomer();
    const router = useRouter();

    if (!selectedTenant) return null;

    return (
        <Card className="border-blue-200 bg-blue-50 mb-4">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-blue-600" />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-900">GDAP Mode Active:</span>
                                <span className="text-blue-800">{selectedTenant.displayName}</span>
                                <Badge variant="outline" className="text-xs">
                                    {selectedTenant.tenantId.substring(0, 8)}...
                                </Badge>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                All operations will be performed in the context of this customer tenant
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/customer')}
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                            <Building className="h-4 w-4 mr-1" />
                            Change
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTenant(null)}
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
