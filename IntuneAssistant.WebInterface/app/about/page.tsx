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
            icon: Shield
        },
        {
            title: "Configuration Policy Insights",
            description: "Deep understanding of your Intune configuration policies",
            icon: Target
        },
        {
            title: "All Settings Overview",
            description: "Complete visibility into all your Intune settings",
            icon: Globe
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                            <Target className="h-12 w-12" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-6">
                        About Intune Assistant
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Simplifying Microsoft Intune management for the modern Cloud Engineer.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                {/* Mission Section */}
                <Card className="mb-16 shadow-xl">
                    <CardContent className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Our Mission
                            </h2>
                        </div>
                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 space-y-4">
                            <p>
                                The Intune Assistant is born out of a community idea to make a platform providing assignment insights fast. It is a tool developed by <strong>Sander Rozemuller</strong> - Microsoft Intune MVP.
                            </p>
                            <p>
                                In mean time, the tool has evolved into a platform that provides insights into your Microsoft Intune environment.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mt-6">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Recent Acquisition</p>
                                        <p className="text-amber-700 dark:text-amber-300">
                                            Recently, the tool has been acquired by <strong>ControlFlex</strong>. ControlFlex is a company that specializes in Automation and Microsoft Intune configurations, and they are committed to enhancing the capabilities of the Intune Assistant platform.
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-3" asChild>
                                            <a href="https://www.linkedin.com/company/controlflex" target="_blank" rel="noopener noreferrer">
                                                <Building2 className="h-4 w-4 mr-1" />
                                                ControlFlex LinkedIn
                                                <ExternalLink className="h-4 w-4 ml-1" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Philosophy Section */}
                <Card className="mb-16 shadow-xl">
                    <CardContent className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                    <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Philosophy
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="prose prose-lg text-gray-600 dark:text-gray-300">
                                    <p>
                                        The Intune Assistant is designed to be a tool that helps you understand your Microsoft Intune environment and build for the community.
                                    </p>
                                    <p>
                                        The Intune Assistant is not a replacement for the Microsoft Intune portal, but rather a tool that provides insights into your environment.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="font-semibold text-green-800 dark:text-green-200">Community First</span>
                                    </div>
                                    <p className="text-green-700 dark:text-green-300">
                                        This tool is built with the community in mind, and stays <strong>FREE</strong> for the community to use. Also this part of the tool keeps evolving with new features and insights.
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="font-semibold text-blue-800 dark:text-blue-200">Web-Based Design</span>
                                    </div>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        The tools are web-based, requiring no additional resources other than a consent of an application with the least permissions possible. This enables users to get up to speed as fast as possible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Section */}
                <Card className="mb-16 shadow-xl">
                    <CardContent className="p-8 sm:p-12">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Core Features
                            </h2>
                            <div className="flex justify-center">
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2">
                                    Always Free
                                </Badge>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="border border-gray-200 dark:border-gray-700 h-full">
                                        <CardContent className="p-6 text-center h-full flex flex-col">
                                            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                                                <Icon className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 flex-1">
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
                <Card className="mb-16 shadow-xl">
                    <CardContent className="p-8 sm:p-12">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                                    <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Premium Modules
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Advanced features for enterprise-level Intune management and optimization.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {premiumModules.map((module, index) => {
                                const Icon = module.icon;
                                return (
                                    <Card key={index} className="border border-amber-200 dark:border-amber-800 h-full">
                                        <CardContent className="p-6 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                                                    <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                    Premium
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 flex-1">
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
                <Card className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-xl">
                    <CardContent className="p-8 sm:p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Award className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Built by the Community, for the Community
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of Cloud Engineers who trust Intune Assistant to simplify their Microsoft Intune management workflows.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link href="/dashboard">
                                    Get Started
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-5 w-5 mr-2" />
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
