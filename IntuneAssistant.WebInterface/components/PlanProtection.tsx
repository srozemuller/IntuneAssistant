'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, ArrowRight, Zap, Mail, Building2, Hash, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PlanProtectionProps {
    children: React.ReactNode;
    requiredPlan: 'support' | 'extensions';
    featureName: string;
}

export function PlanProtection({ children, requiredPlan, featureName }: PlanProtectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    // This would normally come from your user/subscription context
    const hasValidPlan = true; // Replace with actual plan check logic

    if (hasValidPlan) {
        return <>{children}</>;
    }

    const planInfo = {
        support: {
            title: 'Support License Required',
            description: 'Professional support and advanced features',
            icon: Shield,
            color: 'blue'
        },
        extensions: {
            title: 'Extensions License Required',
            description: 'Advanced automation and enterprise features',
            icon: Crown,
            color: 'amber'
        }
    };

    const plan = planInfo[requiredPlan];
    const getDialogContent = () => {
        if (requiredPlan === 'support') {
            return {
                title: 'Get Professional Support',
                description: 'Ready to get professional support for your Intune Assistant usage?',
                emailSubject: 'Support License Request',
                features: [
                    'Priority email support',
                    'Technical assistance from experts',
                    'Direct access to developers',
                    'Custom troubleshooting help'
                ]
            };
        } else {
            return {
                title: 'Unlock Advanced Extensions',
                description: 'Ready to enhance your Intune management with powerful enterprise features?',
                emailSubject: 'Extensions License Request',
                features: [
                    'Assignment Manager extension',
                    'Advanced automation tools',
                    'Custom reporting dashboards',
                    'Bulk operations & API integrations'
                ]
            };
        }
    };

    const dialogContent = getDialogContent();
    const emailBody = `Hello,

I'm interested in the ${requiredPlan === 'support' ? 'Support' : 'Extensions'} License for Intune Assistant.

Company Information:
- Company Name: [Please provide your company name]
- Number of Tenants: [Please specify total number of tenants]
- Use Case: [Brief description of your needs]

Please provide more information about pricing and next steps.

Best regards,
[Your name]`;

    const mailtoLink = `mailto:administrator@controlflex.eu?subject=${encodeURIComponent(dialogContent.emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <div className={`inline-flex p-3 rounded-full mb-6 ${
                        plan.color === 'blue'
                            ? 'bg-blue-100 dark:bg-blue-900/50'
                            : 'bg-amber-100 dark:bg-amber-900/50'
                    }`}>
                        <plan.icon className={`h-8 w-8 ${
                            plan.color === 'blue'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-amber-600 dark:text-amber-400'
                        }`} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {plan.title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                        Access to <strong>{featureName}</strong> requires an active license
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        {plan.description}
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <Badge className={`${
                                plan.color === 'blue'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600'
                            } text-white px-4 py-2`}>
                                Premium Feature
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-white">
                            Unlock {featureName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                What you&apos;ll get with the {plan.title.replace(' Required', '')}:
                            </h3>
                            <ul className="space-y-3">
                                {requiredPlan === 'extensions' ? (
                                    <>
                                        <li className="flex items-center gap-3">
                                            <Zap className="h-5 w-5 text-green-500" />
                                            <span>Assignment Manager - Bulk policy assignments</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Zap className="h-5 w-5 text-green-500" />
                                            <span>Advanced automation tools and workflows</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Zap className="h-5 w-5 text-green-500" />
                                            <span>Custom reporting and analytics</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Zap className="h-5 w-5 text-green-500" />
                                            <span>API integrations and bulk operations</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span>Priority email support from experts</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span>Direct access to developers</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span>Custom troubleshooting assistance</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span>Technical guidance and best practices</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                <Link href="/plans">
                                    View Plans & Pricing
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(true)}
                                className="flex-1"
                            >
                                Contact
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Need help choosing the right plan?{' '}
                                <button
                                    onClick={() => setDialogOpen(true)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Contact our team
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* License Request Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {requiredPlan === 'support' ? (
                                <Shield className="h-5 w-5 text-blue-500" />
                            ) : (
                                <Crown className="h-5 w-5 text-amber-500" />
                            )}
                            {dialogContent.title}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {dialogContent.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Features List */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                What you&apos;ll get:
                            </h4>
                            <ul className="space-y-2">
                                {dialogContent.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Information */}
                        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div className="space-y-2 flex-1">
                                    <p className="font-medium text-amber-800 dark:text-amber-200">
                                        Contact ControlFlex
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Send an email to get started with your license request.
                                        Please include:
                                    </p>
                                    <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 ml-4">
                                        <li className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3" />
                                            Your company name
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Hash className="h-3 w-3" />
                                            Total number of tenants
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                asChild
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                <a href={mailtoLink}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email Request
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="flex-1"
                            >
                                Maybe Later
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Email: administrator@controlflex.eu
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}