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
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
            title: "Rollout Assistant",
            description: "Helps with enrolling configurations in a scalable and controlled way. Think about bulk assignments with Intune Update Rings in mind.",
            icon: Zap,
            isPaid: true
        },
        {
            title: "Analyser",
            description: "A tool designed to provide in-depth analysis of your Intune configurations, helping you identify potential improvements and optimizations.",
            icon: TrendingUp,
            isPaid: true
        },
        {
            title: "Historicus",
            description: "Tracks and visualizes changes in your Intune environment over time, offering insights into historical trends and configurations.",
            icon: History,
            isPaid: true
        },
        {
            title: "Configuration Comparator",
            description: "Compares different configurations side-by-side, making it easier to spot differences and ensure consistency.",
            icon: GitCompare,
            isPaid: true
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black dark:from-slate-900 dark:via-slate-950 dark:to-black">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:60px_60px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Modern geometric elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"></div>

                <div className="relative py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-white/20 rounded-full blur-lg" />
                                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                    <Target className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
                            About Intune Assistant
                        </h1>
                        <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto leading-relaxed font-light">
                            Simplifying Microsoft Intune management for the modern Cloud Engineer.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm backdrop-blur-sm">
                                Community Driven
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Mission Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <Target className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                                Our Mission
                            </h2>
                        </div>
                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-4">
                            <p className="text-center text-base md:text-lg leading-relaxed">
                                The Intune Assistant is born out of a community idea to make a platform providing assignment insights fast. It is a tool developed by <strong className="text-blue-600 dark:text-blue-400">Sander Rozemuller</strong> - Microsoft Intune MVP.
                            </p>
                            <p className="text-center text-base md:text-lg leading-relaxed">
                                In mean time, the tool has evolved into a platform that provides insights into your Microsoft Intune environment.
                            </p>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                        <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 mb-2">Recent Acquisition</h3>
                                        <p className="text-amber-700 dark:text-amber-300 text-sm md:text-base leading-relaxed mb-3">
                                            Recently, the tool has been acquired by <strong>ControlFlex</strong>. ControlFlex is a company that specializes in Automation and Microsoft Intune configurations, and they are committed to enhancing the capabilities of the Intune Assistant platform.
                                        </p>
                                        <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50" asChild>
                                            <a href="https://www.linkedin.com/company/controlflex" target="_blank" rel="noopener noreferrer">
                                                <Building2 className="h-3 w-3 mr-2" />
                                                ControlFlex LinkedIn
                                                <ExternalLink className="h-3 w-3 ml-2" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Philosophy Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                                Philosophy
                            </h2>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <div className="prose prose-lg text-gray-600 dark:text-gray-300">
                                    <p className="text-sm md:text-base leading-relaxed">
                                        The Intune Assistant is designed to be a tool that helps you understand your Microsoft Intune environment and build for the community.
                                    </p>
                                    <p className="text-sm md:text-base leading-relaxed">
                                        The Intune Assistant is not a replacement for the Microsoft Intune portal, but rather a tool that provides insights into your environment.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="font-bold text-lg text-green-800 dark:text-green-200">Community First</span>
                                    </div>
                                    <p className="text-green-700 dark:text-green-300 text-sm md:text-base leading-relaxed">
                                        This tool is built with the community in mind, and stays <strong>FREE</strong> for the community to use. Also this part of the tool keeps evolving with new features and insights.
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-bold text-lg text-blue-800 dark:text-blue-200">Web-Based Design</span>
                                    </div>
                                    <p className="text-blue-700 dark:text-blue-300 text-sm md:text-base leading-relaxed">
                                        The tools are web-based, requiring no additional resources other than a consent of an application with the least permissions possible. This enables users to get up to speed as fast as possible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                                Core Features
                            </h2>
                            <div className="flex justify-center">
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm shadow-lg">
                                    Always Free
                                </Badge>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className={`${getFeatureColorClasses(feature.color)} border-2 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                        <CardContent className="p-6 text-center h-full flex flex-col">
                                            <div className={`p-3 ${getIconColorClasses(feature.color)} rounded-xl w-fit mx-auto mb-4`}>
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                                                {feature.description}
                                            </p>
                                            <div className="mt-4">
                                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Premium Modules Section */}
                <Card className="mb-16 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                    <Crown className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                                Premium Modules
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                                Advanced features for enterprise-level Intune management and optimization.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {premiumModules.map((module, index) => {
                                const Icon = module.icon;
                                return (
                                    <Card key={index} className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        <CardContent className="p-6 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                                    <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 text-xs shadow-lg">
                                                    Premium
                                                </Badge>
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
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <Card className="mb-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 border-0 shadow-xl text-white">
                    <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-white/20 rounded-full blur-lg" />
                                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                    <Award className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                            Built by the Community, for the Community
                        </h2>
                        <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of Cloud Engineers who trust Intune Assistant to simplify their Microsoft Intune management workflows.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 text-sm shadow-lg" asChild>
                                <Link href="/onboarding/customer">
                                    Get Started
                                </Link>
                            </Button>
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-2 text-sm" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Documentation
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
