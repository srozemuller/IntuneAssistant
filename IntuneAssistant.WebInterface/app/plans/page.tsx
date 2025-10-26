'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Check,
    Crown,
    Heart,
    Headphones,
    Rocket,
    Shield,
    Users,
    Zap,
    ArrowRight,
    Star,
    Mail,
    Building2,
    Hash,
    ExternalLink
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';

interface PlanFeature {
    name: string;
    included: boolean;
    description?: string;
}

interface Plan {
    name: string;
    description: string;
    price: string;
    priceDescription: string;
    badge?: string;
    badgeColor?: string;
    icon: React.ReactNode;
    features: PlanFeature[];
    cta: string;
    ctaVariant: 'default' | 'secondary' | 'outline';
    popular?: boolean;
    gradient: string;
}

export default function PlansPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'support' | 'extensions'>('support');

    const getDialogContent = () => {
        if (dialogType === 'support') {
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

I'm interested in the ${dialogType === 'support' ? 'Support' : 'Extensions'} License for Intune Assistant.

Company Information:
- Company Name: [Please provide your company name]
- Number of Tenants: [Please specify total number of tenants]
- Use Case: [Brief description of your needs]

Please provide more information about pricing and next steps.

Best regards,
[Your name]`;

    const mailtoLink = `mailto:administrator@controlflex.eu?subject=${encodeURIComponent(dialogContent.emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const handlePlanAction = (planName: string) => {
        if (planName === 'Support License') {
            setDialogType('support');
            setDialogOpen(true);
        } else if (planName === 'Extensions License') {
            setDialogType('extensions');
            setDialogOpen(true);
        }
        // Community plan doesn't need dialog
    };

    const plans: Plan[] = [
        {
            name: 'Community',
            description: 'Perfect for individuals and small teams getting started with Intune management',
            price: 'Free',
            priceDescription: 'Forever',
            badge: 'Most Popular',
            badgeColor: 'bg-green-500',
            icon: <Heart className="h-6 w-6 text-green-500" />,
            gradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
            features: [
                { name: 'All core Intune Assistant features', included: true },
                { name: 'Unlimited device management', included: true },
                { name: 'Policy assignments overview', included: true },
                { name: 'Configuration analysis', included: true },
                { name: 'Conditional Access insights', included: true },
                { name: 'Policy comparison tools', included: true },
                { name: 'Community support (GitHub)', included: true },
                { name: 'Regular feature updates', included: true }
            ],
            cta: 'Start here',
            ctaVariant: 'outline',
            popular: true
        },
        {
            name: 'Support License',
            description: 'Get professional support while keeping all community features completely free',
            price: '$49',
            priceDescription: 'per month',
            icon: <Headphones className="h-6 w-6 text-blue-500" />,
            gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
            features: [
                { name: 'Everything in Community', included: true, description: 'All features remain free' },
                { name: 'Priority email support', included: true },
                { name: 'Technical assistance', included: true },
                { name: 'Direct access to developers', included: true },
                { name: 'Custom troubleshooting', included: true },
                { name: 'Feature request priority', included: true },
                { name: 'Advanced extensions', included: false },
                { name: 'Custom integrations', included: false }
            ],
            cta: 'Get Support',
            ctaVariant: 'secondary'
        },
        {
            name: 'Extensions License',
            description: 'Unlock advanced automation and enterprise features with premium support included',
            price: '$149',
            priceDescription: 'per month',
            badge: 'Most Powerful',
            badgeColor: 'bg-purple-500',
            icon: <Crown className="h-6 w-6 text-amber-500" />,
            gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
            features: [
                { name: 'Everything in Community + Support', included: true },
                { name: 'Assignment Manager extension', included: true },
                { name: 'Advanced automation tools', included: true },
                { name: 'Custom reporting dashboards', included: true },
                { name: 'API integrations', included: true },
                { name: 'Bulk operations', included: true },
                { name: 'Custom feature development', included: true }
            ],
            cta: 'Add Extensions',
            ctaVariant: 'default'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <Star className="h-3 w-3 mr-1" />
                            Choose Your Plan
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Community Forever
                </span>
                            <br />
                            <span className="text-2xl md:text-4xl font-medium text-gray-600 dark:text-gray-300">
                    Enhanced with{' '}
                </span>
                            <span className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                    Extensions
                </span>
                        </h1>
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                All core features are completely free forever. No catches, no limitations.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 px-4 py-2 rounded-full">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                            Community: Always Free
                        </span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 px-4 py-2 rounded-full">
                                    <Headphones className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                            Optional: Professional Support
                        </span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 px-4 py-2 rounded-full">
                                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                            Optional: Advanced Extensions
                        </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
                                plan.popular && "border-green-200 dark:border-green-800 shadow-lg scale-105",
                                !plan.popular && "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            )}
                        >
                            {/* Background Gradient */}
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", plan.gradient)} />

                            {/* Popular Badge */}
                            {plan.badge && (
                                <div className="absolute top-4 right-4 z-10">
                                    <Badge className={cn("text-white font-medium", plan.badgeColor)}>
                                        {plan.badge}
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="relative pb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {plan.icon}
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {plan.name}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                    {plan.description}
                                </CardDescription>

                                {/*/!* Pricing *!/*/}
                                {/*<div className="mt-6">*/}
                                {/*    <div className="flex items-baseline gap-2">*/}
                                {/*        <span className="text-4xl font-bold text-gray-900 dark:text-white">*/}
                                {/*            {plan.price}*/}
                                {/*        </span>*/}
                                {/*        {plan.price !== 'Free' && (*/}
                                {/*            <span className="text-gray-500 dark:text-gray-400">*/}
                                {/*                /{plan.priceDescription}*/}
                                {/*            </span>*/}
                                {/*        )}*/}
                                {/*    </div>*/}
                                {/*    {plan.price === 'Free' && (*/}
                                {/*        <p className="text-green-600 dark:text-green-400 font-medium">*/}
                                {/*            {plan.priceDescription}*/}
                                {/*        </p>*/}
                                {/*    )}*/}
                                {/*</div>*/}
                            </CardHeader>

                            <CardContent className="relative">
                                {/* Features List */}
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <div className={cn(
                                                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                                                feature.included
                                                    ? "bg-green-100 dark:bg-green-900/50"
                                                    : "bg-gray-100 dark:bg-gray-800"
                                            )}>
                                                <Check className={cn(
                                                    "h-3 w-3",
                                                    feature.included
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-gray-400"
                                                )} />
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    feature.included
                                                        ? "text-gray-900 dark:text-white"
                                                        : "text-gray-400 dark:text-gray-500"
                                                )}>
                                                    {feature.name}
                                                </span>
                                                {feature.description && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                        {feature.description}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    onClick={() => handlePlanAction(plan.name)}
                                    className={cn(
                                        "w-full font-medium",
                                        plan.ctaVariant === 'default' && "bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white",
                                        plan.ctaVariant === 'outline' && "border-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/20"
                                    )}
                                    variant={plan.ctaVariant}
                                >
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Will Community features ever become paid?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Never. All current Community features will remain completely free forever. We only charge for additional support and advanced extensions.
                            </p>
                        </div>
                        <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                What&apos;s the difference between Support and Extensions licenses?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Support License gives you professional help while keeping all features free. Extensions License includes advanced automation tools, enterprise features, and premium support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* License Request Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {dialogType === 'support' ? (
                                <Headphones className="h-5 w-5 text-blue-500" />
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
                                What you'll get:
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
