'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Info, Users, Building, Lock, AlertCircle } from 'lucide-react';

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

    const handleOnboardingSubmit = () => {
        // Handle onboarding logic here
        console.log('Onboarding with GDAP:', isGdapMode);
        onSuccess();
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
                                            <h4 className="font-medium">Authentication Method</h4>
                                            <Info className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={isGdapMode}
                                                    onCheckedChange={setIsGdapMode}
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
                                    <Button onClick={handleOnboardingSubmit} className="flex-1">
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
