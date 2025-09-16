'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Building, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import CustomerOnboardingModal from '@/components/onboarding/customer-onboarding';

export default function CustomerOnboardingPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    const onboardingFeatures = [
        {
            title: "Customer Registration",
            description: "Register the tenant and customer details",
            icon: Building,
            color: "text-blue-600"
        },
        {
            title: "Tenant Integration",
            description: "Connect the Microsoft tenant to Intune Assistant",
            icon: Shield,
            color: "text-green-600"
        },
        {
            title: "Admin Consent",
            description: "Secure permission flow for accessing customer's Intune environment",
            icon: Users,
            color: "text-purple-600"
        }
    ];

    const handleOnboardingSuccess = () => {
        // Handle successful onboarding - redirect or refresh data
        console.log('Customer onboarded successfully');
        // You can add navigation logic here, e.g., router.push('/customers')
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="mb-4">
                        Customer Management
                    </Badge>
                    <h1 className="text-4xl font-bold">Onboard New Customer</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Add a new customer and connect their Microsoft tenant to your Intune management portal
                    </p>
                </div>

                {/* Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {onboardingFeatures.map((feature, index) => (
                        <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className={`p-3 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 ${feature.color} mb-2`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Main Action Card */}
                <Card className="relative overflow-hidden border-yellow-200 dark:border-yellow-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10"></div>
                    <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl mb-2">Ready to Add a New Customer?</CardTitle>
                                <CardDescription className="text-base">
                                    Our streamlined onboarding process will guide you through:
                                </CardDescription>
                            </div>
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">Customer information and tenant details collection</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">Automated validation and verification process</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">Secure admin consent flow with proper permissions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">Immediate access to your Intune environment</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowOnboarding(true)}
                            size="lg"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Start Customer Onboarding
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="mt-3 text-center">
                            <a
                                href="https://docs.intuneassistant.cloud/docs/onboarding#why-onboarding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:text-primary underline"
                            >
                                Why register?
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Process Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Process</CardTitle>
                        <CardDescription>
                            Simple 4-step process to get your customer connected
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <Building className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold mb-2">1. Customer Details</h4>
                                <p className="text-sm text-muted-foreground">Enter customer and tenant information</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-semibold mb-2">2. Validation</h4>
                                <p className="text-sm text-muted-foreground">Verify and confirm information</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="font-semibold mb-2">3. Admin Consent</h4>
                                <p className="text-sm text-muted-foreground">Grant necessary permissions</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h4 className="font-semibold mb-2">4. Complete</h4>
                                <p className="text-sm text-muted-foreground">Customer ready for management</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Onboarding Modal */}
            <CustomerOnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onSuccess={handleOnboardingSuccess}
            />
        </div>
    );
}
