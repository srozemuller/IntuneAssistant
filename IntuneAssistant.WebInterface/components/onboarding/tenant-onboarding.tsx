'use client';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react'; // adding this to get the home tenant id for onboarding
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {Info, Users, Building, Lock, AlertCircle, Loader2, CheckCircle, RefreshCw} from 'lucide-react';
import { useGdapTenantOnboarding, type PartnerTenant } from '@/hooks/useGdapTenantOnboarding';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface TenantOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    onSuccess: () => void;
}

interface AvailableApp {
    id: string;
    name: string;
    description: string;
    version: string;
}

const AVAILABLE_APPS: AvailableApp[] = [
    {
        id: 'app-1',
        name: 'Security Dashboard',
        description: 'Complete security monitoring and threat detection',
        version: '2.1.0'
    },
    {
        id: 'app-2',
        name: 'Compliance Manager',
        description: 'Automated compliance reporting and auditing',
        version: '1.8.3'
    },
    {
        id: 'app-3',
        name: 'Identity Governance',
        description: 'Identity and access management solutions',
        version: '3.0.1'
    }
];

export default function TenantOnboardingModal({
                                                  isOpen,
                                                  onClose,
                                                  customerId,
                                                  customerName,
                                                  onSuccess
                                              }: TenantOnboardingModalProps) {
    const [activeTab, setActiveTab] = useState('onboarding');
    const [isGdapMode, setIsGdapMode] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string>('');
    const [isCustomAppGdap, setIsCustomAppGdap] = useState(false);
    const { accounts } = useMsal();

    // Get the logged-in user's tenant ID from MSAL account
    const loggedInUserTenantId = accounts[0]?.tenantId || accounts[0]?.homeAccountId?.split('.')[1];
    console.log('Logged in user tenant ID (home):', loggedInUserTenantId);
    console.log('Account info:', accounts[0]);
    const {
        partnerTenants,
        selectedTenant,
        setSelectedTenant,
        loading,
        error,
        fetchPartnerTenants,
        resetSelection
    } = useGdapTenantOnboarding(loggedInUserTenantId);

    // Fetch partner tenants when GDAP mode is enabled
    useEffect(() => {
        if (!isGdapMode) {
            resetSelection();
        }
    }, [isGdapMode, resetSelection]);


    const handleGdapToggle = (checked: boolean) => {
        setIsGdapMode(checked);
        if (!checked) {
            setSelectedTenant(null);
        }
    };

    const handleOnboardingSubmit = async () => {
        if (isGdapMode && !selectedTenant) {
            alert('Please select a partner tenant');
            return;
        }

        if (!loggedInUserTenantId) {
            alert('Unable to determine your tenant ID. Please try logging in again.');
            return;
        }

        try {
            const onboardingData = {
                customerTenantId: isGdapMode ? selectedTenant?.tenantId : customerId,
                partnerTenantId: loggedInUserTenantId, // Use logged-in user's tenant ID
                authMethod: isGdapMode ? 'GDAP' : 'Interactive',
                customerName,
                ...(isGdapMode && selectedTenant && {
                    selectedPartnerTenant: {
                        tenantId: selectedTenant.tenantId,
                        displayName: selectedTenant.displayName,
                        domain: selectedTenant.domain
                    }
                })
            };

            console.log('Onboarding with partner tenant:', loggedInUserTenantId);
            console.log('Onboarding data:', onboardingData);

            // Make your API call here
            // const response = await request('/api/tenant/onboard', {
            //     method: 'POST',
            //     body: JSON.stringify(onboardingData)
            // });

            onSuccess();
        } catch (error) {
            console.error('Onboarding failed:', error);
            alert('Onboarding failed. Please try again.');
        }
    };

    const handleCustomAppSubmit = () => {
        // Handle custom app logic here
        console.log('Custom app:', selectedApp, 'with GDAP:', isCustomAppGdap);
        onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Add Tenant - {customerName}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="onboarding">
                            <Users className="h-4 w-4 mr-2" />
                            Tenant Onboarding
                        </TabsTrigger>
                        <TabsTrigger value="custom-app" disabled>
                            <Lock className="h-4 w-4 mr-2" />
                            Custom Application
                            <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="onboarding" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Tenant Onboarding Options
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to onboard this tenant to your services
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* GDAP Toggle */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium">Authentication Method (Interactive/GDAP)</h4>
                                            <Info className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={isGdapMode}
                                                    onCheckedChange={handleGdapToggle}
                                                />
                                                <span className="font-medium">
                                                    {isGdapMode ? 'GDAP Relationship' : 'User Interactive Mode'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 ml-8">
                                                {isGdapMode ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-orange-700">GDAP Relationship Mode:</p>
                                                        <p>• Uses Granular Delegated Admin Privileges (GDAP)</p>
                                                        <p>• Requires pre-established partner relationship in Partner Center</p>
                                                        <p>• Provides role-based access with specific permissions</p>
                                                        <p>• More secure and compliant for MSP scenarios</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-blue-700">User Interactive Mode:</p>
                                                        <p>• Requires customer admin to manually consent</p>
                                                        <p>• User will be redirected to Microsoft login</p>
                                                        <p>• Suitable for direct customer onboarding</p>
                                                        <p>• Provides immediate access after consent</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* GDAP Tenant Selection - Show when GDAP is enabled */}
                                {isGdapMode && (
                                    <Card className="border-blue-200 bg-blue-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-800">Your Partner Tenant</p>
                                                    <p className="text-sm text-blue-600">
                                                        Tenant ID: {loggedInUserTenantId || 'Not available'}
                                                    </p>
                                                    <p className="text-xs text-blue-500">
                                                        This is your logged-in tenant that will provide services
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {isGdapMode && (
                                    <Card className="border-primary/20 bg-primary/5">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">Select Partner Tenant</CardTitle>
                                                    <CardDescription>
                                                        Choose which partner tenant to add to {customerName}
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={fetchPartnerTenants}
                                                    disabled={loading || !loggedInUserTenantId}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />
                                                    Refresh
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {partnerTenants.length === 0 && !loading && !error && (
                                                <Button
                                                    onClick={fetchPartnerTenants}
                                                    className="w-full"
                                                    disabled={!loggedInUserTenantId}
                                                >
                                                    {loggedInUserTenantId
                                                        ? `Load Partner Tenants for ${loggedInUserTenantId.slice(0, 8)}...`
                                                        : 'Tenant ID not available'
                                                    }
                                                </Button>
                                            )}
                                            {/* Option 3: Skeleton Loading Animation */}
                                            {loading && (
                                                <div className="space-y-4">
                                                    {/* Header skeleton */}
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-primary/20 rounded-lg animate-pulse flex items-center justify-center">
                                                            <Building className="h-4 w-4 text-primary animate-pulse" />
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <div className="h-5 bg-primary/20 rounded animate-pulse w-48"></div>
                                                            <div className="h-4 bg-primary/10 rounded animate-pulse w-64"></div>
                                                        </div>
                                                    </div>

                                                    {/* Skeleton tenant items */}
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="border rounded-lg p-4 space-y-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                                                                <div className="space-y-2 flex-1">
                                                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                                                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-32"></div>
                                                                </div>
                                                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="text-center">
                                                        <div className="inline-flex items-center space-x-2 text-primary">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span className="text-sm font-medium">Loading tenant data...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {error && (
                                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                                    <AlertCircle className="h-4 w-4" />
                                                    {error}
                                                </div>
                                            )}
                                            {/*Tenant selection area*/}
                                            {!loading && !error && partnerTenants.length > 0 && (
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium">Available Partner Tenants</label>

                                                    {/* Searchable Command Component */}
                                                    <Command className="rounded-lg border shadow-md">
                                                        <CommandInput
                                                            placeholder="Search tenants by name or domain..."
                                                            className="h-9"
                                                        />
                                                        <CommandEmpty>No tenants found matching your search.</CommandEmpty>
                                                        <CommandList className="max-h-60 overflow-y-auto">
                                                            <CommandGroup>
                                                                {partnerTenants.map((tenant) => (
                                                                    <CommandItem
                                                                        key={tenant.tenantId}
                                                                        value={`${tenant.displayName} ${tenant.domain}`}
                                                                        onSelect={() => {
                                                                            // Only allow selection of non-onboarded tenants
                                                                            if (!tenant.isOnboarded) {
                                                                                setSelectedTenant(tenant);
                                                                            }
                                                                        }}
                                                                        disabled={tenant.isOnboarded}
                                                                        className={`cursor-pointer ${tenant.isOnboarded ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center space-x-3">
                                                                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                                                                    <Building className="h-4 w-4 text-white" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-medium">{tenant.displayName}</span>
                                                                                    <span className="text-xs text-gray-500">{tenant.domain}</span>
                                                                                    <span className="text-xs text-gray-400">ID: {tenant.tenantId.slice(0, 8)}...</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center space-x-2">
                                                                                {tenant.isOnboarded ? (
                                                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                                        Onboarded
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                                        Available
                                                                                    </Badge>
                                                                                )}
                                                                                {selectedTenant?.tenantId === tenant.tenantId && !tenant.isOnboarded && (
                                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>

                                                    {/* Search Results Summary */}
                                                    <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                        <div className="flex items-center gap-4">
                <span>
                    <strong>{partnerTenants.filter(t => !t.isOnboarded).length}</strong> available
                </span>
                                                            <span>
                    <strong>{partnerTenants.filter(t => t.isOnboarded).length}</strong> already onboarded
                </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs">Total: {partnerTenants.length}</span>
                                                            {partnerTenants.length >= 100 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Use search to find tenants quickly
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {selectedTenant && (
                                                        <Card className="bg-green-50 border-green-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                    <div>
                                                                        <p className="font-medium">{selectedTenant.displayName}</p>
                                                                        <p className="text-sm text-gray-600">{selectedTenant.domain}</p>
                                                                        <p className="text-xs text-gray-500">Tenant ID: {selectedTenant.tenantId}</p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            )}


                                            {!loading && !error && partnerTenants.length === 0 && (
                                                <div className="text-center py-6 text-gray-500">
                                                    <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-sm">No partner tenants found</p>
                                                </div>
                                            )}

                                            {!loading && !error && partnerTenants.length > 0 && partnerTenants.every(t => t.isOnboarded) && (
                                                <div className="text-center py-6 text-amber-600 bg-amber-50 rounded-md">
                                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-sm font-medium">All partner tenants are already onboarded</p>
                                                    <p className="text-xs mt-1">No new tenants available for onboarding</p>
                                                </div>
                                            )}


                                            {!loading && !error && partnerTenants.length === 0 && (
                                                <div className="text-center py-6 text-gray-500">
                                                    <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-sm">No available partner tenants found</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Additional Information Card */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Important Notes:</p>
                                                <ul className="space-y-1 list-disc list-inside">
                                                    <li>GDAP relationships must be pre-configured in Partner Center</li>
                                                    <li>User Interactive mode requires customer admin participation</li>
                                                    <li>Both methods will provision the tenant for monitoring services</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleOnboardingSubmit}
                                        className="flex-1"
                                        disabled={isGdapMode && !selectedTenant}
                                    >
                                        {isGdapMode ? 'Setup GDAP Onboarding' : 'Start Interactive Onboarding'}
                                    </Button>
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="custom-app" className="space-y-4 mt-6">
                        <Card className="opacity-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Custom Application Deployment
                                    <Badge variant="secondary">Coming Soon</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Deploy specific applications to the tenant (Feature under development)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* App Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Select Application</label>
                                    <Select value={selectedApp} onValueChange={setSelectedApp} disabled>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an application to deploy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_APPS.map((app) => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{app.name}</span>
                                                        <span className="text-xs text-gray-500">{app.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* GDAP Toggle for Custom App */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium">Authentication Method</h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={isCustomAppGdap}
                                                onCheckedChange={setIsCustomAppGdap}
                                                disabled
                                            />
                                            <span className="font-medium">
                                                {isCustomAppGdap ? 'GDAP Relationship' : 'User Interactive Mode'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleCustomAppSubmit} disabled className="flex-1">
                                        Deploy Application
                                    </Button>
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
