'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { useGdapTenantOnboarding, type PartnerTenant } from '@/hooks/useGdapTenantOnboarding';

interface GdapTenantSelectorProps {
    isVisible: boolean;
    customerName: string;
    onTenantSelected: (tenant: PartnerTenant) => void;
    onBack: () => void;
    onConsentStarted: (popup: Window) => void;
}

export const GdapTenantSelector: React.FC<GdapTenantSelectorProps> = ({
                                                                          isVisible,
                                                                          customerName,
                                                                          onTenantSelected,
                                                                          onBack,
                                                                          onConsentStarted
                                                                      }) => {
    const {
        partnerTenants,
        selectedTenant,
        setSelectedTenant,
        loading,
        error,
        fetchPartnerTenants,
        startTenantOnboarding,
        resetSelection
    } = useGdapTenantOnboarding();

    useEffect(() => {
        if (isVisible) {
            fetchPartnerTenants();
        } else {
            resetSelection();
        }
    }, [isVisible, fetchPartnerTenants, resetSelection]);

    const handleTenantSelect = (tenant: PartnerTenant) => {
        setSelectedTenant(tenant);
    };

    const handleProceedToOnboarding = () => {
        if (selectedTenant) {
            onTenantSelected(selectedTenant);
            const popup = startTenantOnboarding(selectedTenant, customerName);
            if (popup) {
                onConsentStarted(popup);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Select Partner Tenant
                    </h3>
                    <p className="text-muted-foreground">Choose a tenant to add to {customerName}</p>
                </div>
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
            </div>

            {loading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading available tenants...</span>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                    <CardContent className="flex items-center py-4">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-800 dark:text-red-200">Error: {error}</span>
                    </CardContent>
                </Card>
            )}

            {partnerTenants.length > 0 && (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        {partnerTenants.map((tenant) => (
                            <Card
                                key={tenant.tenantId}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    selectedTenant?.tenantId === tenant.tenantId
                                        ? 'ring-2 ring-primary border-primary'
                                        : 'hover:border-primary/50'
                                }`}
                                onClick={() => handleTenantSelect(tenant)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Building className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{tenant.displayName}</CardTitle>
                                                <CardDescription>{tenant.domain}</CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                            Available
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p><strong>Tenant ID:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{tenant.tenantId}</code></p>
                                        {tenant.country && <p><strong>Country:</strong> {tenant.country}</p>}
                                        {tenant.createdDateTime && (
                                            <p><strong>Created:</strong> {new Date(tenant.createdDateTime).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedTenant && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Ready to Add Tenant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Customer:</span>
                                        <span className="text-sm">{customerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Tenant:</span>
                                        <span className="text-sm">{selectedTenant.displayName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Domain:</span>
                                        <span className="text-sm font-mono">{selectedTenant.domain}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProceedToOnboarding}
                                    className="w-full"
                                    size="lg"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Start GDAP Onboarding
                                </Button>

                                <p className="text-sm text-muted-foreground text-center">
                                    This will open the Microsoft consent flow in a new window
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {partnerTenants.length === 0 && !loading && !error && (
                <Card>
                    <CardContent className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold mb-2">No Available Tenants</p>
                        <p className="text-muted-foreground">
                            All your partner tenants are already onboarded or there are no tenants available for GDAP onboarding.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
