'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Target,
    Heart,
    Sparkles,
    Shield,
    Globe,
    Users,
    Award,
    Building2,
    ExternalLink,
    CheckCircle,
    Crown,
    TrendingUp,
    GitCompare,
    History,
    Zap,
    Star,
    Check,
    Infinity
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const coreValues = [
        {
            title: "Forever Free",
            description: "Our commitment: All core features will remain completely free for the community, forever. No catches, no limitations.",
            icon: Infinity,
            color: "green"
        },
        {
            title: "Community First",
            description: "Built by the community, for the community. Every decision is made with the community's best interests at heart.",
            icon: Users,
            color: "blue"
        },
        {
            title: "No Barriers",
            description: "Web-based platform requiring only minimal permissions. Get started instantly without infrastructure overhead.",
            icon: Globe,
            color: "purple"
        }
    ];

    const features = [
        {
            title: "Conditional Access Insights",
            description: "Comprehensive analysis of your conditional access policies",
            icon: Shield,
            color: "blue"
        },
        {
            title: "Configuration Policy Insights",
            description: "Deep understanding of your Intune configuration policies",
            icon: Target,
            color: "green"
        },
        {
            title: "All Settings Overview",
            description: "Complete visibility into all your Intune settings",
            icon: Globe,
            color: "purple"
        }
    ];

    const premiumModules = [
        {
            title: "Assignments Manager",
            description: "Helps with enrolling configurations in a scalable and controlled way. Think about bulk assignments with Intune Update Rings in mind.",
            icon: Zap,
            isPaid: true,
            available: true
        },
        {
            title: "Analyser",
            description: "A tool designed to provide in-depth analysis of your Intune configurations, helping you identify potential improvements and optimizations.",
            icon: TrendingUp,
            isPaid: true,
            available: false
        },
        {
            title: "Historicus",
            description: "Tracks and visualizes changes in your Intune environment over time, offering insights into historical trends and configurations.",
            icon: History,
            isPaid: true,
            available: false
        },
        {
            title: "Configuration Comparator",
            description: "Compares different tenant configurations side-by-side, making it easier to spot differences and ensure consistency.",
            icon: GitCompare,
            isPaid: true,
            available: false
        }
    ];

    const getFeatureColorClasses = (color: string) => {
        const colors = {
            blue: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
            green: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
            purple: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800"
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const getIconColorClasses = (color: string) => {
        const colors = {
            blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
            green: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
            purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <Heart className="h-3 w-3 mr-1" />
                            Community Driven
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Community Forever
                            </span>
                            <br />
                            <span className="text-2xl md:text-4xl font-medium text-gray-600 dark:text-gray-300">
                                Enhanced by{' '}
                            </span>
                            <span className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                                Enterprise
                            </span>
                        </h1>
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                Born from community collaboration, evolved through enterprise partnerships.
                                <strong className="text-green-600 dark:text-green-400"> Always free, never limited.</strong>
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 px-4 py-2 rounded-full">
                                    <Infinity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                        Free Forever Guarantee
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 px-4 py-2 rounded-full">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        Community First
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 px-4 py-2 rounded-full">
                                    <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                                        Enterprise Enhanced
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Community Values Section */}
                <Card className="mb-16 shadow-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-8">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                <span className="text-green-600 dark:text-green-400">Community Promise</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Every core feature is completely free forever. This isn&apos;t a freemium model - it&apos;s our commitment to the community.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            {coreValues.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <div key={index} className="text-center">
                                        <div className={`p-4 ${getIconColorClasses(value.color)} rounded-xl w-fit mx-auto mb-4 shadow-lg`}>
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Mission Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <Target className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Story
                            </h2>
                        </div>
                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Community Origins
                                </h3>
                                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                                    The Intune Assistant was born from a <strong>community idea</strong> to create a platform that provides assignment insights quickly.
                                    Developed by <strong className="text-blue-600 dark:text-blue-400">Sander Rozemuller</strong> - Microsoft Intune MVP -
                                    this tool started as a simple solution for the community&apos;s daily challenges.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                <h3 className="font-bold text-lg text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Natural Evolution
                                </h3>
                                <p className="text-green-700 dark:text-green-300 leading-relaxed">
                                    Over time, the tool evolved into a comprehensive platform providing deep insights into Microsoft Intune environments.
                                    <strong> Companies approached me</strong> requesting custom extensions for their specific business workflows,
                                    leading to our enterprise offerings while keeping the core platform completely free.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Enterprise Partnership
                                </h3>
                                <p className="text-amber-700 dark:text-amber-300 leading-relaxed mb-3">
                                    <a
                                        href="https://www.linkedin.com/company/controlflex"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline font-bold"
                                    >
                                        ControlFlex
                                    </a>{' '}
                                    - founded by Microsoft Intune MVPs{' '}
                                    <a
                                        href="https://www.linkedin.com/in/kennethvansurksum/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline font-medium"
                                    >
                                        Kenneth van Surksum
                                    </a>{' '}
                                    and{' '}
                                    <a
                                        href="https://www.linkedin.com/in/sanderrozemuller/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline font-medium"
                                    >
                                        Sander Rozemuller
                                    </a>{' '}
                                    - became the first enterprise partner, investing in the platform to enhance it for both community and enterprise users while enabling professional support at scale.
                                </p>
                            </div>


                        </div>
                    </CardContent>
                </Card>

                {/* Core Features Section */}
                <Card className="mb-16 shadow-xl border-2 border-green-200 dark:border-green-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Complete Platform - Always Free
                            </h2>
                            <div className="flex justify-center mb-4">
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 text-sm shadow-lg">
                                    <Infinity className="h-4 w-4 mr-2" />
                                    Forever Free Guarantee
                                </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                These aren&apos;t limited features - this is the complete Intune management platform,
                                free for every community member, forever.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className={`${getFeatureColorClasses(feature.color)} border-2 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                        <CardContent className="p-6 text-center h-full flex flex-col">
                                            <div className={`p-3 ${getIconColorClasses(feature.color)} rounded-xl w-fit mx-auto mb-4 shadow-lg`}>
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                                                {feature.description}
                                            </p>
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <Check className="h-5 w-5 text-green-500" />
                                                <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                                    Free Forever
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Enterprise Extensions Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                    <Crown className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Enterprise Extensions
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                These advanced modules were created because <strong>enterprises specifically requested them</strong> for their
                                business-critical workflows. They extend the free platform without limiting it.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {premiumModules.map((module, index) => {
                                const Icon = module.icon;
                                return (
                                    <Card key={index} className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        <CardContent className="p-6 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg shadow-sm">
                                                    <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 text-xs shadow-lg">
                                                    Enterprise Add-on
                                                </Badge>
                                                {!module.available && (
                                                    <Badge variant="outline" className="border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400 px-3 py-1 text-xs">
                                                        Coming Soon
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                                                {module.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <div className="mt-8 text-center">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6 max-w-3xl mx-auto">
                                <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                                    <strong>Important:</strong> These extensions don&apos;t replace or limit any free features.
                                    They&apos;re additional business tools that enterprises commissioned for their specific automation and compliance needs.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <Card className="mb-16 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 dark:from-green-900 dark:via-green-800 dark:to-emerald-900 border-0 shadow-xl text-white">
                    <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-white/20 rounded-full blur-lg" />
                                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                    <Users className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-base md:text-lg text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Start with the complete free platform. Add enterprise extensions only if your organization needs them.
                            <strong> Your choice, your pace, always free at the core.</strong>
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-2 text-sm shadow-lg" asChild>
                                <Link href="/onboarding/customer">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Join Free Forever
                                </Link>
                            </Button>
                            <Button variant="outline" className="border-white/30 text-green-600 hover:bg-white/10 backdrop-blur-sm px-6 py-2 text-sm" asChild>
                                <Link href="/plans">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    View All Plans
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
